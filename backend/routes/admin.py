from fastapi import APIRouter, HTTPException, Depends, Header, Request
from pydantic import BaseModel
from typing import List, Dict, Optional
from services.firebase_service import firebase_service
from datetime import datetime, timedelta, timezone
import os

router = APIRouter(prefix="/admin", tags=["admin"])

# Adicionar rota de sessões no final do arquivo depois vou inserir
@router.get("/sessions")
async def get_sessions(x_admin_password: str = Header(None)):
    """Retorna todas as sessões de chat salvas no Firebase"""
    if x_admin_password != os.getenv('ADMIN_PASSWORD'):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        sessions = await firebase_service.get_documents('sessions')
        # Ordenar por data mais recente
        sessions_sorted = sorted(
            sessions, 
            key=lambda x: x.get('timestamp', ''), 
            reverse=True
        )
        return sessions_sorted
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        return []

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
    current_time = datetime.now(timezone.utc)
    
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
        # Success - reset attempts and record in Firebase
        if client_ip in login_attempts:
            del login_attempts[client_ip]
        await firebase_service.record_login_attempt(success=True)
        
        return LoginResponse(success=True, message="Login successful")
    
    # Failed attempt - record in Firebase
    await firebase_service.record_login_attempt(success=False)
    
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
        kb = await firebase_service.get_knowledge_base()
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
        success = await firebase_service.update_knowledge_base([item.model_dump() for item in data.items])
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
        queue = await firebase_service.get_queue()
        return {"queue": queue}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Statistics
@router.get("/stats")
async def get_stats(authorized: bool = Depends(verify_admin)):
    """Get system statistics"""
    try:
        # Get stats from Firestore
        all_sessions = await firebase_service.get_all_sessions(limit=1000)
        total_sessions = len(all_sessions)
        active_sessions = len([s for s in all_sessions if s.get('status') == 'ai'])
        
        # Count messages (simplified)
        total_messages = 0
        messages_ref = firebase_service.db.collection('messages').limit(1000).stream()
        for _ in messages_ref:
            total_messages += 1
        
        # Count queue
        queue = await firebase_service.get_queue()
        waiting_queue = len(queue)
        
        # Department distribution
        dept_stats = {}
        for session in all_sessions:
            dept = session.get('department')
            if dept:
                dept_stats[dept] = dept_stats.get(dept, 0) + 1
        
        dept_list = [{"_id": k, "count": v} for k, v in dept_stats.items()]
        
        return {
            "totalSessions": total_sessions,
            "totalMessages": total_messages,
            "activeSessions": active_sessions,
            "waitingQueue": waiting_queue,
            "departmentStats": dept_list
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
        
        await firebase_service.update_session(
            session_id,
            {'status': 'human', 'currentAgentId': agent_id}
        )
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_all_sessions(authorized: bool = Depends(verify_admin)):
    """Get all sessions"""
    try:
        sessions = await firebase_service.get_all_sessions(limit=1000)
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
        session = await firebase_service.get_session(session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages = await firebase_service.get_messages(session_id)
        
        return {
            "session": session,
            "messages": messages
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
