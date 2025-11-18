from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta, timezone
from services.firebase_service import firebase_service
import os
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Auth
def verify_admin(x_admin_password: str = Header(...)):
    if x_admin_password != os.getenv('ADMIN_PASSWORD'):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Models
class AnalyticsResponse(BaseModel):
    totalSessions: int
    totalMessages: int
    avgMessagesPerSession: float
    topDepartments: Dict[str, int]
    avgRating: float
    sessionsByDay: List[Dict]

# Routes
@router.get("/dashboard", response_model=AnalyticsResponse)
async def get_dashboard_analytics(authorized: bool = Depends(verify_admin)):
    """Get dashboard analytics"""
    try:
        # Get all sessions
        all_sessions = await firebase_service.get_all_sessions(limit=1000)
        total_sessions = len(all_sessions)
        
        # Count messages
        total_messages = 0
        messages_ref = firebase_service.db.collection('messages').limit(1000).stream()
        for _ in messages_ref:
            total_messages += 1
        
        # Calculate average
        avg_messages = total_messages / total_sessions if total_sessions > 0 else 0
        
        # Top departments
        dept_counts = {}
        for session in all_sessions:
            dept = session.get('department')
            if dept:
                dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
        # Get rating stats
        rating_stats = await firebase_service.get_rating_stats()
        
        # Sessions by day (last 7 days)
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        daily_counts = {}
        for session in all_sessions:
            started_at = session.get('startedAt')
            if started_at and hasattr(started_at, 'date'):
                date_str = started_at.date().isoformat()
                if started_at > seven_days_ago:
                    daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
        
        sessions_by_day = [{'date': k, 'count': v} for k, v in sorted(daily_counts.items())]
        
        return AnalyticsResponse(
            totalSessions=total_sessions,
            totalMessages=total_messages,
            avgMessagesPerSession=round(avg_messages, 2),
            topDepartments=dept_counts,
            avgRating=rating_stats.get('averageRating', 0),
            sessionsByDay=sessions_by_day
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/sessions")
async def export_sessions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    authorized: bool = Depends(verify_admin)
):
    """Export sessions to CSV"""
    try:
        sessions = await firebase_service.get_all_sessions(limit=1000)
        
        # Filter by date if provided
        if start_date:
            start = datetime.fromisoformat(start_date)
            sessions = [s for s in sessions if s.get('startedAt') and s['startedAt'] >= start]
        if end_date:
            end = datetime.fromisoformat(end_date)
            sessions = [s for s in sessions if s.get('startedAt') and s['startedAt'] <= end]
        
        # Create CSV
        output = io.StringIO()
        if sessions:
            writer = csv.DictWriter(output, fieldnames=sessions[0].keys())
            writer.writeheader()
            writer.writerows(sessions)
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=sessions.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/candidates")
async def export_candidates(authorized: bool = Depends(verify_admin)):
    """Export candidates to CSV"""
    try:
        candidates = await firebase_service.get_candidates(limit=1000)
        
        # Create CSV
        output = io.StringIO()
        if candidates:
            writer = csv.DictWriter(output, fieldnames=candidates[0].keys())
            writer.writeheader()
            writer.writerows(candidates)
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=candidates.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
