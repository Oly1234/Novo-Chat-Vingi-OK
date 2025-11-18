from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Dict, Optional
from services.storage_service import storage_service
from datetime import datetime
import os

router = APIRouter(prefix="/admin", tags=["admin"])

# Auth dependency
def verify_admin(x_admin_password: str = Header(...)):
    if x_admin_password != os.getenv('ADMIN_PASSWORD'):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Models
class KnowledgeBaseItem(BaseModel):
    category: str
    title: str
    content: str

class KnowledgeBaseUpdate(BaseModel):
    items: List[KnowledgeBaseItem]

# Knowledge Base Endpoints
@router.get("/knowledge-base")
async def get_knowledge_base(authorized: bool = Depends(verify_admin)):
    """Get all knowledge base items"""
    try:
        kb = await storage_service.get_knowledge_base()
        return {"items": kb}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/knowledge-base")
async def update_knowledge_base(
    data: KnowledgeBaseUpdate,
    authorized: bool = Depends(verify_admin)
):
    """Update knowledge base"""
    try:
        success = await storage_service.update_knowledge_base([item.model_dump() for item in data.items])
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update")
        return {"success": True, "message": "Knowledge base updated"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Queue Management
@router.get("/queue")
async def get_queue(authorized: bool = Depends(verify_admin)):
    """Get current queue"""
    try:
        queue = await storage_service.get_queue()
        return {"queue": queue}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Statistics
@router.get("/stats")
async def get_stats(authorized: bool = Depends(verify_admin)):
    """Get system statistics"""
    try:
        # Get stats from MongoDB
        total_sessions = await storage_service.sessions.count_documents({})
        total_messages = await storage_service.messages.count_documents({})
        active_sessions = await storage_service.sessions.count_documents({"status": "ai"})
        waiting_queue = await storage_service.queue.count_documents({"status": "waiting"})
        
        # Department distribution
        dept_stats = await storage_service.sessions.aggregate([
            {"$match": {"department": {"$ne": None}}},
            {"$group": {"_id": "$department", "count": {"$sum": 1}}}
        ]).to_list(length=100)
        
        return {
            "totalSessions": total_sessions,
            "totalMessages": total_messages,
            "activeSessions": active_sessions,
            "waitingQueue": waiting_queue,
            "departmentStats": dept_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat History
@router.get("/sessions")
async def get_sessions(
    limit: int = 50,
    authorized: bool = Depends(verify_admin)
):
    """Get recent sessions"""
    try:
        sessions = await storage_service.sessions.find().sort("startedAt", -1).limit(limit).to_list(length=limit)
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    authorized: bool = Depends(verify_admin)
):
    """Get messages for a session"""
    try:
        messages = await storage_service.get_messages(session_id)
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
