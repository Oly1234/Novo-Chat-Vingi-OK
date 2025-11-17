# 🎉 Sistema de Atendimento Vingi Têxtil v2.0

## ✨ Visão Geral

Sistema de atendimento online de **alto padrão** com design moderno inspirado no Windows 10 evoluído, integrando inteligência artificial (OpenAI GPT-4), handoff humano suave e direcionamento contextual para WhatsApp.

---

## 🚀 Funcionalidades Principais

### 💬 **Chat Inteligente com IA**
- Assistente virtual alimentado por **OpenAI GPT-4o-mini**
- Detecção automática de intenção e departamento
- Respostas contextualizadas por categoria:
  - **AMOSTRAS**: Orçamentos e amostras
  - **ESTAMPAS**: Desenvolvimento de estampas
  - **VAGAS**: Oportunidades de trabalho
  - **SUPORTE**: Suporte geral

### 📎 **Upload de Arquivos**
- Currículos (PDF, DOC, DOCX)
- Imagens (PNG, JPG, JPEG)
- Validação automática (5MB máximo)
- Preview antes de enviar

### 👥 **Handoff Humano Inteligente**
- Transição suave IA → Humano
- Sistema de fila organizado
- Chat em tempo real
- Histórico completo disponível para atendente

### 📱 **WhatsApp Contextual**
- Aparece apenas após categorização da IA
- Números dinâmicos por departamento
- Mensagem pré-preenchida com contexto
- Configurável via painel admin

### 🎨 **Design Moderno**
- Inspirado no Windows 10 evoluído
- Glassmorphism / Acrylic effects
- Fluent Design (sombras, profundidade)
- Dark mode completo
- 100% responsivo (mobile fullscreen)

### 📲 **PWA Completo**
- Instalável no celular
- Ícones otimizados (Vingi)
- Manifest configurado
- Suporte offline básico

---

## 🏗️ Arquitetura Técnica

### **Stack:**
- **Frontend**: React + Context API
- **Backend**: FastAPI (Python)
- **Banco de Dados**: MongoDB
- **IA**: OpenAI GPT-4o-mini
- **Storage**: MongoDB (GridFS planejado)

### **Estrutura de Pastas:**
```
/app/
├── backend/
│   ├── server.py                 # FastAPI main
│   ├── routes/
│   │   ├── chat.py               # Chat endpoints
│   │   └── config.py             # Config endpoints
│   ├── services/
│   │   ├── storage_service.py    # MongoDB storage
│   │   ├── openai_service.py     # OpenAI integration
│   │   └── whatsapp_service.py   # WhatsApp URLs
│   └── .env                      # Environment variables
└── frontend/
    ├── public/
    │   ├── icons/                # PWA icons (Vingi)
    │   ├── logo.png              # Logo Vingi
    │   └── manifest.json         # PWA manifest
    └── src/
        ├── components/
        │   ├── Chat/             # Chat components
        │   ├── Admin/            # Admin panel (futuro)
        │   └── UI/               # Design system
        ├── contexts/
        │   ├── ThemeContext.js   # Dark mode
        │   └── ChatContext.js    # Chat state
        └── services/
            └── api.js            # API calls
```

---

## 🔐 Variáveis de Ambiente

### **Backend (.env)**
```bash
# Database
MONGO_URL=mongodb://localhost:27017/
DB_NAME=vingi

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Admin
ADMIN_PASSWORD=v1ng1t3x

# Firebase (opcional - futuro)
FIREBASE_PROJECT_ID=agenda-44f53
FIREBASE_STORAGE_BUCKET=agenda-44f53.firebasestorage.app
```

### **Frontend (.env)**
```bash
REACT_APP_BACKEND_URL=<backend_url>
```

---

## 📡 APIs Disponíveis

### **Chat Endpoints**
| Method | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/chat/start` | Inicia sessão de chat |
| POST | `/api/chat/message` | Envia mensagem e recebe resposta IA |
| POST | `/api/chat/upload` | Upload de arquivo |
| POST | `/api/chat/handoff` | Solicita atendimento humano |
| POST | `/api/chat/whatsapp` | Gera URL WhatsApp contextual |
| GET | `/api/chat/session/:id` | Obtém sessão completa |

### **Config Endpoints**
| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/config/whatsapp` | Lista departamentos WhatsApp |
| POST | `/api/config/whatsapp` | Atualiza config (admin) |

---

## 🎨 Design System

### **Paleta de Cores**
- **Primary**: `#0078D4` (Azul Windows)
- **Primary Hover**: `#005A9E`
- **Success**: `#10893E`
- **Danger**: `#D13438`

### **Dark Mode**
- Toggle no header do chat
- Persistência no localStorage
- Variáveis CSS automáticas

### **Componentes UI**
- `<Button>`: 4 variantes, 3 tamanhos
- `<Card>`: Glassmorphism effect
- `<Modal>`: Animações suaves
- `<Input>`: Validação visual

---

## 🚀 Como Executar

### **1. Instalar Dependências**
```bash
# Backend
cd /app/backend
pip install -r requirements.txt

# Frontend
cd /app/frontend
yarn install
```

### **2. Configurar Variáveis**
Edite os arquivos `.env` conforme seção acima.

### **3. Inicializar Configuração WhatsApp**
```bash
python3 /app/backend/init_default_config.py
```

### **4. Iniciar Serviços**
```bash
sudo supervisorctl restart all
```

### **5. Acessar**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **Docs API**: http://localhost:8001/docs

---

## 🧪 Testes

### **Testar API diretamente:**
```bash
# Iniciar sessão
curl -X POST http://localhost:8001/api/chat/start \
  -H "Content-Type: application/json" \
  -d '{}'

# Enviar mensagem
curl -X POST http://localhost:8001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "<session_id>",
    "text": "Olá! Gostaria de fazer um orçamento",
    "attachments": []
  }'
```

---

## 📱 PWA Installation

1. Acesse o site no Chrome mobile
2. Clique em "Adicionar à Tela Inicial"
3. O ícone da Vingi aparecerá no seu home screen
4. Abra como app nativo!

---

## 🔧 Configuração WhatsApp

### **Via API (Admin)**
```bash
curl -X POST http://localhost:8001/api/config/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Admin-Password: v1ng1t3x" \
  -d '{
    "departments": [
      {
        "name": "AMOSTRAS",
        "displayName": "Amostras e Orçamentos",
        "phone": "5511999999999",
        "message": "Mensagem personalizada"
      }
    ]
  }'
```

### **Formato do Telefone**
- Incluir código do país: `55` (Brasil)
- Incluir DDD: `11` (São Paulo)
- Exemplo completo: `5511999999999`

---

## 🎯 Roadmap Futuro

- [ ] Painel Admin completo com dashboard
- [ ] Notificações push (PWA)
- [ ] Service Worker avançado
- [ ] Firebase Storage para uploads
- [ ] Análise de sentimento
- [ ] Relatórios de atendimento
- [ ] Integração Slack/Discord
- [ ] Multi-idioma

---

## 🐛 Troubleshooting

### **Chat não carrega IA:**
- Verificar `OPENAI_API_KEY` no `.env`
- Verificar logs: `tail -f /var/log/supervisor/backend.err.log`

### **Badge sobrepondo chat:**
- Badge movido para esquerda no `index.html`
- Z-index do chat: `999999`

### **Upload falha:**
- Verificar tamanho máximo: 5MB
- Tipos permitidos: PDF, DOC, DOCX, PNG, JPG, JPEG

---

## 📄 Licença

© 2025 Vingi Têxtil - Todos os direitos reservados

---

## 🙏 Créditos

- **Desenvolvido com**: Emergent AI
- **Design inspirado em**: Windows 10 Fluent Design
- **IA**: OpenAI GPT-4o-mini
- **Ícones**: Lucide React

---

## 📞 Suporte

Para suporte técnico, entre em contato através do próprio chat! 😉
