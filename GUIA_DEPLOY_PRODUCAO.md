# 🚀 Guia Completo de Deploy para Produção
## Sistema de Atendimento Online - Vingi Têxtil

---

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Deploy Backend (FastAPI)](#deploy-backend-fastapi)
4. [Deploy Frontend (React)](#deploy-frontend-react)
5. [Configuração do Firebase](#configuração-do-firebase)
6. [Segurança e Boas Práticas](#segurança-e-boas-práticas)
7. [Monitoramento e Manutenção](#monitoramento-e-manutenção)

---

## 🔧 Pré-requisitos

### Ferramentas Necessárias
- Node.js (v18+)
- Python (v3.10+)
- Git
- Firebase CLI
- Conta Firebase (já configurada)
- Chave OpenAI API

### Credenciais Já Configuradas
- ✅ Firebase Project ID: `agenda-44f53`
- ✅ OpenAI API Key: Configurada no .env
- ✅ Senha Admin: `v1ng1t3x`

---

## ⚙️ Configuração do Ambiente

### 1. Clonar o Repositório
```bash
git clone <seu-repositorio>
cd app
```

### 2. Configurar Backend

#### Instalar Dependências Python
```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Configurar Variáveis de Ambiente (.env)
Crie o arquivo `backend/.env` com:
```env
# OpenAI
OPENAI_API_KEY=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

# Admin
ADMIN_PASSWORD=v1ng1t3x

# Firebase Config (já configurado)
GOOGLE_CLOUD_PROJECT=agenda-44f53
FIREBASE_API_KEY=AIzaSyASzNgH9ryGsnX8wX3iQGHFSGPAZV82F_Y
FIREBASE_AUTH_DOMAIN=agenda-44f53.firebaseapp.com
FIREBASE_PROJECT_ID=agenda-44f53
FIREBASE_STORAGE_BUCKET=agenda-44f53.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=275665244985
FIREBASE_APP_ID=1:275665244985:web:df6890622859f6c57ecee8

# CORS
CORS_ORIGINS=https://seu-dominio.com
```

#### Arquivo de Credenciais Firebase
O arquivo `backend/firebase-credentials.json` já está configurado.
**⚠️ IMPORTANTE: NUNCA commite este arquivo para Git!**

### 3. Configurar Frontend

#### Instalar Dependências
```bash
cd ../frontend
yarn install
```

#### Configurar Variáveis de Ambiente (.env)
Crie o arquivo `frontend/.env` com:
```env
# Backend URL (atualize para seu domínio de produção)
REACT_APP_BACKEND_URL=https://api.seu-dominio.com

# Firebase Config
REACT_APP_FIREBASE_API_KEY=AIzaSyASzNgH9ryGsnX8wX3iQGHFSGPAZV82F_Y
REACT_APP_FIREBASE_AUTH_DOMAIN=agenda-44f53.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=agenda-44f53
REACT_APP_FIREBASE_STORAGE_BUCKET=agenda-44f53.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=275665244985
REACT_APP_FIREBASE_APP_ID=1:275665244985:web:df6890622859f6c57ecee8
```

---

## 🖥️ Deploy Backend (FastAPI)

### Opção 1: Deploy em Servidor VPS/Cloud (Recomendado)

#### 1. Instalar Dependências do Sistema
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx
```

#### 2. Configurar Aplicação
```bash
cd /var/www/atendimento-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 3. Criar Serviço Systemd
Criar arquivo `/etc/systemd/system/atendimento-backend.service`:
```ini
[Unit]
Description=Atendimento Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/atendimento-backend
Environment="PATH=/var/www/atendimento-backend/venv/bin"
ExecStart=/var/www/atendimento-backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

#### 4. Iniciar Serviço
```bash
sudo systemctl daemon-reload
sudo systemctl enable atendimento-backend
sudo systemctl start atendimento-backend
sudo systemctl status atendimento-backend
```

#### 5. Configurar Nginx
Criar arquivo `/etc/nginx/sites-available/atendimento-api`:
```nginx
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/atendimento-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Configurar SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seu-dominio.com
```

### Opção 2: Deploy com Docker

#### Dockerfile (backend/Dockerfile)
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Comandos Docker
```bash
cd backend
docker build -t atendimento-backend .
docker run -d -p 8001:8001 --env-file .env atendimento-backend
```

---

## 🌐 Deploy Frontend (React)

### Opção 1: Firebase Hosting (Recomendado)

#### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2. Fazer Login
```bash
firebase login
```

#### 3. Inicializar Firebase no Projeto
```bash
cd frontend
firebase init hosting
```

Selecione:
- ✅ Use existing project: `agenda-44f53`
- ✅ Public directory: `build`
- ✅ Single-page app: `Yes`
- ✅ Automatic builds with GitHub: `No` (opcional)

#### 4. Build da Aplicação
```bash
yarn build
```

#### 5. Deploy
```bash
firebase deploy --only hosting
```

Sua aplicação estará disponível em:
`https://agenda-44f53.web.app`

#### 6. Configurar Domínio Personalizado (Opcional)
No Firebase Console:
1. Vá em Hosting
2. Clique em "Add custom domain"
3. Siga as instruções para adicionar registros DNS

### Opção 2: Deploy em Vercel

```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Opção 3: Deploy Manual (Nginx)

#### 1. Build
```bash
cd frontend
yarn build
```

#### 2. Copiar Build
```bash
sudo cp -r build/* /var/www/atendimento-frontend/
```

#### 3. Configurar Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /var/www/atendimento-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔥 Configuração do Firebase

### Regras de Segurança Firestore

No Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura para todos (chat público)
    match /sessions/{sessionId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Proteger dados sensíveis
    match /candidates/{candidateId} {
      allow read, write: if request.auth != null || 
                          request.headers['x-admin-password'] == 'v1ng1t3x';
    }
    
    // Knowledge Base - apenas admin
    match /knowledge_base/{docId} {
      allow read: if true;
      allow write: if request.headers['x-admin-password'] == 'v1ng1t3x';
    }
    
    // Tickets
    match /tickets/{ticketId} {
      allow read, write: if request.headers['x-admin-password'] == 'v1ng1t3x';
    }
  }
}
```

---

## 🔒 Segurança e Boas Práticas

### 1. Variáveis de Ambiente

**❌ NUNCA faça:**
- Commitar arquivos `.env` para Git
- Expor credenciais no código
- Usar credenciais de desenvolvimento em produção

**✅ SEMPRE faça:**
- Usar variáveis de ambiente
- Rotacionar chaves regularmente
- Usar HTTPS em produção
- Validar inputs no backend

### 2. Proteção de Credenciais

#### Arquivos a NÃO commitar:
```
backend/.env
backend/firebase-credentials.json
frontend/.env
*.env
*.env.*
*credentials.json*
```

#### Verificar .gitignore:
```bash
cat .gitignore | grep -E "\.env|credentials"
```

### 3. CORS e Headers de Segurança

No backend, configurar CORS adequadamente:
```python
# server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-dominio.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Monitoramento e Manutenção

### 1. Logs do Backend

#### Ver logs em tempo real:
```bash
# Systemd
sudo journalctl -u atendimento-backend -f

# Docker
docker logs -f <container-id>
```

### 2. Backups do Firebase

Configure backups automáticos no Firebase Console:
- Settings > Project Settings > Service Accounts
- Crie rotinas de export regulares

### 3. Monitoramento de Performance

Use Firebase Analytics para monitorar:
- Tempo de resposta
- Erros
- Uso da aplicação

### 4. Atualizações

#### Backend:
```bash
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
sudo systemctl restart atendimento-backend
```

#### Frontend:
```bash
cd frontend
yarn upgrade
yarn build
firebase deploy --only hosting
```

---

## 🧪 Testes Antes do Deploy

### 1. Testar Backend Localmente
```bash
cd backend
source venv/bin/activate
uvicorn server:app --reload
# Testar em http://localhost:8000
```

### 2. Testar Frontend Localmente
```bash
cd frontend
yarn start
# Testar em http://localhost:3000
```

### 3. Build de Produção
```bash
# Frontend
cd frontend
yarn build
# Verificar pasta build/

# Backend
python -m pytest tests/  # Se houver testes
```

---

## 📞 Suporte e Troubleshooting

### Problemas Comuns

#### Backend não inicia:
```bash
# Verificar logs
sudo journalctl -u atendimento-backend -n 50

# Verificar porta
sudo netstat -tulpn | grep 8001

# Verificar variáveis de ambiente
env | grep -E "OPENAI|FIREBASE"
```

#### Frontend não conecta ao backend:
- Verificar `REACT_APP_BACKEND_URL` no `.env`
- Verificar CORS no backend
- Verificar SSL/HTTPS

#### Firebase não conecta:
- Verificar credenciais no console
- Verificar regras do Firestore
- Verificar API keys

---

## 📝 Checklist Final de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Firebase credentials copiados
- [ ] Build do frontend criado
- [ ] Backend testado localmente
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS configurado
- [ ] Domínio configurado
- [ ] Firestore rules aplicadas
- [ ] Backups configurados
- [ ] Monitoramento ativo
- [ ] Documentação atualizada

---

## 🎉 Pronto para Produção!

Seu sistema está agora configurado e pronto para uso em produção com:
- ✅ Interface Premium Responsiva
- ✅ Tema Claro/Escuro
- ✅ Persistência de Dados (Firebase)
- ✅ Sistema de Tickets
- ✅ Base de Conhecimento IA
- ✅ Analytics Completo
- ✅ Segurança Implementada

**URL de Acesso:**
- Frontend: `https://agenda-44f53.web.app` (ou seu domínio)
- Admin: `https://agenda-44f53.web.app/admin`
- Senha Admin: `v1ng1t3x`

---

**Desenvolvido com ❤️ para Vingi Têxtil**
