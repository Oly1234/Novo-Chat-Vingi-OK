from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
from services.firebase_service import firebase_service


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize Firebase (replaces MongoDB)
try:
    firebase_service._initialize()
    print("✅ Firebase inicializado com sucesso!")
except Exception as e:
    print(f"❌ Erro ao inicializar Firebase: {e}")
    raise e

# Create the main app without a prefix
app = FastAPI(title="Vingi Chat API", version="2.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Save to Firestore
    doc = status_obj.model_dump()
    doc_id = doc['id']
    firebase_service.db.collection('status_checks').document(doc_id).set(doc)
    
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Get from Firestore
    status_checks = []
    docs = firebase_service.db.collection('status_checks').limit(1000).stream()
    
    for doc in docs:
        data = doc.to_dict()
        status_checks.append(StatusCheck(**data))
    
    return status_checks

# Import all routers
from routes import chat_router, config_router
from routes.tickets import router as tickets_router
try:
    from routes.admin import router as admin_router
    HAS_ADMIN = True
except:
    HAS_ADMIN = False

try:
    from routes.candidates import router as candidates_router
    HAS_CANDIDATES = True
except:
    HAS_CANDIDATES = False

# Try to import ratings router
try:
    from routes.ratings import router as ratings_router
    HAS_RATINGS = True
except:
    HAS_RATINGS = False

# Try to import analytics router
try:
    from routes.analytics import router as analytics_router
    HAS_ANALYTICS = True
except:
    HAS_ANALYTICS = False

# Try to import tags router
try:
    from routes.tags import router as tags_router
    HAS_TAGS = True
except:
    HAS_TAGS = False

# Try to import customers router
try:
    from routes.customers import router as customers_router
    HAS_CUSTOMERS = True
except:
    HAS_CUSTOMERS = False

# Try to import notifications router
try:
    from routes.notifications import router as notifications_router
    HAS_NOTIFICATIONS = True
except:
    HAS_NOTIFICATIONS = False

# Try to import dashboard router
try:
    from routes.dashboard import router as dashboard_router
    HAS_DASHBOARD = True
except:
    HAS_DASHBOARD = False

# Try to import search router
try:
    from routes.search import router as search_router
    HAS_SEARCH = True
except:
    HAS_SEARCH = False

# Try to import ai_agents router
try:
    from routes.ai_agents import router as ai_agents_router
    HAS_AI_AGENTS = True
except:
    HAS_AI_AGENTS = False

# Try to import settings router
try:
    from routes.settings import router as settings_router
    HAS_SETTINGS = True
except:
    HAS_SETTINGS = False

# Try to import knowledge router
try:
    from routes.knowledge import router as knowledge_router
    HAS_KNOWLEDGE = True
except:
    HAS_KNOWLEDGE = False

# Include routers
api_router.include_router(chat_router)
api_router.include_router(config_router)
api_router.include_router(tickets_router)
if HAS_ADMIN:
    api_router.include_router(admin_router)
if HAS_CANDIDATES:
    api_router.include_router(candidates_router)
if HAS_RATINGS:
    api_router.include_router(ratings_router)
if HAS_ANALYTICS:
    api_router.include_router(analytics_router)
if HAS_TAGS:
    api_router.include_router(tags_router)
if HAS_CUSTOMERS:
    api_router.include_router(customers_router)
if HAS_NOTIFICATIONS:
    api_router.include_router(notifications_router)
if HAS_DASHBOARD:
    api_router.include_router(dashboard_router)
if HAS_SEARCH:
    api_router.include_router(search_router)
if HAS_AI_AGENTS:
    api_router.include_router(ai_agents_router)
if HAS_SETTINGS:
    api_router.include_router(settings_router)
if HAS_KNOWLEDGE:
    api_router.include_router(knowledge_router)

# Include the main router in the app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_app():
    print("Aplicação encerrada")