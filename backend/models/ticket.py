"""
Ticket/Chamado Models - Sistema baseado em SULTS
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class TicketPriority(str, Enum):
    BAIXA = "baixa"
    NORMAL = "normal"
    ALTA = "alta"
    URGENTE = "urgente"

class TicketStatus(str, Enum):
    NOVO = "novo"
    EM_ANDAMENTO = "em_andamento"
    AGUARDANDO = "aguardando"
    RESOLVIDO = "resolvido"
    FECHADO = "fechado"

class TicketType(str, Enum):
    SUPORTE = "suporte"
    COMERCIAL = "comercial"
    FINANCEIRO = "financeiro"
    RH = "rh"
    TECNICO = "tecnico"
    GERAL = "geral"

class HistoryEntryType(str, Enum):
    CRIACAO = "criacao"
    COMENTARIO = "comentario"
    MUDANCA_STATUS = "mudanca_status"
    ATRIBUICAO = "atribuicao"
    AVALIACAO = "avaliacao"
    ANEXO = "anexo"

class Attachment(BaseModel):
    nome: str
    url: str
    tipo: str
    tamanho: int
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)

class HistoryEntry(BaseModel):
    tipo: HistoryEntryType
    usuario: str
    descricao: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    dados: Optional[Dict] = None

class SLA(BaseModel):
    prazo: datetime
    vencido: bool = False
    tempoDecorrido: int = 0  # minutos
    tempoRestante: int = 0  # minutos
    percentualUsado: float = 0.0

class Avaliacao(BaseModel):
    nota: int = Field(..., ge=1, le=5)
    comentario: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Solicitante(BaseModel):
    nome: str
    email: str
    telefone: Optional[str] = None
    unidade: Optional[str] = None

class TicketCreate(BaseModel):
    titulo: str = Field(..., min_length=5, max_length=200)
    descricao: str = Field(..., min_length=10)
    departamento: str
    assunto: str
    prioridade: TicketPriority = TicketPriority.NORMAL
    tipo: TicketType = TicketType.GERAL
    solicitante: Solicitante
    tags: List[str] = []
    prazoHoras: int = 24  # Prazo em horas

class TicketUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[TicketStatus] = None
    prioridade: Optional[TicketPriority] = None
    responsavel: Optional[str] = None
    tags: Optional[List[str]] = None

class ComentarioCreate(BaseModel):
    ticketId: str
    texto: str = Field(..., min_length=1)
    interno: bool = False  # Se true, apenas equipe vê

class TicketResponse(BaseModel):
    id: str
    numero: int  # Número sequencial do ticket
    titulo: str
    descricao: str
    departamento: str
    assunto: str
    prioridade: TicketPriority
    status: TicketStatus
    tipo: TicketType
    solicitante: Solicitante
    responsavel: Optional[str] = None
    sla: SLA
    tags: List[str] = []
    anexos: List[Attachment] = []
    historico: List[HistoryEntry] = []
    avaliacao: Optional[Avaliacao] = None
    criadoEm: datetime
    atualizadoEm: datetime
    resolvidoEm: Optional[datetime] = None
    fechadoEm: Optional[datetime] = None

class TicketFilters(BaseModel):
    status: Optional[List[TicketStatus]] = None
    prioridade: Optional[List[TicketPriority]] = None
    departamento: Optional[str] = None
    tipo: Optional[TicketType] = None
    responsavel: Optional[str] = None
    solicitante: Optional[str] = None
    tags: Optional[List[str]] = None
    dataInicio: Optional[datetime] = None
    dataFim: Optional[datetime] = None
    slaVencido: Optional[bool] = None
    busca: Optional[str] = None  # Busca em titulo/descricao

class TicketStats(BaseModel):
    total: int
    novos: int
    emAndamento: int
    aguardando: int
    resolvidos: int
    fechados: int
    vencidos: int
    porDepartamento: Dict[str, int]
    porPrioridade: Dict[str, int]
    tempoMedioResolucao: float  # em horas
    avaliacaoMedia: float
