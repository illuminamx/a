# 🚀 Deploy a Vercel - Guía Completa

## 📋 Requisitos Previos

1. **Cuenta de Vercel**: https://vercel.com/signup
2. **Cuenta de GitHub**: https://github.com
3. **Credenciales de Firebase** (las que ya tienes)

---

## 🔧 Paso 1: Subir el Código a GitHub

### Opción A: Usando Emergent (Recomendado)
1. En Emergent, usa el botón **"Save to GitHub"** en el chat
2. Sigue las instrucciones para conectar tu repo

### Opción B: Manual
```bash
# Inicializar repo (si no lo has hecho)
git init
git add .
git commit -m "Initial commit"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

---

## 🌐 Paso 2: Deployar en Vercel

### 1. Ir a Vercel
- Ve a https://vercel.com
- Haz clic en **"New Project"**

### 2. Importar Repositorio
- Selecciona tu repositorio de GitHub
- Haz clic en **"Import"**

### 3. Configurar el Proyecto

**Framework Preset:** 
- Selecciona `Create React App`

**Root Directory:**
- Cambia a `frontend` (importante!)

**Build Command:**
- Deja por defecto: `npm run build` o `yarn build`

**Output Directory:**
- Deja por defecto: `build`

### 4. Variables de Entorno

Haz clic en **"Environment Variables"** y agrega **TODAS** estas:

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

**IMPORTANTE:** 
- `CI=false` es necesario para que el build no falle por warnings
- Copia cada variable **una por una** en Vercel

### 5. Deploy
- Haz clic en **"Deploy"**
- Espera 2-3 minutos

---

## 🎯 Paso 3: Configurar Firebase (Importante!)

### Agregar dominio de Vercel a Firebase Auth

1. Ve a Firebase Console
2. **Authentication** → **Settings** → **Authorized domains**
3. Agrega tu dominio de Vercel: `tu-app.vercel.app`
4. Haz clic en **"Add domain"**

**SIN ESTE PASO, EL LOGIN NO FUNCIONARÁ EN PRODUCCIÓN**

---

## ✅ Verificar Deploy

1. Vercel te dará una URL como: `https://tu-proyecto.vercel.app`
2. Visita la URL y verifica:
   - ✅ La página carga
   - ✅ El catálogo se ve bien
   - ✅ Puedes hacer login
   - ✅ Los productos se cargan desde Firebase

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios y los subas a GitHub:
```bash
git add .
git commit -m "descripción del cambio"
git push
```

**Vercel automáticamente desplegará los cambios** en 1-2 minutos.

---

## 🐛 Solución de Problemas

### Error: "Module not found"
- Revisa que la Root Directory esté en `frontend`

### Error de Firebase en producción
- Verifica que agregaste TODAS las variables de entorno
- Verifica que agregaste el dominio de Vercel en Firebase Auth

### La página no carga
- Ve a Vercel → Tu proyecto → Deployments → Logs
- Busca errores en los logs de build

---

## 📞 Contacto

Si tienes problemas, revisa:
- Logs de Vercel: https://vercel.com/[tu-usuario]/[tu-proyecto]/logs
- Firebase Console: https://console.firebase.google.com

---

**¡Listo! Tu app estará en producción 🎉**
