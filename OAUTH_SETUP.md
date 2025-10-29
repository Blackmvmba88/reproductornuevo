# Studio Pro - OAuth Configuration Guide

## 🔐 Configuración de Autenticación OAuth

Este documento explica cómo configurar Google OAuth y GitHub OAuth para Studio Pro.

## 📋 Requisitos Previos

- Cuenta de Google Cloud Platform
- Cuenta de GitHub
- Servidor backend (Node.js recomendado)
- Base de datos (MongoDB, PostgreSQL, etc.)

---

## 🌐 Configurar Google OAuth

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Navega a **APIs & Services** > **Credentials**

### Paso 2: Configurar Pantalla de Consentimiento OAuth

1. Ve a **OAuth consent screen**
2. Selecciona tipo de usuario (Externo para usuarios públicos)
3. Completa la información requerida:
   - **App name**: Studio Pro
   - **User support email**: tu-email@example.com
   - **App logo**: Logo de Studio Pro
   - **App domain**: tu-dominio.com
4. Agrega scopes necesarios:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`

### Paso 3: Crear Credenciales OAuth 2.0

1. Ve a **Credentials** > **Create Credentials** > **OAuth Client ID**
2. Tipo de aplicación: **Web application**
3. Nombre: **Studio Pro Web Client**
4. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://tu-dominio.com
   ```
5. **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/google/callback
   https://tu-dominio.com/auth/google/callback
   ```
6. Copia el **Client ID** y **Client Secret**

### Paso 4: Configurar en la Aplicación

Edita `auth.js` y reemplaza:
```javascript
google: {
    clientId: 'TU-CLIENT-ID.apps.googleusercontent.com',
    redirectUri: window.location.origin + '/auth/google/callback',
    scope: 'profile email'
}
```

---

## 🐙 Configurar GitHub OAuth

### Paso 1: Crear OAuth App en GitHub

1. Ve a [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** > **New OAuth App**
3. Completa la información:
   - **Application name**: Studio Pro
   - **Homepage URL**: `https://tu-dominio.com`
   - **Application description**: Editor profesional de audio y video
   - **Authorization callback URL**: `https://tu-dominio.com/auth/github/callback`

### Paso 2: Obtener Credenciales

1. GitHub te mostrará el **Client ID**
2. Genera un nuevo **Client Secret**
3. **⚠️ IMPORTANTE**: Guarda el Client Secret, no se mostrará de nuevo

### Paso 3: Configurar en la Aplicación

Edita `auth.js` y reemplaza:
```javascript
github: {
    clientId: 'TU-GITHUB-CLIENT-ID',
    redirectUri: window.location.origin + '/auth/github/callback',
    scope: 'user:email'
}
```

---

## 🚀 Backend API Endpoints (Node.js/Express Ejemplo)

Crea estos endpoints en tu backend:

### auth-server.js

```javascript
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Configuration
const config = {
    github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
    },
    jwtSecret: process.env.JWT_SECRET
};

// GitHub OAuth Callback
router.post('/api/auth/github', async (req, res) => {
    try {
        const { code } = req.body;
        
        // Exchange code for access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: config.github.clientId,
            client_secret: config.github.clientSecret,
            code: code
        }, {
            headers: { Accept: 'application/json' }
        });
        
        const accessToken = tokenResponse.data.access_token;
        
        // Get user info
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });
        
        const user = userResponse.data;
        
        // Get user email if not public
        if (!user.email) {
            const emailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `token ${accessToken}` }
            });
            user.email = emailResponse.data.find(e => e.primary).email;
        }
        
        // Create or update user in database
        const dbUser = await createOrUpdateUser({
            provider: 'github',
            providerId: user.id,
            email: user.email,
            name: user.name,
            username: user.login,
            picture: user.avatar_url
        });
        
        // Generate JWT
        const token = jwt.sign(
            { userId: dbUser.id, provider: 'github' },
            config.jwtSecret,
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            user: dbUser,
            access_token: token
        });
    } catch (error) {
        console.error('GitHub auth error:', error);
        res.status(500).json({ success: false, message: 'Authentication failed' });
    }
});

// Email/Password Login
router.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        
        // Verify credentials
        const user = await verifyUserCredentials(email, password);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }
        
        // Generate JWT
        const expiresIn = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            { userId: user.id, provider: 'email' },
            config.jwtSecret,
            { expiresIn }
        );
        
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Error de servidor' });
    }
});

// Email/Password Register
router.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'El email ya está registrado' 
            });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create user
        const user = await createUser({
            provider: 'email',
            email,
            name,
            password: hashedPassword
        });
        
        res.json({
            success: true,
            message: 'Cuenta creada exitosamente'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Error al crear cuenta' });
    }
});

// Validate Token
router.get('/api/auth/validate', authenticateToken, (req, res) => {
    res.json({ success: true, userId: req.userId });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.sendStatus(401);
    }
    
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.userId = decoded.userId;
        next();
    });
}

module.exports = router;
```

---

## 🔒 Variables de Entorno (.env)

Crea un archivo `.env` en tu backend:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-client-secret

# JWT
JWT_SECRET=tu-secret-key-muy-segura-y-larga

# Database
DATABASE_URL=mongodb://localhost:27017/studiopro
# O para PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/studiopro

# Server
PORT=3000
NODE_ENV=development
```

---

## 📦 Dependencias del Backend

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.4.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "mongoose": "^7.3.0"
  }
}
```

Instalar con:
```bash
npm install express axios jsonwebtoken bcrypt dotenv cors mongoose
```

---

## 🗄️ Modelo de Base de Datos (MongoDB/Mongoose)

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: ['email', 'google', 'github'],
        required: true
    },
    providerId: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    username: String,
    picture: String,
    password: String, // Solo para provider: 'email'
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    subscription: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);
```

---

## 🧪 Testing OAuth Locally

### Para desarrollo local:

1. **ngrok** para exponer localhost:
   ```bash
   ngrok http 3000
   ```

2. Usa la URL de ngrok en las configuraciones OAuth:
   - Google: `https://tu-url.ngrok.io/auth/google/callback`
   - GitHub: `https://tu-url.ngrok.io/auth/github/callback`

---

## ⚠️ Seguridad Importante

1. **Nunca expongas Client Secrets** en el frontend
2. **Siempre valida tokens** en el backend
3. **Usa HTTPS** en producción
4. **Implementa rate limiting** para prevenir ataques
5. **Sanitiza inputs** del usuario
6. **Implementa CSRF protection**
7. **Usa variables de entorno** para credenciales

---

## 🚀 Desplegar en Producción

### Opciones de Hosting:

1. **Backend**: 
   - Heroku
   - Vercel
   - Railway
   - AWS EC2/Lambda
   - Google Cloud Run

2. **Frontend**:
   - Vercel
   - Netlify
   - GitHub Pages
   - Cloudflare Pages

3. **Base de Datos**:
   - MongoDB Atlas
   - PostgreSQL en Railway/Heroku
   - Supabase
   - Firebase

---

## 📚 Recursos Adicionales

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [JWT.io](https://jwt.io/)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)

---

## ✅ Checklist de Configuración

- [ ] Proyecto de Google Cloud creado
- [ ] OAuth consent screen configurado
- [ ] Google Client ID y Secret obtenidos
- [ ] GitHub OAuth App creada
- [ ] GitHub Client ID y Secret obtenidos
- [ ] Variables de entorno configuradas
- [ ] Backend API implementado
- [ ] Base de datos configurada
- [ ] HTTPS habilitado en producción
- [ ] Redirect URIs configurados correctamente
- [ ] Tokens JWT funcionando
- [ ] Testing completo realizado

---

**¡Listo!** Tu sistema de autenticación OAuth está configurado. 🎉
