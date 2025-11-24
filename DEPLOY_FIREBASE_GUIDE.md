# 🚀 Guia Completo de Deploy - Vingi Têxtil no Firebase

## 1. PREPARAÇÃO LOCAL (No seu Mac)

### Instalar Firebase CLI
```bash
npm install -g firebase-tools
# ou
yarn global add firebase-tools
```

### Login no Firebase
```bash
firebase login
```

## 2. CONFIGURAÇÃO DO PROJETO FIREBASE

### Inicializar Firebase (se ainda não fez)
```bash
cd /caminho/do/projeto
firebase init
```

**Selecione:**
- ✅ Hosting: Configure files for Firebase Hosting
- ✅ Functions: Configure Cloud Functions (para backend)
- ✅ Firestore: Configure security rules (já configurado)

**Configurações:**
- Project: Selecione seu projeto existente ou crie novo
- Hosting directory: `frontend/build`
- Single-page app: `Yes`
- Automatic builds: `No` (por enquanto)

## 3. BUILD DO FRONTEND

### No diretório frontend:
```bash
cd frontend
yarn install  # se ainda não instalou
yarn build
```

**Resultado esperado:**
```
Compiled successfully.
File sizes after gzip:
  225.9 kB  build/static/js/main.xxx.js
  22.56 kB  build/static/css/main.xxx.css
```

## 4. CONFIGURAR BACKEND (Cloud Functions)

### Estrutura recomendada:
```
/functions
  ├── package.json
  ├── index.js (entry point para Cloud Functions)
  └── ...seu código backend
```

### Criar functions/package.json:
```json
{
  "name": "vingi-backend",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0",
    "fastapi": "não suportado - use Express.js"
  }
}
```

**⚠️ IMPORTANTE:** Firebase Functions **não suporta Python/FastAPI**

## 5. OPÇÕES DE BACKEND

### Opção A: Migrar para Express.js (Node.js)
**Prós:** Integração nativa com Firebase
**Contras:** Precisa reescrever backend

### Opção B: Cloud Run (RECOMENDADO)
**Prós:** Suporta Python/FastAPI, fácil deploy
**Contras:** Custo um pouco maior

### Opção C: Backend em outro servidor
**Prós:** Mantém FastAPI
**Contras:** Precisa configurar CORS

## 6. DEPLOY - OPÇÃO B (CLOUD RUN) - RECOMENDADO

### A. Criar Dockerfile (já existe):
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
```

### B. Deploy Backend no Cloud Run:
```bash
# No diretório raiz do projeto
cd backend

# Build e deploy
gcloud run deploy vingi-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### C. Configurar Variáveis de Ambiente:
```bash
# Adicionar OpenAI Key
gcloud run services update vingi-backend \
  --set-env-vars OPENAI_API_KEY=sk-sua-chave-aqui

# Adicionar senha admin
gcloud run services update vingi-backend \
  --set-env-vars ADMIN_PASSWORD=v1ng1t3x

# Firebase credentials (criar secret)
gcloud secrets create firebase-credentials \
  --data-file=firebase-credentials.json
```

## 7. DEPLOY FRONTEND (Firebase Hosting)

### Atualizar frontend/.env:
```env
REACT_APP_BACKEND_URL=https://vingi-backend-xxx.run.app
REACT_APP_FIREBASE_API_KEY=sua_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
# ... outras configs Firebase
```

### Build e Deploy:
```bash
cd frontend
yarn build

# Deploy
firebase deploy --only hosting
```

## 8. CONFIGURAR DOMÍNIO CUSTOMIZADO

### Firebase Hosting:
```bash
firebase hosting:sites:create vingi-app

# Adicionar domínio
firebase target:apply hosting vingi vingi-app
```

### No Firebase Console:
1. Hosting → Add custom domain
2. Digite seu domínio (ex: app.vingi.com.br)
3. Configure registros DNS conforme instruções

## 9. VARIÁVEIS DE AMBIENTE - RESUMO

### Backend (Cloud Run):
```bash
OPENAI_API_KEY=sk-proj-...
ADMIN_PASSWORD=v1ng1t3x
MONGO_URL=não precisa (usando Firebase)
```

### Frontend (.env):
```env
REACT_APP_BACKEND_URL=https://vingi-backend-xxx.run.app
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

## 10. TESTES PÓS-DEPLOY

### Verificar:
```bash
# Frontend
curl https://seu-app.web.app

# Backend
curl https://vingi-backend-xxx.run.app/api/

# Health check
curl https://vingi-backend-xxx.run.app/health
```

## 11. CUSTOS ESTIMADOS (Firebase)

### Plano Blaze (Pay as you go):
- **Hosting:** ~$0.15/GB transferido (10GB grátis)
- **Firestore:** $0.18/100K leituras (50K grátis/dia)
- **Cloud Run:** $0.00002400/vCPU-second (2M grátis)
- **Estimativa mensal:** $5-20 para tráfego baixo/médio

### Otimização de custos:
- Use cache do Firestore
- Implemente CDN
- Configure limites de budget

## 12. COMANDOS ÚTEIS

```bash
# Ver logs Cloud Run
gcloud run logs read --service vingi-backend --limit 50

# Ver uso Firebase
firebase projects:list

# Rollback deploy
firebase hosting:rollback

# Testar localmente
firebase emulators:start
```

## 13. CHECKLIST FINAL

- [ ] Build frontend sem erros
- [ ] Backend funcionando localmente
- [ ] Variáveis de ambiente configuradas
- [ ] OpenAI Key adicionada ao Cloud Run
- [ ] Firebase Hosting configurado
- [ ] Domínio customizado (opcional)
- [ ] Firestore rules configuradas
- [ ] CORS configurado no backend
- [ ] Testes de produção realizados
- [ ] Monitoring configurado

## 14. TROUBLESHOOTING

### Frontend não carrega:
```bash
# Verificar build
ls -la frontend/build
# Limpar cache
firebase hosting:disable
firebase deploy --only hosting
```

### Backend não responde:
```bash
# Ver logs
gcloud run logs read --service vingi-backend
# Verificar variáveis
gcloud run services describe vingi-backend
```

### CORS errors:
Adicionar no backend (server.py):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://seu-app.web.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 15. SUPORTE E RECURSOS

- Firebase Console: https://console.firebase.google.com
- Cloud Run Console: https://console.cloud.google.com/run
- Documentação: https://firebase.google.com/docs
- Pricing: https://firebase.google.com/pricing

---

**Desenvolvido para Vingi Têxtil - Sistema de Atendimento Online**
**Stack:** React + FastAPI + Firebase/Firestore
