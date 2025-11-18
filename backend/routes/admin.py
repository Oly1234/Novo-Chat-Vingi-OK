from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import List, Dict, Optional
from services.storage_service import storage_service
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/admin", tags=["admin"])

# Login attempt tracking (in-memory for simplicity, use Redis in production)
login_attempts = {}

# Models
class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str

# Auth dependency
def verify_admin(x_admin_password: str = Header(...)):
    if x_admin_password != os.getenv('ADMIN_PASSWORD'):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Login endpoint with rate limiting
@router.post("/login", response_model=LoginResponse)
async def admin_login(request: LoginRequest, req: Request):
    """Admin login with attempt tracking and rate limiting"""
    client_ip = req.client.host
    current_time = datetime.utcnow()
    
    # Check if IP is blocked
    if client_ip in login_attempts:
        attempt_data = login_attempts[client_ip]
        
        # Check if still locked
        if attempt_data.get('locked_until') and attempt_data['locked_until'] > current_time:
            remaining = (attempt_data['locked_until'] - current_time).total_seconds()
            return LoginResponse(
                success=False,
                message=f"Bloqueado. Aguarde {int(remaining/60)} minutos"
            )
        
        # Reset if lock expired
        if attempt_data.get('locked_until') and attempt_data['locked_until'] <= current_time:
            login_attempts[client_ip] = {'attempts': 0, 'last_attempt': current_time}
    
    # Verify password
    if request.password == os.getenv('ADMIN_PASSWORD'):
        # Success - reset attempts
        if client_ip in login_attempts:
            del login_attempts[client_ip]
        
        return LoginResponse(success=True, message="Login successful")
    
    # Failed attempt
    if client_ip not in login_attempts:
        login_attempts[client_ip] = {'attempts': 0, 'last_attempt': current_time}
    
    login_attempts[client_ip]['attempts'] += 1
    login_attempts[client_ip]['last_attempt'] = current_time
    
    # Lock after 3 failed attempts
    if login_attempts[client_ip]['attempts'] >= 3:
        login_attempts[client_ip]['locked_until'] = current_time + timedelta(minutes=30)
        return LoginResponse(
            success=False,
            message="Bloqueado por 30 minutos após 3 tentativas incorretas"
        )
    
    attempts_left = 3 - login_attempts[client_ip]['attempts']
    return LoginResponse(
        success=False,
        message=f"Senha incorreta. {attempts_left} tentativas restantes"
    )

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

@router.post("/queue/assign")
async def assign_to_agent(
    request: dict,
    authorized: bool = Depends(verify_admin)
):
    """Assign session to agent"""
    try:
        session_id = request.get('sessionId')
        agent_id = request.get('agentId')
        
        await storage_service.db['sessions'].update_one(
            {'id': session_id},
            {'$set': {'status': 'human', 'currentAgentId': agent_id}}
        )
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_all_sessions(authorized: bool = Depends(verify_admin)):
    """Get all sessions"""
    try:
        sessions = await storage_service.db['sessions'].find(
            {},
            {'_id': 0}
        ).sort('startedAt', -1).to_list(1000)
        
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}")
async def get_session_details(
    session_id: str,
    authorized: bool = Depends(verify_admin)
):
    """Get session details with messages"""
    try:
        session = await storage_service.db['sessions'].find_one(
            {'id': session_id},
            {'_id': 0}
        )
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages = await storage_service.get_messages(session_id)
        
        return {
            "session": session,
            "messages": messages
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
