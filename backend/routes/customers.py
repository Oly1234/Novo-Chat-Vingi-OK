from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
from services.firebase_service import (
    create_document, get_documents, get_document, 
    update_document, delete_document
)

router = APIRouter(prefix="/customers", tags=["customers"])
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'v1ng1t3x')

class CustomerModel(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    city: Optional[str] = None
    tags: List[str] = []
    notes: Optional[str] = None
    status: str = 'active'

@router.get("")
async def get_customers(x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        customers = await get_documents('customers')
        
        # Calculate stats
        total = len(customers)
        active = len([c for c in customers if c.get('status') == 'active'])
        inactive = len([c for c in customers if c.get('status') == 'inactive'])
        vip = len([c for c in customers if 'VIP' in c.get('tags', [])])
        
        return {
            "customers": customers,
            "stats": {"total": total, "active": active, "inactive": inactive, "vip": vip}
        }
    except Exception as e:
        # Retornar vazio em caso de erro
        return {
            "customers": [],
            "stats": {"total": 0, "active": 0, "inactive": 0, "vip": 0}
        }

@router.post("")
async def create_customer(customer: CustomerModel, x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        customer_data = customer.dict()
        customer_data['createdAt'] = datetime.utcnow().isoformat()
        customer_data['ticketsCount'] = 0
        
        customer_id = await create_document('customers', customer_data)
        return {"id": customer_id, **customer_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{customer_id}")
async def update_customer(customer_id: str, customer: CustomerModel, x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        await update_document('customers', customer_id, customer.dict())
        return {"id": customer_id, **customer.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{customer_id}")
async def delete_customer(customer_id: str, x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        await delete_document('customers', customer_id)
        return {"message": "Customer deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
