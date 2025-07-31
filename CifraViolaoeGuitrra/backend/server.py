# Arquivo: backend/server.py

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from fastapi import FastAPI, HTTPException, Body, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from bson import ObjectId
from typing import List, Optional

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# --- MODELO DE DADOS (PYDANTIC) ---
# Define a estrutura que nossos dados de cifra devem ter
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        schema.update(type="string")
        return schema

class CifraModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    titulo: str = Field(...)
    artista: str = Field(...)
    tom: str = Field(...)
    categoria: str = Field(...)
    letra: str = Field(...)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Cria a aplicação FastAPI
app = FastAPI(
    title="API de Cifras de Violão",
    description="API para gerenciar uma coleção de cifras musicais.",
    version="1.0.0"
)

# --- CONFIGURAÇÃO DO CORS ---
origins = ["*"] # Permite todas as origens por simplicidade

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURAÇÃO DA CONEXÃO COM O MONGODB ---
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client["app-cifras"]
cifras_collection = db["cifras"]

@app.on_event("startup")
def startup_db_client():
    try:
        client.admin.command('ping')
        print("Ping enviado! Você se conectou com sucesso ao MongoDB!")
    except Exception as e:
        print(f"Erro ao conectar ao MongoDB: {e}")

@app.on_event("shutdown")
def shutdown_db_client():
    client.close()

# --- ROTAS DA API ---

@app.get("/", summary="Rota principal da API")
def home():
    return {"message": "Servidor Backend está no ar!"}

@app.post("/api/cifras", response_description="Adicionar nova cifra", response_model=CifraModel, status_code=status.HTTP_201_CREATED)
def criar_cifra(cifra: CifraModel = Body(...)):
    cifra_dict = cifra.model_dump(by_alias=True, exclude=["id"])
    result = cifras_collection.insert_one(cifra_dict)
    created_cifra = cifras_collection.find_one({"_id": result.inserted_id})
    if created_cifra:
        return created_cifra
    raise HTTPException(status_code=400, detail="Não foi possível criar a cifra.")

@app.get("/api/cifras", response_description="Listar todas as cifras", response_model=List[CifraModel])
def listar_cifras():
    cifras = list(cifras_collection.find({}))
    return cifras

@app.get("/api/cifras/{id}", response_description="Buscar uma cifra por ID", response_model=CifraModel)
def buscar_cifra(id: str):
    cifra = cifras_collection.find_one({"_id": ObjectId(id)})
    if cifra:
        return cifra
    raise HTTPException(status_code=404, detail=f"Cifra com ID {id} não encontrada.")

@app.put("/api/cifras/{id}", response_description="Atualizar uma cifra", response_model=CifraModel)
def atualizar_cifra(id: str, cifra: CifraModel = Body(...)):
    cifra_dict = {k: v for k, v in cifra.model_dump(by_alias=True).items() if v is not None}
    update_result = cifras_collection.update_one({"_id": ObjectId(id)}, {"$set": cifra_dict})

    if update_result.modified_count == 1:
        updated_cifra = cifras_collection.find_one({"_id": ObjectId(id)})
        if updated_cifra:
            return updated_cifra
            
    existing_cifra = cifras_collection.find_one({"_id": ObjectId(id)})
    if existing_cifra:
        return existing_cifra

    raise HTTPException(status_code=404, detail=f"Cifra com ID {id} não encontrada.")

@app.delete("/api/cifras/{id}", response_description="Deletar uma cifra")
def deletar_cifra(id: str):
    delete_result = cifras_collection.delete_one({"_id": ObjectId(id)})

    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)
        
    raise HTTPException(status_code=404, detail=f"Cifra com ID {id} não encontrada.")