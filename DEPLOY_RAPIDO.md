# 🚀 Deploy Rápido - 5 Passos

## ANTES DE COMEÇAR

```bash
# Instalar ferramentas (só uma vez)
npm install -g firebase-tools
brew install google-cloud-sdk  # ou: https://cloud.google.com/sdk/docs/install
```

---

## PASSO 1: Login

```bash
firebase login
gcloud auth login
```

---

## PASSO 2: Configurar Projeto

```bash
# Escolher projeto Firebase existente
firebase use --add
# Selecione seu projeto na lista

# Configurar projeto Google Cloud (mesmo projeto)
gcloud config set project SEU-PROJETO-ID
```

---

## PASSO 3: Build Frontend

```bash
cd frontend
yarn build
cd ..
```

✅ **Esperado:** Pasta `frontend/build` criada com sucesso

---

## PASSO 4: Deploy Backend (Cloud Run)

```bash
cd backend

# Deploy (primeira vez pergunta região, escolha us-central1)
gcloud run deploy vingi-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# ⏳ Aguarde ~3-5 minutos
# ✅ No final, copia a URL: https://vingi-backend-xxx.run.app
```

### Adicionar variáveis de ambiente:

```bash
# OpenAI Key (OBRIGATÓRIO)
gcloud run services update vingi-backend \
  --update-env-vars OPENAI_API_KEY=sk-sua-chave-openai-aqui

# Senha Admin (OBRIGATÓRIO)
gcloud run services update vingi-backend \
  --update-env-vars ADMIN_PASSWORD=v1ng1t3x
```

---

## PASSO 5: Atualizar Frontend e Deploy

### 5.1. Editar frontend/.env

```bash
cd frontend
nano .env  # ou use seu editor preferido
```

**Cole isso (substitua a URL):**
```env
REACT_APP_BACKEND_URL=https://vingi-backend-xxx.run.app
REACT_APP_FIREBASE_API_KEY=AIzaSyBD...
REACT_APP_FIREBASE_AUTH_DOMAIN=vingi-textil.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vingi-textil
REACT_APP_FIREBASE_STORAGE_BUCKET=vingi-textil.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=275665244985
REACT_APP_FIREBASE_APP_ID=1:275665244985:web:df6890622859f6c57ecee8
```

### 5.2. Rebuild e Deploy

```bash
yarn build
cd ..
firebase deploy --only hosting
```

✅ **Pronto!** Seu app está no ar: `https://SEU-PROJETO.web.app`

---

## 🔧 Comandos Úteis

```bash
# Ver URL do backend
gcloud run services describe vingi-backend --format='value(status.url)'

# Ver logs backend
gcloud run logs read --service vingi-backend --limit 50

# Re-deploy só frontend (mais rápido)
cd frontend && yarn build && cd .. && firebase deploy --only hosting

# Ver info do projeto
firebase projects:list
gcloud projects list

# Rollback deploy
firebase hosting:rollback
```

---

## ❌ Problemas Comuns

### "gcloud: command not found"
```bash
# Instalar: https://cloud.google.com/sdk/docs/install
brew install google-cloud-sdk
```

### "firebase: command not found"
```bash
npm install -g firebase-tools
```

### "Build failed"
```bash
cd frontend
rm -rf node_modules
yarn install
yarn build
```

### "CORS error"
O backend já está configurado. Se persistir, verifique a URL no .env

### "OpenAI error"
```bash
# Verificar se a key foi adicionada
gcloud run services describe vingi-backend
```

---

## 💰 Custos

**Firebase Hosting:** Gratuito até 10GB/mês
**Cloud Run:** ~$5-15/mês (tráfego baixo/médio)
**Firestore:** Gratuito até 50K leituras/dia

**Total estimado:** $5-20/mês

---

## 🎯 Próximos Passos (Opcional)

1. **Domínio customizado:**
   - Firebase Console → Hosting → Add custom domain
   - Adicione: `app.vingi.com.br`

2. **Monitoramento:**
   - Cloud Console → Monitoring
   - Configure alertas de custo

3. **CI/CD:**
   - GitHub Actions para deploy automático

---

**Dúvidas?** Consulte: `DEPLOY_FIREBASE_GUIDE.md`
