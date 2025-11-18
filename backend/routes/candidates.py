from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from services.firebase_service import firebase_service
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/candidates", tags=["candidates"])

# Auth
def verify_admin(x_admin_password: str = Header(...)):
    if x_admin_password != os.getenv('ADMIN_PASSWORD'):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Models
class CandidateData(BaseModel):
    sessionId: str
    name: str
    phone: str
    email: Optional[str] = None
    position: Optional[str] = None
    experience: Optional[str] = None
    availability: Optional[str] = None

class CandidateResponse(BaseModel):
    candidateId: str
    message: str

# Submit candidate
@router.post("/submit", response_model=CandidateResponse)
async def submit_candidate(data: CandidateData):
    """Submit candidate information"""
    try:
        candidate = await storage_service.create_candidate({
            'sessionId': data.sessionId,
            'name': data.name,
            'phone': data.phone,
            'email': data.email,
            'position': data.position,
            'experience': data.experience,
            'availability': data.availability,
            'status': 'new',
            'submittedAt': datetime.utcnow(),
            'resumeUrl': None,
            'notes': []
        })
        
        return CandidateResponse(
            candidateId=candidate['id'],
            message="Dados recebidos! Agora envie seu currículo."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Upload resume
@router.post("/upload-resume")
async def upload_resume(
    candidateId: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload candidate resume"""
    try:
        # Validate file
        if file.size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File too large")
        
        allowed_types = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Only PDF and DOC allowed")
        
        # Save file (simplified - in production use proper storage)
        file_content = await file.read()
        file_url = await storage_service.upload_file(
            file_content, 
            file.filename, 
            file.content_type
        )
        
        # Update candidate
        await storage_service.update_candidate(candidateId, {
            'resumeUrl': file_url,
            'status': 'submitted'
        })
        
        return {
            "success": True,
            "message": "Currículo recebido! Entraremos em contato em breve."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin: List candidates
@router.get("/list")
async def list_candidates(
    status: Optional[str] = None,
    limit: int = 50,
    authorized: bool = Depends(verify_admin)
):
    """Get candidates list (admin)"""
    try:
        candidates = await storage_service.get_candidates(status, limit)
        return {"candidates": candidates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin: Get candidate details
@router.get("/{candidate_id}")
async def get_candidate(
    candidate_id: str,
    authorized: bool = Depends(verify_admin)
):
    """Get candidate details"""
    try:
        candidate = await storage_service.get_candidate(candidate_id)
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        return candidate
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Admin: Update candidate status
@router.patch("/{candidate_id}")
async def update_candidate_status(
    candidate_id: str,
    status: str,
    notes: Optional[str] = None,
    authorized: bool = Depends(verify_admin)
):
    """Update candidate status"""
    try:
        update_data = {'status': status}
        if notes:
            update_data['notes'] = notes
        
        success = await storage_service.update_candidate(candidate_id, update_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
