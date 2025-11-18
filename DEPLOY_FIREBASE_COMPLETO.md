# 🚀 Deploy Firebase - Guia Completo e Definitivo

## ⚠️ **IMPORTANTE - LEIA PRIMEIRO**

Este sistema foi desenvolvido com **MongoDB** no preview. Para deploy Firebase, você tem 2 opções:

### **Opção 1: Firebase (Recomendado para você)**
- ✅ Firestore como banco de dados
- ✅ Firebase Hosting para frontend
- ✅ Firebase Functions para backend
- ✅ Tudo integrado e gerenciado pelo Firebase

### **Opção 2: Manter MongoDB + Deploy Manual**
- Backend em servidor separado (Heroku, Railway, etc)
- MongoDB Atlas (cloud)
- Frontend no Firebase Hosting

**Vou preparar a Opção 1 (Firebase completo) para você!**

---

## 📋 **CHECKLIST PRÉ-DEPLOY**

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login no Firebase
```bash
firebase login
```

### 3. Criar Projeto Firebase
1. Acesse: https://console.firebase.google.com
2. Clique "Adicionar projeto"
3. Nome: **vingi-textil**
4. Analytics: Opcional
5. Confirme criação

### 4. Ativar Serviços Firebase
No console Firebase:
- ✅ **Firestore Database** (em modo produção)
- ✅ **Hosting**
- ✅ **Functions** (plano Blaze - pago conforme uso)
- ✅ **Authentication** (opcional)

---

## 🔧 **PREPARAÇÃO DO CÓDIGO**

### Arquivos que Preciso Criar para Firebase:

#### 1. `firebase.json` (raiz do projeto)
```json
{
  "hosting": {
    "public": "frontend/build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "python39"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

#### 2. `firestore.rules`
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Sessions - público pode criar e ler suas próprias
    match /sessions/{sessionId} {
      allow read, write: if true;
    }
    
    // Messages - público pode criar
    match /messages/{messageId} {
      allow read, write: if true;
    }
    
    // Knowledge Base - apenas leitura pública
    match /knowledge_base/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admin only collections
    match /candidates/{docId} {
      allow read, write: if request.auth != null;
    }
    
    match /ratings/{docId} {
      allow read, write: if true;
    }
  }
}
```

#### 3. `.firebaserc`
```json
{
  "projects": {
    "default": "vingi-textil"
  }
}
```

---

## 🛠️ **COMANDOS DE DEPLOY**

### **OPÇÃO A: Deploy Apenas Frontend (Mais Simples)**

Se você quer só o frontend no Firebase e manter backend separado:

```bash
# 1. Build do frontend
cd /app/frontend
yarn install
yarn build

# 2. Inicializar Firebase (se ainda não fez)
cd /app
firebase init hosting

# 3. Deploy
firebase deploy --only hosting
```

### **OPÇÃO B: Deploy Completo (Frontend + Backend Firebase Functions)**

Se você quer tudo no Firebase:

```bash
# 1. Build frontend
cd /app/frontend
yarn build

# 2. Preparar backend para Functions
cd /app/backend
pip install -t ./lib -r requirements.txt

# 3. Deploy tudo
cd /app
firebase deploy
```

---

## 🎨 **CORRIGIR CSS/VISUAL**

Se o visual está quebrado no deploy, o problema é:

### Problema: Caminhos de CSS quebrados

**Solução**: Adicionar `homepage` no `package.json`

```json
{
  "name": "vingi-textil-frontend",
  "version": "0.1.0",
  "homepage": ".",
  ...
}
```

### Build Correto:
```bash
cd /app/frontend
yarn build
```

Isso garante que os arquivos CSS sejam carregados corretamente.

---

## 🔥 **MIGRAR DE MONGODB PARA FIRESTORE**

### Estrutura Firestore (equivalente ao MongoDB):

#### **Collection: sessions**
```javascript
{
  id: string,
  userId: string,
  startedAt: timestamp,
  status: string,
  department: string,
  currentAgentId: string
}
```

#### **Collection: messages**
```javascript
{
  id: string,
  sessionId: string,
  sender: string,
  text: string,
  timestamp: timestamp
}
```

#### **Collection: knowledge_base**
```javascript
{
  category: string,
  title: string,
  content: string,
  createdAt: timestamp
}
```

### Código Frontend para Firestore:

```javascript
// frontend/src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "vingi-textil.firebaseapp.com",
  projectId: "vingi-textil",
  storageBucket: "vingi-textil.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

## 🚦 **COMANDOS PASSO A PASSO**

### **Para Deploy Simples (Apenas Frontend)**:

```bash
# 1. Entre na pasta frontend
cd /app/frontend

# 2. Instale dependências
yarn install

# 3. Build
yarn build

# 4. Volte para raiz
cd /app

# 5. Inicialize Firebase (apenas primeira vez)
firebase init hosting
# Selecione: frontend/build como pasta pública
# Single-page app: Yes
# Overwrite index.html: No

# 6. Deploy
firebase deploy --only hosting

# 7. URL do seu site
# https://vingi-textil.web.app
```

---

## ✅ **CHECKLIST FINAL**

Antes de fazer deploy, verifique:

- [ ] Firebase CLI instalado (`firebase --version`)
- [ ] Logado no Firebase (`firebase login`)
- [ ] Projeto criado no console Firebase
- [ ] Firestore ativado
- [ ] `yarn build` executado com sucesso
- [ ] `homepage: "."` adicionado no package.json
- [ ] Variáveis de ambiente configuradas
- [ ] Testado localmente (`yarn start`)

---

## 🐛 **SOLUÇÕES DE PROBLEMAS COMUNS**

### Problema: "Session undefined"
**Causa**: Backend não está respondendo
**Solução**: Verificar `REACT_APP_BACKEND_URL` no `.env`

### Problema: CSS quebrado
**Causa**: Caminhos relativos errados
**Solução**: 
```json
// package.json
"homepage": "."
```

### Problema: APIs não funcionam
**Causa**: CORS ou backend offline
**Solução**: Backend precisa estar rodando e configurar CORS

### Problema: Firestore "permission denied"
**Causa**: Regras muito restritivas
**Solução**: Revisar `firestore.rules`

---

## 📊 **CUSTOS FIREBASE**

### Plano Spark (Gratuito):
- ✅ Firestore: 50k leituras/dia
- ✅ Hosting: 10GB/mês
- ❌ Functions: Não disponível

### Plano Blaze (Pay as you go):
- ✅ Firestore: $0.18 por 100k leituras
- ✅ Hosting: $0.15/GB após 10GB
- ✅ Functions: $0.40 por milhão de invocações

**Estimativa para startup**: ~$5-20/mês

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

1. **Deploy Frontend Primeiro**
   ```bash
   cd /app/frontend
   yarn build
   cd /app
   firebase deploy --only hosting
   ```

2. **Testar URL Firebase**
   - Acessar https://vingi-textil.web.app
   - Verificar se carrega

3. **Configurar Backend**
   - Opção 1: Firebase Functions (complexo)
   - Opção 2: Backend separado (Heroku/Railway)

4. **Migrar Dados**
   - Exportar MongoDB
   - Importar para Firestore

---

## 💡 **MINHA RECOMENDAÇÃO**

Para você começar rápido:

1. **Deploy só o Frontend no Firebase Hosting** ✅
2. **Backend em servidor separado** (Railway/Render - gratuito)
3. **MongoDB Atlas** (gratuito até 512MB)

Isso funciona 100% e é gratuito!

**Comando único para deploy frontend**:
```bash
cd /app/frontend && yarn build && cd /app && firebase deploy --only hosting
```

---

## 📞 **SUPORTE**

Se algo der errado:
1. Verifique logs: `firebase functions:log`
2. Console Firebase: https://console.firebase.google.com
3. Teste local: `firebase serve`

**Sistema pronto para deploy Firebase! 🚀**
