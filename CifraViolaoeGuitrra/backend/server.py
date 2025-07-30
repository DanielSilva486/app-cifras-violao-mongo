import os
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware # << IMPORTANTE: Importamos o CORS

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Cria a aplicação FastAPI
app = FastAPI()

# --- CONFIGURAÇÃO DO CORS ---
# Lista de origens que têm permissão para fazer requisições
origins = [
    "http://localhost:3000",      # Endereço do seu app React rodando localmente
    # "https://seu-nome-de-site.netlify.app", # << IMPORTANTE: Adicione a URL do seu site no Netlify aqui quando souber
    "*" # Para testes iniciais, permite todas as origens. Troque pela URL específica em produção.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)
# --- FIM DA CONFIGURAÇÃO DO CORS ---


# --- CONFIGURAÇÃO DA CONEXÃO COM O MONGODB ---

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("A variável de ambiente MONGO_URI não foi encontrada no arquivo .env")

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Ping enviado! Você se conectou com sucesso ao MongoDB!")
except Exception as e:
    print(f"Erro ao conectar ao MongoDB: {e}")
    client = None

# --- ROTAS DA SUA API ---

@app.get("/")
def home():
    return {"message": "Servidor Backend está no ar!"}

@app.get("/api/test-db")
def test_db():
    if client is None:
        return JSONResponse(status_code=500, content={"message": "Erro: Não foi possível conectar ao banco de dados."})
    
    try:
        db = client['app-cifras'] 
        collection = db['cifras']
        count = collection.count_documents({})
        return {"message": f"Conexão com o banco de dados bem-sucedida! Existem {count} documentos na coleção 'cifras'."}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Ocorreu um erro ao acessar a coleção: {e}"})