from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from services.firebase_service import firebase_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ratings", tags=["ratings"])

# Models
class RatingSubmit(BaseModel):
    sessionId: str
    rating: int
    feedback: Optional[str] = None

class RatingResponse(BaseModel):
    success: bool
    message: str

# Routes
@router.post("/submit", response_model=RatingResponse)
async def submit_rating(data: RatingSubmit):
    """Submit user rating"""
    try:
        if data.rating < 1 or data.rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        # Get session to verify it exists
        session = await firebase_service.get_session(data.sessionId)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Save rating to Firestore
        rating_doc = {
            'sessionId': data.sessionId,
            'userId': session.get('userId'),
            'rating': data.rating,
            'feedback': data.feedback,
            'department': session.get('department')
        }
        
        await firebase_service.save_rating(rating_doc)
        
        logger.info(f"Rating submitted: {data.rating} stars for session {data.sessionId}")
        
        return RatingResponse(
            success=True,
            message="Obrigado pela sua avaliação!"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting rating: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit rating")

@router.get("/stats")
async def get_rating_stats():
    """Get rating statistics (admin only)"""
    try:
        stats = await firebase_service.get_rating_stats()
        return stats
    except Exception as e:
        logger.error(f"Error getting rating stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get rating stats")
