from openai import OpenAI
import os
from typing import List, Dict, Optional
import json

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class AIAgent:
    """Classe base para agentes de IA especializados"""
    def __init__(self, name: str, role: str, instructions: str, temperature: float = 0.7):
        self.name = name
        self.role = role
        self.instructions = instructions
        self.temperature = temperature
        self.conversation_history = []
    
    async def process_message(self, message: str, context: Optional[Dict] = None) -> Dict:
        """Processa mensagem e retorna resposta do agente"""
        try:
            system_message = {
                "role": "system",
                "content": f"{self.instructions}\n\nVoc\u00ea \u00e9 {self.name}, respons\u00e1vel por {self.role}."
            }
            
            messages = [system_message] + self.conversation_history + [
                {"role": "user", "content": message}
            ]
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=self.temperature,
                max_tokens=500
            )
            
            ai_response = response.choices[0].message.content
            
            # Adicionar ao hist\u00f3rico
            self.conversation_history.append({"role": "user", "content": message})
            self.conversation_history.append({"role": "assistant", "content": ai_response})
            
            # Manter apenas \u00faltimas 10 mensagens
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]
            
            return {
                "agent": self.name,
                "response": ai_response,
                "confidence": 0.9,
                "requires_transfer": self._check_transfer_needed(ai_response)
            }
        except Exception as e:
            return {
                "agent": self.name,
                "response": f"Desculpe, ocorreu um erro: {str(e)}",
                "confidence": 0.0,
                "requires_transfer": False
            }
    
    def _check_transfer_needed(self, response: str) -> bool:
        """Verifica se \u00e9 necess\u00e1rio transferir para outro agente"""
        transfer_keywords = [
            "n\u00e3o posso ajudar", "fora da minha especialidade",
            "transferir", "outro departamento", "outro agente"
        ]
        return any(keyword in response.lower() for keyword in transfer_keywords)

class AgentRouter:
    """Roteador inteligente de agentes"""
    def __init__(self):
        self.agents = self._initialize_agents()
        self.current_agent = None
    
    def _initialize_agents(self) -> Dict[str, AIAgent]:
        """Inicializa todos os agentes especializados"""
        return {
            "triagem": AIAgent(
                name="Agente de Triagem",
                role="Recep\u00e7\u00e3o e direcionamento inicial",
                instructions="""Voc\u00ea \u00e9 o primeiro contato com clientes da Vingi T\u00eaxtil.
                Suas responsabilidades:
                1. Dar boas-vindas calorosas
                2. Identificar a necessidade do cliente
                3. Direcionar para o agente especializado correto
                
                Agentes dispon\u00edveis:
                - VENDAS: Or\u00e7amentos, produtos, pre\u00e7os, pedidos
                - SUPORTE: Problemas t\u00e9cnicos, reclama\u00e7\u00f5es, d\u00favidas sobre produtos
                - RH: Vagas, curr\u00edculos, entrevistas, trabalhe conosco
                - AMOSTRAS: Solicita\u00e7\u00e3o de amostras, cat\u00e1logos
                
                Seja educado, objetivo e eficiente.""",
                temperature=0.7
            ),
            
            "vendas": AIAgent(
                name="Agente de Vendas",
                role="Vendas e or\u00e7amentos",
                instructions="""Voc\u00ea \u00e9 especialista em vendas da Vingi T\u00eaxtil.
                Especialidades:
                - Malhas para moda (cotton, viscose, linho)
                - Tecidos para fitness (poliamida, polister, dry-fit)
                - Tecidos para decora\u00e7\u00e3o (linho, algod\u00e3o, oxford)
                - Estamparia digital em cilindro rotativo
                
                Procedimento:
                1. Entenda a necessidade do cliente (quantidade, tipo, uso)
                2. Sugira produtos adequados
                3. Colete informa\u00e7\u00f5es para or\u00e7amento (email, quantidade)
                4. Ofere\u00e7a amostras se aplic\u00e1vel
                
                Seja consultivo, n\u00e3o apenas vendedor.""",
                temperature=0.6
            ),
            
            "suporte": AIAgent(
                name="Agente de Suporte T\u00e9cnico",
                role="Suporte t\u00e9cnico e solu\u00e7\u00e3o de problemas",
                instructions="""Voc\u00ea \u00e9 o especialista em suporte da Vingi T\u00eaxtil.
                Responsabilidades:
                1. Resolver problemas com produtos
                2. Explicar caracter\u00edsticas t\u00e9cnicas dos tecidos
                3. Orientar sobre cuidados e lavagem
                4. Registrar reclama\u00e7\u00f5es formais
                
                Sempre:
                - Pe\u00e7a detalhes do problema
                - Seja emp\u00e1tico
                - Ofere\u00e7a solu\u00e7\u00f5es pr\u00e1ticas
                - Escale para supervisor se necess\u00e1rio""",
                temperature=0.5
            ),
            
            "rh": AIAgent(
                name="Agente de RH",
                role="Recrutamento e sele\u00e7\u00e3o",
                instructions="""Voc\u00ea \u00e9 o agente de RH da Vingi T\u00eaxtil.
                Processo de candidatura:
                1. Apresente as vagas dispon\u00edveis
                2. Colete dados: Nome, Email, WhatsApp
                3. Solicite curr\u00edculo (se poss\u00edvel)
                4. Explique pr\u00f3ximos passos
                
                Vagas comuns:
                - Opera\u00e7\u00e3o de m\u00e1quinas t\u00eaxteis
                - Estamparia
                - Vendas
                - Log\u00edstica
                
                Seja profissional e acolhedor.""",
                temperature=0.6
            ),
            
            "amostras": AIAgent(
                name="Agente de Amostras",
                role="Solicita\u00e7\u00e3o de amostras e cat\u00e1logos",
                instructions="""Voc\u00ea gerencia solicita\u00e7\u00f5es de amostras da Vingi T\u00eaxtil.
                Procedimento:
                1. Identifique o tipo de tecido de interesse
                2. Colete dados de envio: Nome, Empresa, Endere\u00e7o, CEP
                3. Confirme email e telefone
                4. Informe prazo de entrega (5-7 dias \u00fateis)
                
                Amostras dispon\u00edveis:
                - Malhas (diversos tipos)
                - Tecidos estampados
                - Tecidos para fitness
                - Tecidos para decora\u00e7\u00e3o
                
                M\u00e1ximo 3 amostras por solicita\u00e7\u00e3o.""",
                temperature=0.5
            )
        }
    
    async def route_message(self, message: str, current_agent: Optional[str] = None) -> Dict:
        """Roteia mensagem para o agente apropriado"""
        # Se j\u00e1 tem agente, usar ele
        if current_agent and current_agent in self.agents:
            agent = self.agents[current_agent]
            result = await agent.process_message(message)
            
            # Se agente n\u00e3o pode ajudar, re-rotear
            if result.get('requires_transfer'):
                return await self._smart_routing(message)
            
            return {**result, "department": current_agent.upper()}
        
        # Primeiro contato: usar triagem
        return await self._smart_routing(message)
    
    async def _smart_routing(self, message: str) -> Dict:
        """Roteamento inteligente baseado em palavras-chave"""
        message_lower = message.lower()
        
        # Regras de roteamento
        if any(word in message_lower for word in ['vaga', 'emprego', 'trabalh', 'curr\u00edculo', 'contratar']):
            agent = self.agents['rh']
            department = 'RH'
        elif any(word in message_lower for word in ['or\u00e7amento', 'pre\u00e7o', 'comprar', 'vend', 'pedido']):
            agent = self.agents['vendas']
            department = 'VENDAS'
        elif any(word in message_lower for word in ['amostra', 'cat\u00e1logo', 'mostruario']):
            agent = self.agents['amostras']
            department = 'AMOSTRAS'
        elif any(word in message_lower for word in ['problema', 'reclama', 'defeito', 'suporte']):
            agent = self.agents['suporte']
            department = 'SUPORTE'
        else:
            agent = self.agents['triagem']
            department = 'TRIAGEM'
        
        result = await agent.process_message(message)
        return {**result, "department": department}

# Inst\u00e2ncia global do router
agent_router = AgentRouter()
