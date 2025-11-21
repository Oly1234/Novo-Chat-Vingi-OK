# 🔧 PLANO DE REFATORAÇÃO COMPLETA - SISTEMA VINGI

## 📋 PROBLEMAS IDENTIFICADOS

### CRÍTICOS (P0):
1. ❌ Chat não responde ao clicar nas opções (sessionId ainda inicializando)
2. ❌ Áudio não funciona corretamente
3. ❌ Dados não persistem entre reloads (sem salvamento automático)
4. ❌ Admin panel precisa ser completamente refatorado (baseado em SULTS)

### IMPORTANTES (P1):
5. Upload de anexos precisa funcionar perfeitamente
6. Sistema de chamados completo (tickets, SLA, filtros, status)
7. PWA com cache inteligente
8. Salvamento automático a cada 2 minutos

---

## 🎯 SOLUÇÃO ESTRUTURADA

### FASE 1: CORREÇÕES CRÍTICAS DO CHAT (30min)
- [ ] Corrigir inicialização de sessão (aguardar antes de enviar)
- [ ] Implementar loading state visual
- [ ] Corrigir áudio com feedback visual adequado
- [ ] Testar chat completamente

### FASE 2: SISTEMA DE SALVAMENTO AUTOMÁTICO (45min)
- [ ] Implementar auto-save a cada 2min no Firebase
- [ ] LocalStorage como fallback
- [ ] Sincronização em tempo real
- [ ] Indicador visual de "salvando..."

### FASE 3: REFATORAÇÃO ADMIN - SISTEMA DE CHAMADOS (2h)
Baseado em https://www.sults.com.br/produtos/chamados

**Estrutura do novo Admin:**
```
/admin
  /dashboard          → Métricas gerais, gráficos
  /chamados          → Sistema completo de tickets
    /todos           → Lista de todos chamados
    /recebidos       → Chamados recebidos
    /enviados        → Chamados enviados
    /novo            → Criar novo chamado
  /conhecimento      → Knowledge Base
  /candidatos        → Gestão de vagas
  /analytics         → Relatórios e exportação
  /configuracoes     → Departamentos, SLAs, etc
```

**Funcionalidades do Sistema de Chamados:**
1. ✅ Criação de tickets com formulários personalizados
2. ✅ Filtros avançados (status, departamento, prazo, prioridade)
3. ✅ Status: Novo, Em Andamento, Aguardando, Resolvido, Fechado
4. ✅ SLA com indicadores visuais (verde, amarelo, vermelho)
5. ✅ Atribuição de responsáveis
6. ✅ Histórico completo de interações
7. ✅ Avaliação de atendimento
8. ✅ Exportação para Excel
9. ✅ Notificações em tempo real
10. ✅ Pesquisa e filtros inteligentes

### FASE 4: PWA E PERFORMANCE (30min)
- [ ] Service Worker otimizado (não cachear POST)
- [ ] Manifest.json completo
- [ ] Offline support básico
- [ ] Cache estratégico de assets

### FASE 5: UPLOADS E ANEXOS (30min)
- [ ] Upload para Firebase Storage
- [ ] Preview de arquivos
- [ ] Validação de tipos
- [ ] Progress indicator

### FASE 6: TESTES FINAIS (30min)
- [ ] Testar todo fluxo de chat
- [ ] Testar sistema de chamados
- [ ] Testar persistência de dados
- [ ] Testar em mobile
- [ ] Verificar performance

---

## 🔥 TECNOLOGIAS E ARQUITETURA

### Backend (FastAPI + Firebase):
```
/backend
  /routes
    /tickets.py       → NOVO: Rotas de chamados/tickets
    /admin.py         → Melhorado
    /chat.py          → Corrigido
  /services
    /firebase_service.py → Expandido
    /ticket_service.py   → NOVO
  /models
    /ticket.py        → NOVO
```

### Frontend (React + Firebase):
```
/frontend/src
  /components
    /Admin
      /Tickets       → NOVO: Sistema completo
        /TicketList.js
        /TicketDetail.js
        /TicketForm.js
        /TicketFilters.js
        /TicketSLA.js
      /Dashboard
      /KnowledgeBase
      /Candidates
      /Analytics
    /Chat
      /VoiceInput.js   → CORRIGIDO
  /contexts
    /ChatContext.js    → CORRIGIDO
    /TicketContext.js  → NOVO
  /hooks
    /useAutoSave.js    → NOVO
    /useTickets.js     → NOVO
  /services
    /api.js            → Expandido
    /storage.js        → NOVO: LocalStorage sync
```

---

## 📊 MODELO DE DADOS

### Tickets (Firebase Collection):
```javascript
{
  id: string,
  titulo: string,
  descricao: string,
  departamento: string,
  assunto: string,
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente',
  status: 'novo' | 'em_andamento' | 'aguardando' | 'resolvido' | 'fechado',
  solicitante: {
    nome: string,
    email: string,
    unidade: string (opcional)
  },
  responsavel: string (opcional),
  sla: {
    prazo: timestamp,
    vencido: boolean,
    tempoDecorrido: number (minutos)
  },
  tags: string[],
  anexos: [{
    nome: string,
    url: string,
    tipo: string,
    tamanho: number
  }],
  historico: [{
    tipo: 'criacao' | 'comentario' | 'mudanca_status' | 'atribuicao' | 'avaliacao',
    usuario: string,
    descricao: string,
    timestamp: timestamp,
    dados: object (opcional)
  }],
  avaliacao: {
    nota: number (1-5),
    comentario: string,
    timestamp: timestamp
  } (opcional),
  criadoEm: timestamp,
  atualizadoEm: timestamp,
  resolvidoEm: timestamp (opcional),
  fechadoEm: timestamp (opcional)
}
```

### Auto-Save State (LocalStorage + Firebase):
```javascript
{
  lastSaved: timestamp,
  drafts: {
    [form_id]: {
      data: object,
      timestamp: timestamp
    }
  },
  unsyncedChanges: object[]
}
```

---

## 🎨 DESIGN SYSTEM (Baseado em SULTS)

### Cores:
- Primary: #0066CC (Azul corporativo)
- Secondary: #00A86B (Verde sucesso)
- Warning: #FFA500 (Laranja alerta)
- Danger: #DC3545 (Vermelho urgente)
- Gray: #6C757D (Neutro)

### Status Visual:
- 🟢 Novo: Verde
- 🟡 Em Andamento: Amarelo
- 🔵 Aguardando: Azul
- ✅ Resolvido: Verde escuro
- ⚫ Fechado: Cinza

### SLA Visual:
- 🟢 No prazo (>50% tempo restante)
- 🟡 Atenção (10-50% tempo restante)
- 🔴 Vencido (<10% ou vencido)

---

## ⚙️ CONFIGURAÇÃO OPENAI NO FIREBASE

### Passo 1: Adicionar no .env do backend:
```bash
OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

### Passo 2: Verificar Firebase Functions (se usar):
```bash
firebase functions:config:set openai.key="sk-proj-sua-chave-aqui"
```

### Passo 3: Backend já configurado:
- Arquivo: `/app/backend/services/openai_service.py`
- Método: `client` property já lê `OPENAI_API_KEY` do ambiente

### Passo 4: Testar:
```bash
curl -X POST http://localhost:8001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","text":"Olá"}'
```

---

## 🚀 PRIORIZAÇÃO DE EXECUÇÃO

**ORDEM DE IMPLEMENTAÇÃO:**

1. **AGORA** (Crítico): Corrigir chat e áudio (30min)
2. **DEPOIS** (Importante): Auto-save e persistência (45min)
3. **EM SEGUIDA** (Core): Sistema de chamados (2h)
4. **FINALIZANDO** (Polish): PWA, uploads, testes (1.5h)

**TEMPO TOTAL ESTIMADO: ~4.5 horas**

---

## 📝 NOTAS IMPORTANTES

- ✅ Firebase JÁ está configurado e funcional
- ✅ OpenAI JÁ está integrado
- ✅ Knowledge Base JÁ está populada
- ❌ Precisa implementar sistema de tickets do zero
- ❌ Precisa corrigir bugs do chat
- ❌ Precisa implementar auto-save

---

Criado por: E1 Agent
Status: 📋 PLANO APROVADO - Aguardando execução
