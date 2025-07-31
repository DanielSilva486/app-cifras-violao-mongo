import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from fastapi import FastAPI, HTTPException, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from bson import ObjectId
from typing import List

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# --- MODELO DE DADOS (PYDANTIC) ---
# Define a estrutura que nossos dados de cifra devem ter
class Cifra(BaseModel):
    id: str = Field(alias="_id", default_factory=lambda: str(ObjectId()))
    titulo: str
    artista: str
    tom: str
    categoria: str
    letra: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Cria a aplicação FastAPI
app = FastAPI()

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

if not MONGO_URI:
    raise ValueError("A variável de ambiente MONGO_URI não foi encontrada")

try:
    client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
    client.admin.command('ping')
    print("Ping enviado! Você se conectou com sucesso ao MongoDB!")
    db = client['app-cifras'] # Seleciona o banco de dados aqui
    cifras_collection = db['cifras'] # Seleciona a coleção aqui
except Exception as e:
    print(f"Erro ao conectar ao MongoDB: {e}")
    client = None

# --- ROTAS DA API ---

@app.get("/")
def home():
    return {"message": "Servidor Backend está no ar!"}

# --- ROTA PARA BUSCAR TODAS AS CIFRAS ---
@app.get("/api/cifras", response_model=List[Cifra])
async def get_todas_as_cifras():
    if client is None:
        raise HTTPException(status_code=500, detail="Não foi possível conectar ao banco de dados.")
    
    cifras_cursor = cifras_collection.find({})
    lista_cifras = [Cifra(**cifra) for cifra in cifras_cursor]
    return lista_cifras

# --- ROTA PARA CRIAR UMA NOVA CIFRA ---
@app.post("/api/cifras", response_model=Cifra, status_code=201)
async def criar_cifra(cifra: Cifra = Body(...)):
    if client is None:
        raise HTTPException(status_code=500, detail="Não foi possível conectar ao banco de dados.")

    try:
        # Converte o modelo Pydantic para um dicionário para inserir no MongoDB
        cifra_dict = cifra.model_dump(by_alias=True, exclude=["id"])
        
        # Insere a nova cifra no banco de dados
        result = cifras_collection.insert_one(cifra_dict)
        
        # Busca a cifra recém-criada para retornar ao frontend
        created_cifra = cifras_collection.find_one({"_id": result.inserted_id})

        return Cifra(**created_cifra)

    except Exception as e:
        # Se der erro ao salvar, agora ele vai avisar!
        raise HTTPException(status_code=500, detail=f"Erro ao salvar a cifra: {e}")