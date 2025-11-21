#!/usr/bin/env python3
"""
Backend Test Suite for VINGI System with Tickets
Tests complete system including new ticket functionality and existing Firebase features
"""

import requests
import json
import time
from datetime import datetime
import uuid

# Configuration
BASE_URL = "http://localhost:8001/api"
ADMIN_PASSWORD = "v1ng1t3x"

class BackendTester:
    def __init__(self):
        self.session_id = None
        self.candidate_id = None
        self.ticket_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}: {details}")
    
    # ========== TICKET SYSTEM TESTS (NEW - PRIORITY) ==========
    
    def test_create_ticket(self):
        """Test POST /api/tickets/ - Create new ticket"""
        try:
            ticket_data = {
                "titulo": "Problema com estamparia digital",
                "descricao": "Precisamos de suporte técnico para impressora",
                "departamento": "Técnico",
                "assunto": "Suporte Técnico",
                "prioridade": "alta",
                "tipo": "tecnico",
                "solicitante": {
                    "nome": "João Silva",
                    "email": "joao@vingi.com.br",
                    "telefone": "(11) 98765-4321"
                },
                "tags": ["urgente", "impressora"],
                "prazoHoras": 4
            }
            
            response = requests.post(f"{BASE_URL}/tickets/", json=ticket_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'numero' in data and 'sla' in data:
                    self.ticket_id = data['id']
                    self.log_test("Create Ticket", True, 
                                f"Ticket #{data['numero']} created with ID: {self.ticket_id}")
                    return True
                else:
                    self.log_test("Create Ticket", False, 
                                "Missing id, numero or sla in response")
            else:
                self.log_test("Create Ticket", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Create Ticket", False, f"Exception: {str(e)}")
        return False
    
    def test_list_tickets(self):
        """Test POST /api/tickets/list - List tickets (Admin)"""
        try:
            headers = {"x-admin-password": ADMIN_PASSWORD}
            response = requests.post(f"{BASE_URL}/tickets/list", 
                                   json={}, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("List Tickets", True, 
                                f"Retrieved {len(data)} tickets")
                    return True
                else:
                    self.log_test("List Tickets", False, 
                                "Response is not a list")
            else:
                self.log_test("List Tickets", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("List Tickets", False, f"Exception: {str(e)}")
        return False
    
    def test_get_ticket(self):
        """Test GET /api/tickets/{ticket_id} - Get ticket details"""
        if not self.ticket_id:
            self.log_test("Get Ticket", False, "No ticket ID available")
            return False
            
        try:
            response = requests.get(f"{BASE_URL}/tickets/{self.ticket_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'titulo' in data and 'status' in data:
                    self.log_test("Get Ticket", True, 
                                f"Ticket details retrieved: {data['titulo']}")
                    return True
                else:
                    self.log_test("Get Ticket", False, 
                                "Missing required fields in response")
            else:
                self.log_test("Get Ticket", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Ticket", False, f"Exception: {str(e)}")
        return False
    
    def test_update_ticket_status(self):
        """Test PATCH /api/tickets/{ticket_id} - Update ticket status"""
        if not self.ticket_id:
            self.log_test("Update Ticket Status", False, "No ticket ID available")
            return False
            
        try:
            headers = {"x-admin-password": ADMIN_PASSWORD}
            update_data = {"status": "em_andamento"}
            
            response = requests.patch(f"{BASE_URL}/tickets/{self.ticket_id}", 
                                    json=update_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'em_andamento':
                    self.log_test("Update Ticket Status", True, 
                                "Status updated to 'em_andamento'")
                    return True
                else:
                    self.log_test("Update Ticket Status", False, 
                                f"Status not updated correctly: {data.get('status')}")
            else:
                self.log_test("Update Ticket Status", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Update Ticket Status", False, f"Exception: {str(e)}")
        return False
    
    def test_add_comment(self):
        """Test POST /api/tickets/comment - Add comment to ticket"""
        if not self.ticket_id:
            self.log_test("Add Comment", False, "No ticket ID available")
            return False
            
        try:
            headers = {"x-admin-password": ADMIN_PASSWORD}
            comment_data = {
                "ticketId": self.ticket_id,
                "texto": "Estamos analisando o problema",
                "interno": False
            }
            
            response = requests.post(f"{BASE_URL}/tickets/comment", 
                                   json=comment_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_test("Add Comment", True, 
                                "Comment added successfully")
                    return True
                else:
                    self.log_test("Add Comment", False, 
                                f"Comment not added: {data}")
            else:
                self.log_test("Add Comment", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Add Comment", False, f"Exception: {str(e)}")
        return False
    
    def test_ticket_stats(self):
        """Test GET /api/tickets/stats/overview - Get ticket statistics"""
        try:
            headers = {"x-admin-password": ADMIN_PASSWORD}
            response = requests.get(f"{BASE_URL}/tickets/stats/overview", 
                                  headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['total', 'novos', 'emAndamento', 'resolvidos', 'vencidos']
                if all(field in data for field in required_fields):
                    self.log_test("Ticket Stats", True, 
                                f"Stats: {data['total']} total, {data['novos']} novos, {data['vencidos']} vencidos")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Ticket Stats", False, 
                                f"Missing fields: {missing}")
            else:
                self.log_test("Ticket Stats", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Ticket Stats", False, f"Exception: {str(e)}")
        return False
        
    # ========== EXISTING CHAT & FIREBASE TESTS ==========
        
    def test_chat_session_start(self):
        """Test POST /api/chat/start - Create new chat session"""
        try:
            response = requests.post(f"{BASE_URL}/chat/start", 
                                   json={"userId": "test_user_firebase"})
            
            if response.status_code == 200:
                data = response.json()
                if 'sessionId' in data and 'userId' in data:
                    self.session_id = data['sessionId']
                    self.log_test("Chat Session Start", True, 
                                f"Session created: {self.session_id}")
                    return True
                else:
                    self.log_test("Chat Session Start", False, 
                                "Missing sessionId or userId in response")
            else:
                self.log_test("Chat Session Start", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Chat Session Start", False, f"Exception: {str(e)}")
        return False
    
    def test_chat_message(self):
        """Test POST /api/chat/message - Send message and get AI response"""
        if not self.session_id:
            self.log_test("Chat Message", False, "No session ID available")
            return False
            
        try:
            response = requests.post(f"{BASE_URL}/chat/message", 
                                   json={
                                       "sessionId": self.session_id,
                                       "text": "Olá, preciso de informações sobre a empresa"
                                   })
            
            if response.status_code == 200:
                data = response.json()
                if 'messageId' in data and 'aiResponse' in data:
                    self.log_test("Chat Message", True, 
                                f"AI responded: {data['aiResponse'].get('text', '')[:50]}...")
                    return True
                else:
                    self.log_test("Chat Message", False, 
                                "Missing messageId or aiResponse in response")
            else:
                self.log_test("Chat Message", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Chat Message", False, f"Exception: {str(e)}")
        return False
    
    def test_get_session(self):
        """Test GET /api/chat/session/{session_id} - Verify session and messages saved"""
        if not self.session_id:
            self.log_test("Get Session", False, "No session ID available")
            return False
            
        try:
            response = requests.get(f"{BASE_URL}/chat/session/{self.session_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'session' in data and 'messages' in data:
                    messages_count = len(data['messages'])
                    self.log_test("Get Session", True, 
                                f"Session retrieved with {messages_count} messages")
                    return True
                else:
                    self.log_test("Get Session", False, 
                                "Missing session or messages in response")
            else:
                self.log_test("Get Session", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Session", False, f"Exception: {str(e)}")
        return False
    
    def test_admin_login(self):
        """Test POST /api/admin/login - Admin authentication"""
        try:
            response = requests.post(f"{BASE_URL}/admin/login", 
                                   json={"password": ADMIN_PASSWORD})
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_test("Admin Login", True, "Admin login successful")
                    return True
                else:
                    self.log_test("Admin Login", False, 
                                f"Login failed: {data.get('message', 'Unknown error')}")
            else:
                self.log_test("Admin Login", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
        return False
    
    def test_knowledge_base_add(self):
        """Test POST /api/admin/knowledge-base - Add knowledge base items"""
        try:
            headers = {"X-Admin-Password": ADMIN_PASSWORD}
            test_items = [
                {
                    "category": "EMPRESA",
                    "title": "Teste Firebase",
                    "content": "Este é um teste da migração para Firebase"
                }
            ]
            
            response = requests.post(f"{BASE_URL}/admin/knowledge-base", 
                                   json={"items": test_items},
                                   headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_test("Knowledge Base Add", True, "Knowledge base updated")
                    return True
                else:
                    self.log_test("Knowledge Base Add", False, 
                                f"Update failed: {data}")
            else:
                self.log_test("Knowledge Base Add", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Knowledge Base Add", False, f"Exception: {str(e)}")
        return False
    
    def test_knowledge_base_get(self):
        """Test GET /api/admin/knowledge-base - Verify knowledge base saved"""
        try:
            headers = {"X-Admin-Password": ADMIN_PASSWORD}
            response = requests.get(f"{BASE_URL}/admin/knowledge-base", 
                                  headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'items' in data:
                    items_count = len(data['items'])
                    self.log_test("Knowledge Base Get", True, 
                                f"Retrieved {items_count} knowledge base items")
                    return True
                else:
                    self.log_test("Knowledge Base Get", False, 
                                "Missing items in response")
            else:
                self.log_test("Knowledge Base Get", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Knowledge Base Get", False, f"Exception: {str(e)}")
        return False
    
    def test_candidate_submit(self):
        """Test POST /api/candidates/submit - Create candidate"""
        if not self.session_id:
            self.log_test("Candidate Submit", False, "No session ID available")
            return False
            
        try:
            candidate_data = {
                "sessionId": self.session_id,
                "name": "João Silva Firebase",
                "phone": "(11) 98765-4321",
                "email": "joao.firebase@test.com",
                "position": "Desenvolvedor",
                "experience": "3 anos",
                "availability": "Imediato"
            }
            
            response = requests.post(f"{BASE_URL}/candidates/submit", 
                                   json=candidate_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'candidateId' in data:
                    self.candidate_id = data['candidateId']
                    self.log_test("Candidate Submit", True, 
                                f"Candidate created: {self.candidate_id}")
                    return True
                else:
                    self.log_test("Candidate Submit", False, 
                                "Missing candidateId in response")
            else:
                self.log_test("Candidate Submit", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Candidate Submit", False, f"Exception: {str(e)}")
        return False
    
    def test_candidates_list(self):
        """Test GET /api/candidates/list - List candidates (admin)"""
        try:
            headers = {"X-Admin-Password": ADMIN_PASSWORD}
            response = requests.get(f"{BASE_URL}/candidates/list", 
                                  headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'candidates' in data:
                    candidates_count = len(data['candidates'])
                    self.log_test("Candidates List", True, 
                                f"Retrieved {candidates_count} candidates")
                    return True
                else:
                    self.log_test("Candidates List", False, 
                                "Missing candidates in response")
            else:
                self.log_test("Candidates List", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Candidates List", False, f"Exception: {str(e)}")
        return False
    
    def test_whatsapp_config_save(self):
        """Test POST /api/config/whatsapp - Save WhatsApp config"""
        try:
            headers = {"X-Admin-Password": ADMIN_PASSWORD}
            config_data = {
                "departments": [
                    {
                        "name": "SUPORTE",
                        "displayName": "Suporte Técnico",
                        "phone": "5511999999999",
                        "message": "Olá! Você foi direcionado para o suporte técnico."
                    },
                    {
                        "name": "VENDAS",
                        "displayName": "Vendas",
                        "phone": "5511888888888",
                        "message": "Olá! Você foi direcionado para vendas."
                    }
                ]
            }
            
            response = requests.post(f"{BASE_URL}/config/whatsapp", 
                                   json=config_data,
                                   headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_test("WhatsApp Config Save", True, "Config saved successfully")
                    return True
                else:
                    self.log_test("WhatsApp Config Save", False, 
                                f"Save failed: {data}")
            else:
                self.log_test("WhatsApp Config Save", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("WhatsApp Config Save", False, f"Exception: {str(e)}")
        return False
    
    def test_whatsapp_config_get(self):
        """Test GET /api/config/whatsapp - Verify WhatsApp config saved"""
        try:
            response = requests.get(f"{BASE_URL}/config/whatsapp")
            
            if response.status_code == 200:
                data = response.json()
                if 'departments' in data:
                    departments_count = len(data['departments'])
                    self.log_test("WhatsApp Config Get", True, 
                                f"Retrieved {departments_count} departments")
                    return True
                else:
                    self.log_test("WhatsApp Config Get", False, 
                                "Missing departments in response")
            else:
                self.log_test("WhatsApp Config Get", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("WhatsApp Config Get", False, f"Exception: {str(e)}")
        return False
    
    def test_rating_submit(self):
        """Test POST /api/ratings/submit - Submit rating"""
        if not self.session_id:
            self.log_test("Rating Submit", False, "No session ID available")
            return False
            
        try:
            rating_data = {
                "sessionId": self.session_id,
                "rating": 5,
                "feedback": "Excelente atendimento! Teste Firebase funcionando."
            }
            
            response = requests.post(f"{BASE_URL}/ratings/submit", 
                                   json=rating_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') == True:
                    self.log_test("Rating Submit", True, 
                                f"Rating submitted: {rating_data['rating']} stars")
                    return True
                else:
                    self.log_test("Rating Submit", False, 
                                f"Submit failed: {data.get('message', 'Unknown error')}")
            else:
                self.log_test("Rating Submit", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Rating Submit", False, f"Exception: {str(e)}")
        return False
    
    def test_rating_stats(self):
        """Test GET /api/ratings/stats - Get rating statistics"""
        try:
            response = requests.get(f"{BASE_URL}/ratings/stats")
            
            if response.status_code == 200:
                data = response.json()
                if 'averageRating' in data and 'totalRatings' in data:
                    self.log_test("Rating Stats", True, 
                                f"Stats: {data['totalRatings']} ratings, avg {data['averageRating']}")
                    return True
                else:
                    self.log_test("Rating Stats", False, 
                                "Missing rating statistics in response")
            else:
                self.log_test("Rating Stats", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Rating Stats", False, f"Exception: {str(e)}")
        return False
    
    def test_admin_sessions(self):
        """Test GET /api/admin/sessions - List all sessions (admin)"""
        try:
            headers = {"X-Admin-Password": ADMIN_PASSWORD}
            response = requests.get(f"{BASE_URL}/admin/sessions", 
                                  headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'sessions' in data:
                    sessions_count = len(data['sessions'])
                    self.log_test("Admin Sessions", True, 
                                f"Retrieved {sessions_count} sessions")
                    return True
                else:
                    self.log_test("Admin Sessions", False, 
                                "Missing sessions in response")
            else:
                self.log_test("Admin Sessions", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Admin Sessions", False, f"Exception: {str(e)}")
        return False
    
    def test_admin_stats(self):
        """Test GET /api/admin/stats - Get general statistics (admin)"""
        try:
            headers = {"X-Admin-Password": ADMIN_PASSWORD}
            response = requests.get(f"{BASE_URL}/admin/stats", 
                                  headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['totalSessions', 'totalMessages', 'activeSessions', 'waitingQueue']
                if all(field in data for field in required_fields):
                    self.log_test("Admin Stats", True, 
                                f"Stats: {data['totalSessions']} sessions, {data['totalMessages']} messages")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Admin Stats", False, 
                                f"Missing fields: {missing}")
            else:
                self.log_test("Admin Stats", False, 
                            f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Admin Stats", False, f"Exception: {str(e)}")
        return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting VINGI System with Tickets - Complete Backend Tests")
        print("=" * 70)
        
        # Test sequence as specified in review request
        tests = [
            # PART 1: TICKET SYSTEM (NEW - MAXIMUM PRIORITY)
            ("1. Create Ticket", self.test_create_ticket),
            ("2. List Tickets (Admin)", self.test_list_tickets),
            ("3. Get Ticket", self.test_get_ticket),
            ("4. Update Ticket Status", self.test_update_ticket_status),
            ("5. Add Comment", self.test_add_comment),
            ("6. Ticket Statistics", self.test_ticket_stats),
            
            # PART 2: CHAT & EXISTING FUNCTIONALITIES
            ("7. Chat Session Start", self.test_chat_session_start),
            ("8. Chat Message", self.test_chat_message),
            ("9. Admin Login", self.test_admin_login),
            ("10. Knowledge Base Get", self.test_knowledge_base_get),
            
            # PART 3: FIREBASE PERSISTENCE (Selected Tests)
            ("11. Candidate Submit", self.test_candidate_submit),
            ("12. WhatsApp Config Get", self.test_whatsapp_config_get),
            ("13. Rating Submit", self.test_rating_submit),
            ("14. Admin Stats", self.test_admin_stats)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            if test_func():
                passed += 1
            else:
                failed += 1
            time.sleep(0.5)  # Small delay between tests
        
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ PASSED: {passed}")
        print(f"❌ FAILED: {failed}")
        print(f"📈 SUCCESS RATE: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Firebase migration is working correctly.")
        else:
            print(f"\n⚠️  {failed} tests failed. Check the details above.")
        
        return passed, failed

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()