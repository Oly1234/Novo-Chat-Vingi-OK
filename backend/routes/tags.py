from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from services.storage_service import storage_service
import os
import uuid

router = APIRouter(prefix="/tags", tags=["tags"])

# Auth
def verify_admin(x_admin_password: str = Header(...)):
    if x_admin_password != os.getenv('ADMIN_PASSWORD'):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# Models
class TagCreate(BaseModel):
    name: str
    color: str
    description: Optional[str] = None

class TagResponse(BaseModel):
    id: str
    name: str
    color: str
    description: Optional[str]
    createdAt: datetime

class SessionTagRequest(BaseModel):
    sessionId: str
    tagIds: List[str]

# Routes
@router.get("/list", response_model=List[TagResponse])
async def list_tags(authorized: bool = Depends(verify_admin)):
    """List all tags"""
    try:
        tags = await storage_service.db['tags'].find({}, {'_id': 0}).to_list(100)
        return tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create", response_model=TagResponse)
async def create_tag(tag: TagCreate, authorized: bool = Depends(verify_admin)):
    """Create a new tag"""
    try:
        tag_doc = {
            'id': str(uuid.uuid4()),
            'name': tag.name,
            'color': tag.color,
            'description': tag.description,
            'createdAt': datetime.utcnow()
        }
        
        await storage_service.db['tags'].insert_one(tag_doc)
        return TagResponse(**tag_doc)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/session/assign")
async def assign_tags_to_session(
    request: SessionTagRequest,
    authorized: bool = Depends(verify_admin)
):
    """Assign tags to a session"""
    try:
        result = await storage_service.db['sessions'].update_one(
            {'id': request.sessionId},
            {'$set': {'tags': request.tagIds}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {"success": True, "message": "Tags assigned"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{session_id}")
async def get_session_tags(
    session_id: str,
    authorized: bool = Depends(verify_admin)
):
    """Get tags for a session"""
    try:
        session = await storage_service.db['sessions'].find_one(
            {'id': session_id},
            {'_id': 0, 'tags': 1}
        )
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        tag_ids = session.get('tags', [])
        if not tag_ids:
            return []
        
        tags = await storage_service.db['tags'].find(
            {'id': {'$in': tag_ids}},
            {'_id': 0}
        ).to_list(100)
        
        return tags
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: str,
    authorized: bool = Depends(verify_admin)
):
    """Delete a tag"""
    try:
        result = await storage_service.db['tags'].delete_one({'id': tag_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Tag not found")
        
        # Remove tag from all sessions
        await storage_service.db['sessions'].update_many(
            {'tags': tag_id},
            {'$pull': {'tags': tag_id}}
        )
        
        return {"success": True, "message": "Tag deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
