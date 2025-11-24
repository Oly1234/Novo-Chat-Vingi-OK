from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
from services.firebase_service import get_document, update_document, create_document

router = APIRouter(prefix="/settings", tags=["settings"])
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'v1ng1t3x')

class SettingsModel(BaseModel):
    general: Optional[Dict[str, Any]] = None
    notifications: Optional[Dict[str, Any]] = None
    ai: Optional[Dict[str, Any]] = None
    workingHours: Optional[Dict[str, Any]] = None
    departments: Optional[list] = None

@router.get("")
async def get_settings(x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        # Buscar configurações do Firebase
        settings = await get_document('settings', 'main')
        
        if not settings:
            # Retornar configurações padrão
            return {
                "general": {
                    "companyName": "Vingi Têxtil",
                    "supportEmail": "contato@vingitextil.com.br",
                    "timezone": "America/Sao_Paulo"
                },
                "notifications": {
                    "sound": True,
                    "desktop": True,
                    "email": False,
                    "newTicket": True,
                    "newMessage": True
                },
                "ai": {
                    "model": "gpt-3.5-turbo",
                    "temperature": 0.7,
                    "maxTokens": 500,
                    "autoRouting": True,
                    "sentiment": True
                }
            }
        
        return settings
    except Exception as e:
        # Retornar padrão em caso de erro
        return {
            "general": {
                "companyName": "Vingi Têxtil",
                "supportEmail": "contato@vingitextil.com.br",
                "timezone": "America/Sao_Paulo"
            },
            "notifications": {
                "sound": True,
                "desktop": True,
                "email": False
            },
            "ai": {
                "model": "gpt-3.5-turbo",
                "temperature": 0.7,
                "maxTokens": 500
            }
        }

@router.post("")
async def save_settings(settings: SettingsModel, x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        settings_dict = settings.dict(exclude_none=True)
        
        # Verificar se documento existe
        existing = await get_document('settings', 'main')
        
        if existing:
            await update_document('settings', 'main', settings_dict)
        else:
            settings_dict['id'] = 'main'
            await create_document('settings', settings_dict, doc_id='main')
        
        return {"message": "Settings saved successfully", "settings": settings_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
