"""
Firebase Service - Complete implementation for Firestore
Replaces MongoDB with Firebase/Firestore for all data persistence
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from datetime import datetime, timezone
import uuid
from typing import Dict, List, Optional
from pathlib import Path

class FirebaseService:
    def __init__(self):
        self._db = None
        self._bucket = None
        self._initialized = False
    
    def _initialize(self):
        """Initialize Firebase Admin SDK with service account"""
        if self._initialized:
            return
        
        try:
            # Path to service account key
            cred_path = Path(__file__).parent.parent / 'firebase-credentials.json'
            
            if not cred_path.exists():
                raise Exception(f'Firebase credentials not found at {cred_path}')
            
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                cred = credentials.Certificate(str(cred_path))
                firebase_admin.initialize_app(cred, {
                    'storageBucket': 'agenda-44f53.firebasestorage.app'
                })
            
            self._db = firestore.client()
            
            try:
                self._bucket = storage.bucket()
            except Exception as e:
                print(f'Storage bucket not available: {e}')
                self._bucket = None
            
            self._initialized = True
            print('Firebase initialized successfully!')
            
        except Exception as e:
            print(f'Firebase initialization error: {e}')
            raise e
    
    @property
    def db(self):
        if not self._initialized:
            self._initialize()
        return self._db
    
    @property
    def bucket(self):
        if not self._initialized:
            self._initialize()
        return self._bucket
    
    # Session Methods
    async def create_session(self, user_id: str = None) -> Dict:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        session_data = {
            'id': session_id,
            'userId': user_id or f'anon_{uuid.uuid4().hex[:8]}',
            'startedAt': firestore.SERVER_TIMESTAMP,
            'status': 'ai',
            'department': None,
            'currentAgentId': None,
            'metadata': {}
        }
        
        self.db.collection('sessions').document(session_id).set(session_data)
        session_data['startedAt'] = datetime.now(timezone.utc)
        return session_data
    
    async def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session by ID"""
        doc = self.db.collection('sessions').document(session_id).get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    
    async def update_session(self, session_id: str, data: Dict) -> bool:
        """Update session data"""
        try:
            self.db.collection('sessions').document(session_id).update(data)
            return True
        except Exception as e:
            print(f'Error updating session: {e}')
            return False
    
    async def get_all_sessions(self, limit: int = 100) -> List[Dict]:
        """Get all sessions"""
        sessions = []
        docs = self.db.collection('sessions').order_by('startedAt', direction=firestore.Query.DESCENDING).limit(limit).stream()
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            sessions.append(data)
        return sessions
    
    # Message Methods
    async def add_message(self, session_id: str, sender: str, text: str, attachments: List = None) -> Dict:
        """Add a message to a session"""
        message_id = str(uuid.uuid4())
        message_data = {
            'id': message_id,
            'sessionId': session_id,
            'sender': sender,
            'text': text,
            'attachments': attachments or [],
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        
        self.db.collection('messages').document(message_id).set(message_data)
        message_data['timestamp'] = datetime.now(timezone.utc)
        return message_data
    
    async def get_messages(self, session_id: str, limit: int = 50) -> List[Dict]:
        """Get messages for a session"""
        messages = []
        # Query without order_by to avoid composite index requirement
        query = self.db.collection('messages').where('sessionId', '==', session_id).limit(limit * 2)
        
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id
            messages.append(data)
        
        # Sort in Python instead of Firestore to avoid composite index
        messages.sort(key=lambda x: x.get('timestamp') or datetime.min.replace(tzinfo=timezone.utc))
        
        return messages[:limit]
    
    # WhatsApp Config Methods
    async def get_whatsapp_config(self) -> List[Dict]:
        """Get WhatsApp departments configuration"""
        doc = self.db.collection('config').document('whatsapp').get()
        if doc.exists:
            data = doc.to_dict()
            return data.get('departments', [])
        return []
    
    async def update_whatsapp_config(self, departments: List[Dict]) -> bool:
        """Update WhatsApp departments configuration"""
        try:
            self.db.collection('config').document('whatsapp').set({
                'departments': departments,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            print(f'Error updating WhatsApp config: {e}')
            return False
    
    # Knowledge Base Methods
    async def get_knowledge_base(self) -> List[Dict]:
        """Get knowledge base items"""
        doc = self.db.collection('config').document('knowledge_base').get()
        if doc.exists:
            data = doc.to_dict()
            return data.get('items', [])
        return []
    
    async def update_knowledge_base(self, items: List[Dict]) -> bool:
        """Update knowledge base"""
        try:
            self.db.collection('config').document('knowledge_base').set({
                'items': items,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            print(f'Error updating knowledge base: {e}')
            return False
    
    async def add_knowledge_item(self, item: Dict) -> bool:
        """Add single knowledge base item"""
        try:
            doc = self.db.collection('config').document('knowledge_base').get()
            items = []
            if doc.exists:
                items = doc.to_dict().get('items', [])
            
            items.append(item)
            
            self.db.collection('config').document('knowledge_base').set({
                'items': items,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            print(f'Error adding knowledge item: {e}')
            return False
    
    # Candidate Methods
    async def create_candidate(self, data: Dict) -> Dict:
        """Create candidate record"""
        candidate_id = str(uuid.uuid4())
        candidate_data = {
            **data,
            'id': candidate_id,
            'submittedAt': firestore.SERVER_TIMESTAMP
        }
        
        self.db.collection('candidates').document(candidate_id).set(candidate_data)
        candidate_data['submittedAt'] = datetime.now(timezone.utc)
        return candidate_data
    
    async def get_candidate(self, candidate_id: str) -> Optional[Dict]:
        """Get candidate by ID"""
        doc = self.db.collection('candidates').document(candidate_id).get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    
    async def get_candidates(self, status: str = None, limit: int = 100) -> List[Dict]:
        """Get candidates list"""
        query = self.db.collection('candidates')
        
        if status:
            query = query.where('status', '==', status)
        
        query = query.order_by('submittedAt', direction=firestore.Query.DESCENDING).limit(limit)
        
        candidates = []
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id
            candidates.append(data)
        
        return candidates
    
    async def update_candidate(self, candidate_id: str, data: Dict) -> bool:
        """Update candidate"""
        try:
            self.db.collection('candidates').document(candidate_id).update(data)
            return True
        except Exception as e:
            print(f'Error updating candidate: {e}')
            return False
    
    # Rating Methods
    async def save_rating(self, rating_data: Dict) -> Dict:
        """Save user rating"""
        rating_id = str(uuid.uuid4())
        rating_data['id'] = rating_id
        rating_data['createdAt'] = firestore.SERVER_TIMESTAMP
        
        self.db.collection('ratings').document(rating_id).set(rating_data)
        rating_data['createdAt'] = datetime.now(timezone.utc)
        return rating_data
    
    async def get_rating_stats(self) -> Dict:
        """Get rating statistics"""
        ratings = []
        docs = self.db.collection('ratings').stream()
        
        for doc in docs:
            data = doc.to_dict()
            if 'rating' in data:
                ratings.append(data['rating'])
        
        if not ratings:
            return {
                'averageRating': 0,
                'totalRatings': 0,
                'distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
            }
        
        avg_rating = sum(ratings) / len(ratings)
        distribution = {i: ratings.count(i) for i in range(1, 6)}
        
        return {
            'averageRating': round(avg_rating, 2),
            'totalRatings': len(ratings),
            'distribution': distribution
        }
    
    # Admin Login Attempts (Security)
    async def record_login_attempt(self, success: bool) -> None:
        """Record admin login attempt"""
        attempt_id = str(uuid.uuid4())
        attempt_data = {
            'id': attempt_id,
            'success': success,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        self.db.collection('admin_login_attempts').document(attempt_id).set(attempt_data)
    
    async def get_recent_failed_attempts(self, minutes: int = 15) -> int:
        """Get count of recent failed login attempts"""
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        
        docs = self.db.collection('admin_login_attempts').where('success', '==', False).stream()
        
        count = 0
        for doc in docs:
            data = doc.to_dict()
            if 'timestamp' in data:
                timestamp = data['timestamp']
                if hasattr(timestamp, 'replace'):
                    if timestamp > cutoff:
                        count += 1
        
        return count
    
    # Queue Methods
    async def add_to_queue(self, session_id: str, department: str, priority: int = 1) -> Dict:
        """Add session to human handoff queue"""
        queue_id = str(uuid.uuid4())
        queue_data = {
            'id': queue_id,
            'sessionId': session_id,
            'department': department,
            'priority': priority,
            'waitingSince': firestore.SERVER_TIMESTAMP,
            'status': 'waiting'
        }
        
        self.db.collection('queue').document(queue_id).set(queue_data)
        queue_data['waitingSince'] = datetime.now(timezone.utc)
        return queue_data
    
    async def get_queue(self, department: str = None) -> List[Dict]:
        """Get waiting queue"""
        query = self.db.collection('queue').where('status', '==', 'waiting')
        
        if department:
            query = query.where('department', '==', department)
        
        queue = []
        for doc in query.stream():
            data = doc.to_dict()
            data['id'] = doc.id
            queue.append(data)
        
        return queue
    
    # File Upload Methods
    async def upload_file(self, file_data: bytes, filename: str, content_type: str) -> Optional[str]:
        """Upload file to Firebase Storage"""
        if not self.bucket:
            return f'/uploads/{uuid.uuid4()}_{filename}'
        
        try:
            blob = self.bucket.blob(f'uploads/{uuid.uuid4()}_{filename}')
            blob.upload_from_string(file_data, content_type=content_type)
            blob.make_public()
            return blob.public_url
        except Exception as e:
            print(f'Upload error: {e}')
            return None
    
    # Generic CRUD operations for any collection
    async def create_document(self, collection: str, data: Dict, doc_id: str = None) -> str:
        """Create a document in any collection"""
        try:
            if doc_id:
                self.db.collection(collection).document(doc_id).set(data)
                return doc_id
            else:
                doc_ref = self.db.collection(collection).add(data)
                return doc_ref[1].id
        except Exception as e:
            print(f'Error creating document: {e}')
            raise e
    
    async def get_document(self, collection: str, doc_id: str) -> Optional[Dict]:
        """Get a single document from any collection"""
        try:
            doc = self.db.collection(collection).document(doc_id).get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            print(f'Error getting document: {e}')
            return None
    
    async def get_documents(self, collection: str, filters: Dict = None, limit: int = 1000) -> List[Dict]:
        """Get all documents from a collection with optional filters"""
        try:
            query = self.db.collection(collection)
            
            if filters:
                for field, value in filters.items():
                    query = query.where(field, '==', value)
            
            docs = query.limit(limit).stream()
            
            results = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            return results
        except Exception as e:
            print(f'Error getting documents: {e}')
            return []
    
    async def update_document(self, collection: str, doc_id: str, data: Dict) -> bool:
        """Update a document in any collection"""
        try:
            self.db.collection(collection).document(doc_id).update(data)
            return True
        except Exception as e:
            print(f'Error updating document: {e}')
            return False
    
    async def delete_document(self, collection: str, doc_id: str) -> bool:
        """Delete a document from any collection"""
        try:
            self.db.collection(collection).document(doc_id).delete()
            return True
        except Exception as e:
            print(f'Error deleting document: {e}')
            return False

# Singleton instance
firebase_service = FirebaseService()
