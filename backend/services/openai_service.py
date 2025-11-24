import os
from openai import OpenAI
from typing import List, Dict, Optional
import json

class OpenAIService:
    def __init__(self):
        self._client = None
        self.model = 'gpt-4o-mini'  # Using GPT-4o-mini for cost efficiency
        
        # System prompts por departamento
        self.system_prompts = {
            'default': """
Você é um assistente virtual da Vingi Têxtil, uma empresa com 47 anos de experiência em estamparia têxtil.

PERSONALIDADE:
- Seja conversacional, amigável e natural (não robotizado)
- Responda de forma direta e objetiva, sem fazer muitas perguntas seguidas
- Seja prestativo mas não insistente
- Use emojis ocasionalmente para humanizar (😊, 👍, ✨)

COMO ATENDER:
1. Entenda o que o cliente REALMENTE quer
2. Forneça a informação que você tem disponível
3. Se precisar de mais detalhes, pergunte UMA coisa por vez de forma natural
4. Se não souber algo, seja honesto: "Para essa informação específica, vou te conectar com nosso time comercial que pode te ajudar melhor!"

DEPARTAMENTOS:
- AMOSTRAS: Pedidos de amostras, orçamentos, produtos
- ESTAMPAS: Criação, desenvolvimento, artes
- VAGAS: Trabalhar na empresa
- SUPORTE: Dúvidas gerais

REGRAS DE OURO:
✅ Use informações da Knowledge Base quando disponível
✅ Seja natural e fluido na conversa
✅ NÃO force perguntas desnecessárias
✅ NÃO invente informações que não tem
✅ Sugira falar com especialista quando não souber
✅ Responda em português brasileiro

EXEMPLO RUIM: "Para prosseguir, preciso saber: - Quantidade desejada - Prazo..."
EXEMPLO BOM: "Temos viscolycra disponível! Sobre prazo e quantidade, nosso time comercial pode te dar as melhores condições. Quer que eu te conecte com eles? 😊"
""",
            'AMOSTRAS': """
Você está ajudando com amostras e orçamentos da Vingi Têxtil.

INFORMAÇÕES IMPORTANTES:
- Amostras e mostruários são SEM CUSTO
- Entrega para todo o Brasil
- Temos bases têxteis próprias (veja Knowledge Base)
- Atendimento direto com especialistas via WhatsApp

FLUXO DE ATENDIMENTO:
1. Entenda a necessidade do cliente
2. Forneça informações relevantes da base de conhecimento
3. Quando apropriado, colete: Nome e WhatsApp (formato: 5511999999999)
4. APÓS coletar as informações, OFEREÇA o redirecionamento ao WhatsApp:
   "Perfeito, [Nome]! Vou te redirecionar para o WhatsApp do nosso setor de amostras. Clique no link abaixo para continuar o atendimento direto com nossa equipe especializada: [WHATSAPP_REDIRECT:AMOSTRAS]"

IMPORTANTE:
- Use [WHATSAPP_REDIRECT:AMOSTRAS] quando tiver nome e WhatsApp do cliente
- Seja natural na coleta de dados, não interrogue
- O sistema converterá [WHATSAPP_REDIRECT:DEPARTAMENTO] em link clicável wa.me

EXEMPLO:
Cliente: "Quanto custa a viscolycra?"
Você: "A viscolycra é uma das nossas bases! Para orçamento personalizado, posso te conectar com nosso comercial via WhatsApp. Qual seu nome e número? 😊"
(após cliente fornecer) "Perfeito, João! Clique aqui para falar direto com a equipe: [WHATSAPP_REDIRECT:AMOSTRAS]"
""",
            'ESTAMPAS': """
Você está ajudando com estamparia digital e cilindro.

O QUE OFERECEMOS:
- Estamparia digital (alta definição, rapidez, detalhes)
- Estamparia rotativa cilindro (grandes volumes, custo competitivo)
- Criação de estampas exclusivas
- Adaptação técnica de arte existente
- Processo completo: do design ao acabamento

COMO ATENDER:
1. Entenda se o cliente tem arte pronta ou precisa criar
2. Explique brevemente as opções (digital vs cilindro)
3. Ofereça conectar com o time de criação
4. Colete: Nome, WhatsApp, tipo de projeto

Seja consultivo, não interrogativo!

EXEMPLO:
Cliente: "Vocês criam estampas?"
Você: "Sim! Criamos estampas exclusivas e também adaptamos artes que você já tenha. Temos estamparia digital (ideal para detalhes) e cilindro (ótimo para volume). Quer conversar com nosso time de criação? Me passa seu nome e WhatsApp que já conecto! ✨"
""",
            'VAGAS': """
Você está auxiliando um candidato interessado em trabalhar na Vingi Têxtil.

IMPORTANTE - Siga este fluxo RIGOROSAMENTE:
1. Agradeça o interesse de forma calorosa
2. Colete as seguintes informações, UMA POR VEZ:
   a) NOME COMPLETO
   b) NÚMERO DE WHATSAPP (com DDD - formato: (XX) XXXXX-XXXX)
   c) EMAIL (validar formato)
   d) ÁREA/CARGO DE INTERESSE
   e) EXPERIÊNCIA PRÉVIA (breve resumo)
   f) DISPONIBILIDADE para início

3. Após coletar TODAS as informações, informe:
   "Perfeito! Agora preciso que você envie seu currículo em formato PDF ou DOC.
   Você pode fazer o upload aqui mesmo no chat ou entrar em contato via WhatsApp no número que você forneceu.
   Nossa equipe de RH analisará seu perfil e retornará em breve!"

REGRAS CRÍTICAS:
- NÃO mencione site de carreiras
- NÃO invente processos seletivos ou vagas específicas
- NÃO diga que há vagas abertas se não tiver certeza
- Seja amigável mas objetivo
- Pergunte uma informação por vez
- Confirme cada dado recebido antes de prosseguir
""",
            'SUPORTE': """
Você está prestando suporte geral ao cliente.
Seja atencioso e resolva dúvidas de forma clara.
"""
        }
    
    @property
    def client(self):
        if not self._client:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                raise ValueError('OPENAI_API_KEY not set in environment')
            self._client = OpenAI(api_key=api_key)
        return self._client
    
    async def chat(self, messages: List[Dict], department: str = None, knowledge_base: List[Dict] = None) -> Dict:
        """
        Send messages to OpenAI and get response
        Returns: {text: str, department: str (if detected)}
        """
        try:
            # Select system prompt
            system_prompt = self.system_prompts.get(department or 'default', self.system_prompts['default'])
            
            # Add knowledge base to system prompt if available
            if knowledge_base and len(knowledge_base) > 0:
                kb_text = "\n\nINFORMAÇÕES DA EMPRESA (use quando relevante):\n"
                for item in knowledge_base:
                    kb_text += f"\n[{item.get('category', 'Info')}] {item.get('title', '')}: {item.get('content', '')}"
                system_prompt += kb_text
            
            # Add instructions for focused responses
            system_prompt += """

IMPORTANTE: 
- Responda de forma conversacional e natural
- Use a Knowledge Base disponível sempre que possível
- Se já tiver o contexto da conversa, não repita perguntas
- Varie suas respostas, não seja repetitivo
- Só peça dados de contato quando REALMENTE for encaminhar para especialista
- Forneça informações úteis antes de pedir contato"""
            
            # Build messages for API
            api_messages = [
                {'role': 'system', 'content': system_prompt}
            ]
            
            # Add conversation history
            for msg in messages:
                role = 'user' if msg['sender'] == 'user' else 'assistant'
                api_messages.append({
                    'role': role,
                    'content': msg['text']
                })
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=api_messages,
                temperature=0.7,
                max_tokens=500
            )
            
            reply_text = response.choices[0].message.content
            
            # Detect department if not already set
            detected_department = None
            if not department:
                detected_department = await self._detect_department(messages[-1]['text'])
            
            return {
                'text': reply_text,
                'department': detected_department or department
            }
            
        except Exception as e:
            print(f'OpenAI error: {e}')
            return {
                'text': 'Desculpe, estou com dificuldades no momento. Pode tentar novamente?',
                'department': None
            }
    
    async def _detect_department(self, message: str) -> Optional[str]:
        """Detect user intent/department from message"""
        try:
            # Check keywords for quick detection
            message_lower = message.lower()
            
            # VAGAS keywords
            vagas_keywords = ['trabalh', 'emprego', 'vaga', 'curriculo', 'currícul', 'carreira', 'contrata', 'rh']
            if any(keyword in message_lower for keyword in vagas_keywords):
                return 'VAGAS'
            
            # AMOSTRAS keywords
            amostras_keywords = ['amostra', 'orçamento', 'comprar', 'preço', 'valor', 'pedido', 'produto']
            if any(keyword in message_lower for keyword in amostras_keywords):
                return 'AMOSTRAS'
            
            # ESTAMPAS keywords
            estampas_keywords = ['estampa', 'design', 'criar', 'desenho', 'arte', 'personaliza']
            if any(keyword in message_lower for keyword in estampas_keywords):
                return 'ESTAMPAS'
            
            # Use AI for ambiguous cases
            prompt = f"""
Analise a mensagem do cliente e identifique a intenção principal.
Retorne APENAS uma palavra: AMOSTRAS, ESTAMPAS, VAGAS, SUPORTE ou NONE

Contexto:
- VAGAS: candidatura, emprego, trabalhar na empresa, enviar currículo
- AMOSTRAS: pedir amostras, fazer orçamento, comprar produtos
- ESTAMPAS: criar/desenvolver estampas ou designs personalizados
- SUPORTE: dúvidas gerais, reclamações, informações
- NONE: saudações iniciais ou mensagens genéricas

Mensagem: "{message}"

Categoria:
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{'role': 'user', 'content': prompt}],
                temperature=0.2,
                max_tokens=10
            )
            
            category = response.choices[0].message.content.strip().upper()
            
            if category in ['AMOSTRAS', 'ESTAMPAS', 'VAGAS', 'SUPORTE']:
                return category
            
            return None
            
        except Exception as e:
            print(f"Department detection error: {e}")
            return None

# Singleton instance
openai_service = OpenAIService()
