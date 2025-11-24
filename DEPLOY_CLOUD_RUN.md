# 🚀 Deploy Definitivo - Cloud Run

## ✅ CORREÇÕES IMPLEMENTADAS

1. ✅ Health check endpoint (`/health`) adicionado
2. ✅ Porta dinâmica configurada corretamente
3. ✅ CORS corrigido (fastapi.middleware.cors)
4. ✅ Dockerfile otimizado

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar, você precisa:

1. **Google Cloud SDK instalado** 
   ```bash
   # Verificar instalação
   gcloud --version
   ```

2. **Autenticação configurada**
   ```bash
   gcloud auth login
   gcloud config set project agenda-44f53
   ```

3. **Arquivo de credenciais do Firebase**
   - O arquivo `firebase-credentials.json` deve estar em `/app/backend/`
   - ⚠️ **IMPORTANTE**: Este arquivo NÃO será incluído no container (está no .dockerignore)

---

## 🔧 OPÇÕES DE DEPLOY

### **OPÇÃO 1: Deploy COM Firebase Admin (RECOMENDADO)**

Se você precisa do Firebase Admin funcionando no Cloud Run:

#### Passo 1: Preparar credenciais
```bash
cd /app/backend

# Copiar credenciais para variável de ambiente
export GOOGLE_APPLICATION_CREDENTIALS_JSON=$(cat firebase-credentials.json)
```

#### Passo 2: Build e Deploy
```bash
gcloud run deploy vingi-backend \
  --source . \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="OPENAI_API_KEY=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,CORS_ORIGINS=*,ADMIN_PASSWORD=v1ng1t3x,GOOGLE_CLOUD_PROJECT=agenda-44f53,FIREBASE_PROJECT_ID=agenda-44f53,FIREBASE_STORAGE_BUCKET=agenda-44f53.firebasestorage.app"
```

⚠️ **ATENÇÃO**: O comando acima NÃO inclui as credenciais do Firebase. Você tem 2 opções:

**Opção A: Usar Secret Manager (MAIS SEGURO)**
```bash
# 1. Criar secret
gcloud secrets create firebase-credentials \
  --data-file=firebase-credentials.json

# 2. Deploy com secret
gcloud run deploy vingi-backend \
  --source . \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-secrets="GOOGLE_APPLICATION_CREDENTIALS_JSON=firebase-credentials:latest" \
  --set-env-vars="OPENAI_API_KEY=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,CORS_ORIGINS=*,ADMIN_PASSWORD=v1ng1t3x,GOOGLE_CLOUD_PROJECT=agenda-44f53,FIREBASE_PROJECT_ID=agenda-44f53,FIREBASE_STORAGE_BUCKET=agenda-44f53.firebasestorage.app"
```

**Opção B: Usar IAM do Cloud Run (MAIS SIMPLES)**
```bash
# O Cloud Run já tem permissões para acessar Firestore no mesmo projeto
# Modifique o firebase_service.py para usar Application Default Credentials
```

---

### **OPÇÃO 2: Deploy SEM Firebase Admin (TESTE RÁPIDO)**

Se você quer apenas testar o deploy básico primeiro:

#### Passo 1: Modificar temporariamente o servidor
Comente a inicialização do Firebase em `server.py` (linhas 17-23)

#### Passo 2: Deploy simples
```bash
cd /app/backend

gcloud run deploy vingi-backend \
  --source . \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="OPENAI_API_KEY=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,CORS_ORIGINS=*,ADMIN_PASSWORD=v1ng1t3x"
```

---

## 🧪 TESTAR O DEPLOY

Após o deploy bem-sucedido, você receberá uma URL:
```
Service URL: https://vingi-backend-xxxxx-uc.a.run.app
```

### Teste 1: Health Check
```bash
curl https://vingi-backend-xxxxx-uc.a.run.app/health
# Esperado: {"status":"ok"}
```

### Teste 2: API Root
```bash
curl https://vingi-backend-xxxxx-uc.a.run.app/api/
# Esperado: {"message":"Hello World"}
```

### Teste 3: Status Endpoint
```bash
curl -X POST https://vingi-backend-xxxxx-uc.a.run.app/api/status \
  -H "Content-Type: application/json" \
  -d '{"client_name":"teste"}'
```

---

## 📊 VERIFICAR LOGS

Se algo der errado:

```bash
# Logs em tempo real
gcloud run logs tail vingi-backend --region=us-central1

# Logs completos
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=vingi-backend" --limit=50 --format=json
```

---

## 🔄 ATUALIZAR O FRONTEND

Após o deploy do backend, atualize o frontend:

1. Edite `/app/frontend/.env.production`:
```env
REACT_APP_BACKEND_URL=https://vingi-backend-xxxxx-uc.a.run.app
```

2. Deploy do frontend:
```bash
cd /app/frontend
yarn build
firebase deploy --only hosting
```

---

## ⚠️ TROUBLESHOOTING

### Erro: "Container failed to start"
- ✅ **RESOLVIDO**: Health check adicionado
- Verifique logs: `gcloud run logs tail vingi-backend`

### Erro: "Firebase credentials not found"
- Use Secret Manager (Opção A)
- OU Configure IAM do Cloud Run

### Erro: "Port already in use"
- ✅ **RESOLVIDO**: Porta dinâmica configurada

### Erro: "CORS policy"
- Verifique se `CORS_ORIGINS=*` está nas env vars
- OU configure domínios específicos

---

## 📌 PRÓXIMOS PASSOS

1. ✅ Deploy do backend no Cloud Run
2. ⏳ Atualizar URL do backend no frontend
3. ⏳ Deploy do frontend no Firebase Hosting
4. ⏳ Testar todas as funcionalidades
5. ⏳ Configurar domínio customizado (opcional)

---

## 🆘 SUPORTE

Se você encontrar erros:
1. Copie o output completo do comando
2. Copie os logs do Cloud Run
3. Compartilhe comigo para análise
