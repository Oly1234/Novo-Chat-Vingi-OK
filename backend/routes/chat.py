from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
from typing import List, Optional, Dict
from services.firebase_service import firebase_service
from services.openai_service import openai_service
from services.whatsapp_service import whatsapp_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# Request/Response Models
class StartSessionRequest(BaseModel):
    userId: Optional[str] = None

class StartSessionResponse(BaseModel):
    sessionId: str
    userId: str

class SendMessageRequest(BaseModel):
    sessionId: str
    text: str
    attachments: Optional[List[Dict]] = []

class SendMessageResponse(BaseModel):
    messageId: str
    aiResponse: Dict
    department: Optional[str] = None

class HandoffRequest(BaseModel):
    sessionId: str
    reason: Optional[str] = None

class GetWhatsAppURLRequest(BaseModel):
    sessionId: str
    department: str

class GetWhatsAppURLResponse(BaseModel):
    url: str
    department: str
    phone: str

# Routes
@router.post("/start", response_model=StartSessionResponse)
async def start_session(request: StartSessionRequest):
    """Start a new chat session"""
    try:
        session = await firebase_service.create_session(request.userId)
        return StartSessionResponse(
            sessionId=session['id'],
            userId=session['userId']
        )
    except Exception as e:
        logger.error(f"Error starting session: {e}")
        raise HTTPException(status_code=500, detail="Failed to start session")

@router.post("/message", response_model=SendMessageResponse)
async def send_message(request: SendMessageRequest):
    """Send a message and get AI response"""
    try:
        # Get session
        session = await firebase_service.get_session(request.sessionId)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Add user message to Firestore
        user_message = await firebase_service.add_message(
            session_id=request.sessionId,
            sender='user',
            text=request.text,
            attachments=request.attachments
        )
        
        # Get conversation history
        messages = await firebase_service.get_messages(request.sessionId)
        
        # Get knowledge base
        knowledge_base = await firebase_service.get_knowledge_base()
        
        # Detect department if not already set
        current_department = session.get('department')
        if not current_department and len(messages) > 0:
            # Try to detect from the first user message
            detected = await openai_service._detect_department(messages[-1]['text'])
            if detected:
                current_department = detected
                # Save to session immediately
                await firebase_service.update_session(
                    request.sessionId,
                    {'department': detected}
                )
        
        # Get AI response with knowledge base and correct department
        ai_response = await openai_service.chat(
            messages=[{'sender': msg['sender'], 'text': msg['text']} for msg in messages],
            department=current_department,
            knowledge_base=knowledge_base
        )
        
        # Save AI response
        ai_message = await firebase_service.add_message(
            session_id=request.sessionId,
            sender='ai',
            text=ai_response['text'],
            attachments=[]
        )
        
        # Update department if detected during conversation (fallback)
        if ai_response.get('department') and not current_department:
            await firebase_service.update_session(
                request.sessionId,
                {'department': ai_response['department']}
            )
            current_department = ai_response['department']
        
        return SendMessageResponse(
            messageId=ai_message['id'],
            aiResponse={'text': ai_response['text']},
            department=current_department
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")

@router.post("/upload")
async def upload_file(
    sessionId: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload a file to Firebase Storage"""
    try:
        # Validate file size (5MB max)
        file_content = await file.read()
        if len(file_content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        
        # Validate file type
        allowed_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/png',
            'image/jpeg'
        ]
        
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="File type not allowed")
        
        # Upload to Firebase Storage
        url = await storage_service.upload_file(
            file_data=file_content,
            filename=file.filename,
            content_type=file.content_type
        )
        
        if not url:
            raise HTTPException(status_code=500, detail="Failed to upload file")
        
        return {
            "url": url,
            "filename": file.filename,
            "contentType": file.content_type,
            "size": len(file_content)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")

@router.post("/handoff")
async def request_handoff(request: HandoffRequest):
    """Request human handoff"""
    try:
        # Get session
        session = await storage_service.get_session(request.sessionId)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Update session status
        await storage_service.update_session(
            request.sessionId,
            {'status': 'waiting'}
        )
        
        # Add to queue
        department = session.get('department', 'SUPORTE')
        queue_item = await storage_service.add_to_queue(
            session_id=request.sessionId,
            department=department,
            priority=1
        )
        
        # Add system message
        await storage_service.add_message(
            session_id=request.sessionId,
            sender='system',
            text='Você foi adicionado à fila de atendimento. Em breve um atendente entrará em contato.',
            attachments=[]
        )
        
        return {
            "success": True,
            "queueId": queue_item['id'],
            "message": "Added to queue"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error requesting handoff: {e}")
        raise HTTPException(status_code=500, detail="Failed to request handoff")

@router.post("/whatsapp", response_model=GetWhatsAppURLResponse)
async def get_whatsapp_url(request: GetWhatsAppURLRequest):
    """Get WhatsApp URL for specific department"""
    try:
        # Get session
        session = await storage_service.get_session(request.sessionId)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get WhatsApp config
        whatsapp_config = await storage_service.get_whatsapp_config()
        
        # Find department
        department_config = next(
            (dept for dept in whatsapp_config if dept['name'] == request.department),
            None
        )
        
        if not department_config:
            raise HTTPException(status_code=404, detail="Department not found")
        
        # Build context message
        message = whatsapp_service.build_context_message(session, request.department)
        
        # Generate URL
        url = whatsapp_service.generate_url(
            phone=department_config['phone'],
            message=message
        )
        
        return GetWhatsAppURLResponse(
            url=url,
            department=request.department,
            phone=department_config['phone']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting WhatsApp URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate WhatsApp URL")

@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get session details"""
    try:
        session = await storage_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages = await storage_service.get_messages(session_id)
        
        return {
            "session": session,
            "messages": messages
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session")
