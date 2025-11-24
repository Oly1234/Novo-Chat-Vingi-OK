from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.ai_agent_service import agent_router

router = APIRouter(prefix="/api/ai-agents", tags=["ai-agents"])

class AgentMessage(BaseModel):
    sessionId: str
    message: str
    currentAgent: Optional[str] = None

@router.post("/process")
async def process_with_agent(data: AgentMessage):
    """Processa mensagem com sistema de agentes inteligentes"""
    try:
        result = await agent_router.route_message(
            message=data.message,
            current_agent=data.currentAgent
        )
        
        return {
            "success": True,
            "response": result['response'],
            "agent": result['agent'],
            "department": result['department'],
            "confidence": result['confidence']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents")
async def list_agents():
    """Lista todos os agentes dispon\u00edveis"""
    return {
        "agents": [
            {"id": "triagem", "name": "Agente de Triagem", "icon": "\ud83d\udc4b"},
            {"id": "vendas", "name": "Agente de Vendas", "icon": "\ud83d\udcb0"},
            {"id": "suporte", "name": "Agente de Suporte", "icon": "\ud83d\udd27"},
            {"id": "rh", "name": "Agente de RH", "icon": "\ud83d\udc64"},
            {"id": "amostras", "name": "Agente de Amostras", "icon": "\ud83d\udce6"}
        ]
    }
