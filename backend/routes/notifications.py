from fastapi import APIRouter, Header, HTTPException
from typing import List
from datetime import datetime, timedelta
import os
from services.firebase_service import get_documents, create_document

router = APIRouter(prefix="/notifications", tags=["notifications"])
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'v1ng1t3x')

@router.get("")
async def get_notifications(x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        # Check for new tickets, messages, etc in last 5 minutes
        five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
        
        notifications = []
        
        # Check new tickets
        tickets = await get_documents('tickets')
        new_tickets = [t for t in tickets if datetime.fromisoformat(t.get('criadoEm', '2000-01-01')) > five_mins_ago]
        
        for ticket in new_tickets:
            notifications.append({
                "type": "ticket",
                "title": "Novo Ticket",
                "message": f"#{ticket.get('numero')} - {ticket.get('titulo', 'Sem título')}",
                "timestamp": ticket.get('criadoEm')
            })
        
        return notifications
    except Exception as e:
        # Retornar lista vazia em caso de erro
        return []
