from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Optional
from services import storage_service
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/config", tags=["config"])

# Models
class WhatsAppDepartment(BaseModel):
    name: str
    displayName: str
    phone: str
    message: Optional[str] = None

class WhatsAppConfigRequest(BaseModel):
    departments: List[WhatsAppDepartment]

class WhatsAppConfigResponse(BaseModel):
    departments: List[Dict]

# Auth dependency
def verify_admin_password(x_admin_password: str = Header(...)):
    admin_password = os.getenv('ADMIN_PASSWORD')
    if not admin_password or x_admin_password != admin_password:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Routes
@router.get("/whatsapp", response_model=WhatsAppConfigResponse)
async def get_whatsapp_config():
    """Get WhatsApp departments configuration (public)"""
    try:
        departments = await storage_service.get_whatsapp_config()
        return WhatsAppConfigResponse(departments=departments)
    except Exception as e:
        logger.error(f"Error getting WhatsApp config: {e}")
        raise HTTPException(status_code=500, detail="Failed to get configuration")

@router.post("/whatsapp")
async def update_whatsapp_config(
    request: WhatsAppConfigRequest,
    authorized: bool = Depends(verify_admin_password)
):
    """Update WhatsApp departments configuration (admin only)"""
    try:
        departments_data = [dept.model_dump() for dept in request.departments]
        success = await storage_service.update_whatsapp_config(departments_data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update configuration")
        
        return {
            "success": True,
            "message": "Configuration updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating WhatsApp config: {e}")
        raise HTTPException(status_code=500, detail="Failed to update configuration")
