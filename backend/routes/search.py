from fastapi import APIRouter, Header, HTTPException, Query
import os
from services.firebase_service import get_documents

router = APIRouter(prefix="/api/search", tags=["search"])
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'v1ng1t3x')

@router.get("/global")
async def global_search(q: str = Query(..., min_length=2), x_admin_password: str = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    query_lower = q.lower()
    results = []
    
    # Buscar em tickets
    try:
        tickets = await get_documents('tickets')
        for ticket in tickets:
            if (
                query_lower in ticket.get('titulo', '').lower() or
                query_lower in ticket.get('descricao', '').lower() or
                query_lower in str(ticket.get('numero', '')).lower()
            ):
                titulo = ticket.get('titulo', 'Sem título')
                descricao = ticket.get('descricao', '')[:100] + '...'
                results.append({
                    'type': 'ticket',
                    'title': f"#{ticket.get('numero')} - {titulo}",
                    'subtitle': descricao,
                    'id': ticket.get('id'),
                    'data': ticket
                })
    except:
        pass
    
    # Buscar em clientes
    try:
        customers = await get_documents('customers')
        for customer in customers:
            if (
                query_lower in customer.get('name', '').lower() or
                query_lower in customer.get('email', '').lower() or
                query_lower in customer.get('company', '').lower()
            ):
                results.append({
                    'type': 'customer',
                    'title': customer.get('name', 'Sem nome'),
                    'subtitle': f"{customer.get('email', '')} - {customer.get('company', '')}",
                    'id': customer.get('id'),
                    'data': customer
                })
    except:
        pass
    
    # Buscar em sess\u00f5es
    try:
        sessions = await get_documents('sessions')
        for session in sessions:
            messages = session.get('messages', [])
            for msg in messages:
                if query_lower in msg.get('text', '').lower():
                    results.append({
                        'type': 'session',
                        'title': f"Sess\u00e3o {session.get('sessionId', '')[:8]}",
                        'subtitle': msg.get('text', '')[:100] + '...',
                        'id': session.get('sessionId'),
                        'data': session
                    })
                    break
    except:
        pass
    
    return {
        'query': q,
        'results': results[:20],  # Limitar a 20 resultados
        'total': len(results)
    }
