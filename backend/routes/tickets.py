"""
Tickets/Chamados Routes - Sistema completo baseado em SULTS
"""
from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File
from typing import List, Optional
import os
from models.ticket import *
from services.ticket_service import ticket_service
from services.firebase_service import firebase_service

router = APIRouter(prefix="/tickets", tags=["tickets"])

# Auth
def verify_admin(x_admin_password: str = Header(...)):
    if x_admin_password != os.getenv('ADMIN_PASSWORD'):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# CREATE
@router.post("/", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate):
    """Cria novo ticket/chamado"""
    try:
        return await ticket_service.create_ticket(ticket)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# READ
@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str):
    """Busca ticket por ID"""
    ticket = await ticket_service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    return ticket

# LIST
@router.post("/list", response_model=List[TicketResponse])
async def list_tickets(
    filters: Optional[TicketFilters] = None,
    limit: int = 100,
    authorized: bool = Depends(verify_admin)
):
    """Lista tickets com filtros"""
    try:
        return await ticket_service.list_tickets(filters, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE
@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    update: TicketUpdate,
    usuario: str = "Admin",
    authorized: bool = Depends(verify_admin)
):
    """Atualiza ticket"""
    ticket = await ticket_service.update_ticket(ticket_id, update, usuario)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    return ticket

# COMMENT
@router.post("/comment", response_model=dict)
async def add_comment(
    comment: ComentarioCreate,
    usuario: str = "Admin",
    authorized: bool = Depends(verify_admin)
):
    """Adiciona comentário ao ticket"""
    success = await ticket_service.add_comment(comment, usuario)
    if not success:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    return {"success": True, "message": "Comentário adicionado"}

# ATTACHMENT
@router.post("/{ticket_id}/attachment")
async def upload_attachment(
    ticket_id: str,
    file: UploadFile = File(...),
    usuario: str = "Admin",
    authorized: bool = Depends(verify_admin)
):
    """Upload de anexo para ticket"""
    try:
        # Upload para Firebase Storage
        file_content = await file.read()
        file_url = await firebase_service.upload_file(
            file_content,
            file.filename,
            file.content_type
        )
        
        if not file_url:
            raise HTTPException(status_code=500, detail="Falha no upload")
        
        # Adicionar ao ticket
        attachment = Attachment(
            nome=file.filename,
            url=file_url,
            tipo=file.content_type,
            tamanho=len(file_content)
        )
        
        success = await ticket_service.add_attachment(ticket_id, attachment, usuario)
        if not success:
            raise HTTPException(status_code=404, detail="Ticket não encontrado")
        
        return {"success": True, "url": file_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE TICKET
@router.put("/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    ticket_data: dict,
    authorized: bool = Depends(verify_admin)
):
    """Atualiza um ticket existente"""
    try:
        success = await ticket_service.update_ticket(ticket_id, ticket_data)
        if not success:
            raise HTTPException(status_code=404, detail="Ticket não encontrado")
        return {"success": True, "message": "Ticket atualizado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# DELETE TICKET
@router.delete("/{ticket_id}")
async def delete_ticket(
    ticket_id: str,
    authorized: bool = Depends(verify_admin)
):
    """Exclui um ticket"""
    try:
        success = await ticket_service.delete_ticket(ticket_id)
        if not success:
            raise HTTPException(status_code=404, detail="Ticket não encontrado")
        return {"success": True, "message": "Ticket excluído"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# RATING
@router.post("/{ticket_id}/rating")
async def add_rating(
    ticket_id: str,
    avaliacao: Avaliacao,
    usuario: str = "Cliente"
):
    """Adiciona avaliação ao ticket"""
    success = await ticket_service.add_rating(ticket_id, avaliacao, usuario)
    if not success:
        raise HTTPException(status_code=400, detail="Ticket não pode ser avaliado")
    return {"success": True, "message": "Avaliação adicionada"}

# STATS
@router.get("/stats/overview", response_model=TicketStats)
async def get_ticket_stats(authorized: bool = Depends(verify_admin)):
    """Retorna estatísticas dos tickets"""
    try:
        return await ticket_service.get_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# EXPORT
@router.get("/export/csv")
async def export_tickets_csv(authorized: bool = Depends(verify_admin)):
    """Exporta tickets para CSV"""
    try:
        import csv
        import io
        from fastapi.responses import StreamingResponse
        
        tickets = await ticket_service.list_tickets(limit=10000)
        
        output = io.StringIO()
        if tickets:
            fieldnames = ['numero', 'titulo', 'status', 'prioridade', 'departamento', 
                         'solicitante', 'responsavel', 'criadoEm', 'resolvidoEm']
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for ticket in tickets:
                writer.writerow({
                    'numero': ticket.numero,
                    'titulo': ticket.titulo,
                    'status': ticket.status,
                    'prioridade': ticket.prioridade,
                    'departamento': ticket.departamento,
                    'solicitante': ticket.solicitante.nome,
                    'responsavel': ticket.responsavel or '',
                    'criadoEm': ticket.criadoEm.isoformat(),
                    'resolvidoEm': ticket.resolvidoEm.isoformat() if ticket.resolvidoEm else ''
                })
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=tickets.csv"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# BULK ACTIONS
@router.post("/bulk/assign")
async def bulk_assign(
    ticket_ids: List[str],
    responsavel: str,
    authorized: bool = Depends(verify_admin)
):
    """Atribui múltiplos tickets para um responsável"""
    try:
        results = []
        for ticket_id in ticket_ids:
            update = TicketUpdate(responsavel=responsavel)
            ticket = await ticket_service.update_ticket(ticket_id, update, "Admin")
            results.append(ticket is not None)
        
        return {
            "success": True,
            "updated": sum(results),
            "total": len(ticket_ids)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk/status")
async def bulk_change_status(
    ticket_ids: List[str],
    status: TicketStatus,
    authorized: bool = Depends(verify_admin)
):
    """Altera status de múltiplos tickets"""
    try:
        results = []
        for ticket_id in ticket_ids:
            update = TicketUpdate(status=status)
            ticket = await ticket_service.update_ticket(ticket_id, update, "Admin")
            results.append(ticket is not None)
        
        return {
            "success": True,
            "updated": sum(results),
            "total": len(ticket_ids)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
