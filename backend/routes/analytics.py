from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from services.storage_service import storage_service
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
        # Get sessions count
        total_sessions = await storage_service.db['sessions'].count_documents({})
        
        # Get messages count
        total_messages = await storage_service.db['messages'].count_documents({})
        
        # Calculate average
        avg_messages = total_messages / total_sessions if total_sessions > 0 else 0
        
        # Top departments
        pipeline = [
            {'$match': {'department': {'$ne': None}}},
            {'$group': {'_id': '$department', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}}
        ]
        dept_results = await storage_service.db['sessions'].aggregate(pipeline).to_list(10)
        top_departments = {r['_id']: r['count'] for r in dept_results}
        
        # Get rating stats
        rating_stats = await storage_service.get_rating_stats()
        
        # Sessions by day (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        pipeline = [
            {'$match': {'startedAt': {'$gte': seven_days_ago}}},
            {'$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$startedAt'}},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        daily_results = await storage_service.db['sessions'].aggregate(pipeline).to_list(7)
        sessions_by_day = [{'date': r['_id'], 'count': r['count']} for r in daily_results]
        
        return AnalyticsResponse(
            totalSessions=total_sessions,
            totalMessages=total_messages,
            avgMessagesPerSession=round(avg_messages, 2),
            topDepartments=top_departments,
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
        query = {}
        if start_date:
            query['startedAt'] = {'$gte': datetime.fromisoformat(start_date)}
        if end_date:
            if 'startedAt' in query:
                query['startedAt']['$lte'] = datetime.fromisoformat(end_date)
            else:
                query['startedAt'] = {'$lte': datetime.fromisoformat(end_date)}
        
        sessions = await storage_service.db['sessions'].find(query, {'_id': 0}).to_list(1000)
        
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
        candidates = await storage_service.db['candidates'].find({}, {'_id': 0}).to_list(1000)
        
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
