# 🚀 DEPLOY EN VERCEL - GUÍA SIMPLE

## ✅ Pasos (TODO automático, NO necesitas configurar nada)

### 1️⃣ Sube tu código a GitHub
- Usa el botón **"Save to GitHub"** en Emergent

### 2️⃣ Ve a Vercel
- https://vercel.com
- Click **"New Project"**
- Importa tu repositorio de GitHub

### 3️⃣ NO TOQUES NADA (Vercel configurará automáticamente)
- Vercel detectará el proyecto
- **IMPORTANTE**: Si pregunta por Root Directory, déjalo en `.` (raíz)
- Solo da click en **"Deploy"**

**Si te aparecen opciones de configuración:**
- Root Directory: `.` (raíz del proyecto)
- Build Command: déjalo vacío (usa vercel.json)
- Output Directory: déjalo vacío (usa vercel.json)
- Install Command: déjalo vacío (usa vercel.json)

### 4️⃣ Agrega Variables de Entorno
Después del primer deploy (aunque falle), ve a:
- Tu proyecto → **Settings** → **Environment Variables**
- Agrega CADA UNA de estas variables:

```
CI=false
GENERATE_SOURCEMAP=false
REACT_APP_FIREBASE_API_KEY=AIzaSyAfGUY4o4Q82aUL0_Q_i_V3F3LrFo_ili4
REACT_APP_FIREBASE_AUTH_DOMAIN=jessica-61abf.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=jessica-61abf
REACT_APP_FIREBASE_STORAGE_BUCKET=jessica-61abf.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=768498636608
REACT_APP_FIREBASE_APP_ID=1:768498636608:web:857cc073ba02c6d7b00ca5
REACT_APP_FIREBASE_MEASUREMENT_ID=G-2TQBLT25TG
```

**Cómo agregar:**
1. Click "Add New"
2. Key: `CI` → Value: `false`
3. Aplica a: Production, Preview, Development
4. Click "Save"
5. Repite para cada variable

### 5️⃣ Re-deploy
- Ve a **Deployments**
- Click en los 3 puntos del último deploy
- Click **"Redeploy"**

### 6️⃣ Agrega dominio a Firebase
- Firebase Console → Authentication → Settings → Authorized domains
- Agrega: `tu-proyecto.vercel.app`

---

## ⚡ SI FALLA EL DEPLOY

Si el primer deploy falla, es NORMAL. Solo:
1. Agrega las variables de entorno (paso 4)
2. Haz Redeploy (paso 5)
3. ¡Listo!

---

## 📱 Tu app estará en:
`https://tu-proyecto.vercel.app`

**¡Eso es todo! 🎉**
