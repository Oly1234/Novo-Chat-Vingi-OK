"""
Ticket Service - Gerenciamento completo de tickets/chamados
"""
from services.firebase_service import firebase_service
from models.ticket import *
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import uuid

class TicketService:
    def __init__(self):
        self.db = firebase_service.db
        self.collection = 'tickets'
    
    async def get_next_ticket_number(self) -> int:
        """Gera próximo número sequencial de ticket"""
        try:
            # Buscar último número no Firebase
            doc = self.db.collection('config').document('ticket_counter').get()
            if doc.exists:
                current = doc.to_dict().get('last_number', 0)
            else:
                current = 0
            
            next_number = current + 1
            self.db.collection('config').document('ticket_counter').set({
                'last_number': next_number
            })
            
            return next_number
        except:
            # Fallback: contar tickets existentes
            tickets = self.db.collection(self.collection).stream()
            return sum(1 for _ in tickets) + 1
    
    def calculate_sla(self, criado_em: datetime, prazo_horas: int, resolvido_em: Optional[datetime] = None) -> SLA:
        """Calcula SLA do ticket"""
        now = datetime.now(timezone.utc)
        prazo = criado_em + timedelta(hours=prazo_horas)
        
        if resolvido_em:
            tempo_decorrido = int((resolvido_em - criado_em).total_seconds() / 60)
            tempo_restante = 0
            vencido = resolvido_em > prazo
        else:
            tempo_decorrido = int((now - criado_em).total_seconds() / 60)
            tempo_restante = int((prazo - now).total_seconds() / 60)
            vencido = now > prazo
        
        prazo_total_min = prazo_horas * 60
        percentual = (tempo_decorrido / prazo_total_min) * 100 if prazo_total_min > 0 else 0
        
        return SLA(
            prazo=prazo,
            vencido=vencido,
            tempoDecorrido=tempo_decorrido,
            tempoRestante=max(0, tempo_restante),
            percentualUsado=min(100, percentual)
        )
    
    async def create_ticket(self, ticket_data: TicketCreate) -> TicketResponse:
        """Cria novo ticket"""
        ticket_id = str(uuid.uuid4())
        numero = await self.get_next_ticket_number()
        now = datetime.now(timezone.utc)
        
        # Calcular SLA
        sla = self.calculate_sla(now, ticket_data.prazoHoras)
        
        # Criar histórico inicial
        historico = [
            HistoryEntry(
                tipo=HistoryEntryType.CRIACAO,
                usuario=ticket_data.solicitante.nome,
                descricao=f"Ticket #{numero} criado",
                timestamp=now
            ).dict()
        ]
        
        ticket_dict = {
            'id': ticket_id,
            'numero': numero,
            'titulo': ticket_data.titulo,
            'descricao': ticket_data.descricao,
            'departamento': ticket_data.departamento,
            'assunto': ticket_data.assunto,
            'prioridade': ticket_data.prioridade,
            'status': TicketStatus.NOVO,
            'tipo': ticket_data.tipo,
            'solicitante': ticket_data.solicitante.dict(),
            'responsavel': None,
            'sla': sla.dict(),
            'tags': ticket_data.tags,
            'anexos': [],
            'historico': historico,
            'avaliacao': None,
            'criadoEm': now,
            'atualizadoEm': now,
            'resolvidoEm': None,
            'fechadoEm': None
        }
        
        self.db.collection(self.collection).document(ticket_id).set(ticket_dict)
        return TicketResponse(**ticket_dict)
    
    async def get_ticket(self, ticket_id: str) -> Optional[TicketResponse]:
        """Busca ticket por ID"""
        doc = self.db.collection(self.collection).document(ticket_id).get()
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        # Recalcular SLA
        data['sla'] = self.calculate_sla(
            data['criadoEm'],
            24,  # Default
            data.get('resolvidoEm')
        ).dict()
        
        return TicketResponse(**data)
    
    async def update_ticket(self, ticket_id: str, update_data: TicketUpdate, usuario: str) -> Optional[TicketResponse]:
        """Atualiza ticket"""
        ticket = await self.get_ticket(ticket_id)
        if not ticket:
            return None
        
        update_dict = update_data.dict(exclude_unset=True)
        update_dict['atualizadoEm'] = datetime.now(timezone.utc)
        
        # Adicionar ao histórico
        historico = ticket.historico.copy()
        
        if 'status' in update_dict:
            old_status = ticket.status
            new_status = update_dict['status']
            
            historico.append(HistoryEntry(
                tipo=HistoryEntryType.MUDANCA_STATUS,
                usuario=usuario,
                descricao=f"Status alterado de {old_status} para {new_status}",
                dados={'de': old_status, 'para': new_status}
            ).dict())
            
            # Se resolvido, marcar timestamp
            if new_status == TicketStatus.RESOLVIDO:
                update_dict['resolvidoEm'] = update_dict['atualizadoEm']
            elif new_status == TicketStatus.FECHADO:
                update_dict['fechadoEm'] = update_dict['atualizadoEm']
        
        if 'responsavel' in update_dict:
            historico.append(HistoryEntry(
                tipo=HistoryEntryType.ATRIBUICAO,
                usuario=usuario,
                descricao=f"Ticket atribuído para {update_dict['responsavel']}",
                dados={'responsavel': update_dict['responsavel']}
            ).dict())
        
        update_dict['historico'] = [h.dict() if isinstance(h, HistoryEntry) else h for h in historico]
        
        self.db.collection(self.collection).document(ticket_id).update(update_dict)
        return await self.get_ticket(ticket_id)
    
    async def add_comment(self, comment_data: ComentarioCreate, usuario: str) -> bool:
        """Adiciona comentário ao ticket"""
        ticket = await self.get_ticket(comment_data.ticketId)
        if not ticket:
            return False
        
        historico = ticket.historico.copy()
        historico.append(HistoryEntry(
            tipo=HistoryEntryType.COMENTARIO,
            usuario=usuario,
            descricao=comment_data.texto,
            dados={'interno': comment_data.interno}
        ).dict())
        
        self.db.collection(self.collection).document(comment_data.ticketId).update({
            'historico': historico,
            'atualizadoEm': datetime.now(timezone.utc)
        })
        
        return True
    
    async def add_attachment(self, ticket_id: str, attachment: Attachment, usuario: str) -> bool:
        """Adiciona anexo ao ticket"""
        ticket = await self.get_ticket(ticket_id)
        if not ticket:
            return False
        
        anexos = ticket.anexos.copy()
        anexos.append(attachment.dict())
        
        historico = ticket.historico.copy()
        historico.append(HistoryEntry(
            tipo=HistoryEntryType.ANEXO,
            usuario=usuario,
            descricao=f"Anexo adicionado: {attachment.nome}",
            dados={'nome': attachment.nome, 'url': attachment.url}
        ).dict())
        
        self.db.collection(self.collection).document(ticket_id).update({
            'anexos': anexos,
            'historico': historico,
            'atualizadoEm': datetime.now(timezone.utc)
        })
        
        return True
    
    async def add_rating(self, ticket_id: str, avaliacao: Avaliacao, usuario: str) -> bool:
        """Adiciona avaliação ao ticket"""
        ticket = await self.get_ticket(ticket_id)
        if not ticket or ticket.status != TicketStatus.RESOLVIDO:
            return False
        
        historico = ticket.historico.copy()
        historico.append(HistoryEntry(
            tipo=HistoryEntryType.AVALIACAO,
            usuario=usuario,
            descricao=f"Ticket avaliado com {avaliacao.nota} estrelas",
            dados={'nota': avaliacao.nota, 'comentario': avaliacao.comentario}
        ).dict())
        
        self.db.collection(self.collection).document(ticket_id).update({
            'avaliacao': avaliacao.dict(),
            'historico': historico,
            'atualizadoEm': datetime.now(timezone.utc)
        })
        
        return True
    
    async def list_tickets(self, filters: Optional[TicketFilters] = None, limit: int = 100) -> List[TicketResponse]:
        """Lista tickets com filtros"""
        query = self.db.collection(self.collection)
        
        if filters:
            if filters.status:
                query = query.where('status', 'in', [s.value for s in filters.status])
            if filters.departamento:
                query = query.where('departamento', '==', filters.departamento)
            if filters.responsavel:
                query = query.where('responsavel', '==', filters.responsavel)
            if filters.tipo:
                query = query.where('tipo', '==', filters.tipo.value)
        
        query = query.order_by('criadoEm', direction='DESCENDING').limit(limit)
        
        tickets = []
        for doc in query.stream():
            data = doc.to_dict()
            # Recalcular SLA
            data['sla'] = self.calculate_sla(
                data['criadoEm'],
                24,
                data.get('resolvidoEm')
            ).dict()
            tickets.append(TicketResponse(**data))
        
        # Filtros adicionais em Python
        if filters:
            if filters.prioridade:
                tickets = [t for t in tickets if t.prioridade in filters.prioridade]
            if filters.slaVencido is not None:
                tickets = [t for t in tickets if t.sla.vencido == filters.slaVencido]
            if filters.busca:
                busca = filters.busca.lower()
                tickets = [t for t in tickets if busca in t.titulo.lower() or busca in t.descricao.lower()]
        
        return tickets
    
    async def get_stats(self) -> TicketStats:
        """Retorna estatísticas dos tickets"""
        all_tickets = await self.list_tickets(limit=1000)
        
        total = len(all_tickets)
        novos = len([t for t in all_tickets if t.status == TicketStatus.NOVO])
        em_andamento = len([t for t in all_tickets if t.status == TicketStatus.EM_ANDAMENTO])
        aguardando = len([t for t in all_tickets if t.status == TicketStatus.AGUARDANDO])
        resolvidos = len([t for t in all_tickets if t.status == TicketStatus.RESOLVIDO])
        fechados = len([t for t in all_tickets if t.status == TicketStatus.FECHADO])
        vencidos = len([t for t in all_tickets if t.sla.vencido])
        
        # Por departamento
        por_dept = {}
        for t in all_tickets:
            por_dept[t.departamento] = por_dept.get(t.departamento, 0) + 1
        
        # Por prioridade
        por_prioridade = {}
        for t in all_tickets:
            por_prioridade[t.prioridade] = por_prioridade.get(t.prioridade, 0) + 1
        
        # Tempo médio de resolução
        resolvidos_list = [t for t in all_tickets if t.resolvidoEm]
        if resolvidos_list:
            tempos = [(t.resolvidoEm - t.criadoEm).total_seconds() / 3600 for t in resolvidos_list]
            tempo_medio = sum(tempos) / len(tempos)
        else:
            tempo_medio = 0
        
        # Avaliação média
        avaliados = [t for t in all_tickets if t.avaliacao]
        if avaliados:
            avaliacao_media = sum(t.avaliacao.nota for t in avaliados) / len(avaliados)
        else:
            avaliacao_media = 0
        
        return TicketStats(
            total=total,
            novos=novos,
            emAndamento=em_andamento,
            aguardando=aguardando,
            resolvidos=resolvidos,
            fechados=fechados,
            vencidos=vencidos,
            porDepartamento=por_dept,
            porPrioridade=por_prioridade,
            tempoMedioResolucao=round(tempo_medio, 2),
            avaliacaoMedia=round(avaliacao_media, 2)
        )

# Singleton
ticket_service = TicketService()
