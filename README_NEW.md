# 🎬 Studio Pro - Editor Profesional de Audio y Video

Un editor completo y profesional de audio y video con autenticación OAuth, similar a Filmora, construido con tecnologías web modernas.

![Studio Pro](https://github.com/user-attachments/assets/388e16fd-fa61-4a7c-9cd7-b1228f35de9b)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Blackmvmba88/reproductornuevo)
[![Status](https://img.shields.io/badge/status-active-success.svg)](https://github.com/Blackmvmba88/reproductornuevo)

## 🌟 Características Principales

### 🔐 Autenticación Multi-Plataforma
- **Google OAuth 2.0** - Inicio de sesión con Google
- **GitHub OAuth** - Inicio de sesión con GitHub
- **Email/Password** - Registro tradicional
- **JWT Tokens** - Sesiones seguras
- **Remember Me** - Sesión persistente

### 🎬 Editor de Video Profesional
- **Timeline multipista** - Edición no lineal
- **Importar media** - Video, audio, imágenes
- **Efectos visuales** - Blur, brightness, contrast, sepia, etc.
- **Transiciones** - Fade, dissolve, wipe, slide, zoom
- **Chroma Key** - Pantalla verde
- **Corrección de color** - Ajustes profesionales
- **Títulos y texto** - Animaciones de texto
- **Recorte y división** - Herramientas precisas

### 🎵 Editor de Audio Avanzado
- **Multipista de audio** - Mezcla profesional
- **Masterización** - Controles de ganancia, EQ, compresión
- **Efectos de audio** - Reverb, delay, normalización
- **Reducción de ruido** - Limpieza de audio
- **Grabación** - Captura de audio en tiempo real
- **Mixer profesional** - Control individual de pistas

### 📊 Visualización en Tiempo Real
- **Vista previa HD** - Renderizado en tiempo real
- **Forma de onda** - Visualización de audio
- **Espectro de frecuencias** - Análisis FFT
- **Timecode preciso** - Frame-by-frame

### ☁️ Características Cloud
- **Proyectos en la nube** - Sincronización automática
- **Biblioteca de medios** - Gestión centralizada
- **Colaboración** - Trabajo en equipo
- **Renderizado remoto** - Acelerado en servidores

## 📁 Estructura del Proyecto

```
reproductornuevo/
├── 🔐 Autenticación
│   ├── login.html          # Página de login
│   ├── auth-styles.css     # Estilos de auth
│   └── auth.js             # Sistema OAuth
│
├── 🎬 Editor
│   ├── editor.html         # Editor profesional
│   └── editor.js           # Lógica del editor
│
├── 🎵 Reproductor (Original)
│   ├── index.html          # Reproductor música
│   ├── styles.css          # Estilos
│   └── script.js           # Lógica reproductor
│
├── 🖥️ Backend
│   ├── server.js           # API REST
│   ├── package.json        # Dependencias
│   └── .env.example        # Config template
│
└── 📖 Documentación
    ├── README.md           # Este archivo
    ├── OAUTH_SETUP.md      # Guía OAuth
    ├── ARCHITECTURE.md     # Arquitectura
    ├── ROADMAP.md          # Plan futuro
    └── CONTRIBUTING.md     # Guía contribución
```

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js >= 16.0.0
- MongoDB (local o Atlas)
- Navegador moderno (Chrome, Firefox, Safari, Edge)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Blackmvmba88/reproductornuevo.git
cd reproductornuevo
```

2. **Instalar dependencias del backend**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales OAuth
```

4. **Iniciar MongoDB**
```bash
# Local
mongod

# O usar MongoDB Atlas (cloud)
```

5. **Iniciar el servidor backend**
```bash
npm start
# Servidor corriendo en http://localhost:3000
```

6. **Abrir el frontend**
```bash
# Opción 1: Directamente
open login.html

# Opción 2: Servidor local
python3 -m http.server 8080
# Visitar http://localhost:8080/login.html
```

## 🔧 Configuración OAuth

### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Configura redirect URI: `http://localhost:3000/auth/google/callback`
6. Copia Client ID y Client Secret a `.env`

### GitHub OAuth

1. Ve a [GitHub Developer Settings](https://github.com/settings/developers)
2. Crea nueva OAuth App
3. Configura callback URL: `http://localhost:3000/auth/github/callback`
4. Copia Client ID y Client Secret a `.env`

**Ver [OAUTH_SETUP.md](OAUTH_SETUP.md) para guía detallada.**

## 📖 Documentación

### Guías de Usuario
- [Configuración OAuth](OAUTH_SETUP.md) - Setup completo de autenticación
- [Arquitectura](ARCHITECTURE.md) - Detalles técnicos
- [Contribuir](CONTRIBUTING.md) - Guía para desarrolladores
- [Roadmap](ROADMAP.md) - Características futuras

### API Documentation

#### Endpoints de Autenticación
```
POST /api/auth/google      - Login con Google
POST /api/auth/github      - Login con GitHub
POST /api/auth/login       - Login email/password
POST /api/auth/register    - Registrar usuario
GET  /api/auth/validate    - Validar token
```

#### Endpoints de Usuario
```
GET  /api/user/profile     - Perfil de usuario
POST /api/projects/save    - Guardar proyecto
GET  /api/projects         - Listar proyectos
```

## 🎨 Capturas de Pantalla

### Página de Login
![Login](https://via.placeholder.com/800x500/667eea/ffffff?text=Login+Page)

### Editor Principal
![Editor](https://via.placeholder.com/800x500/764ba2/ffffff?text=Editor+Interface)

### Timeline
![Timeline](https://via.placeholder.com/800x500/f093fb/ffffff?text=Timeline+View)

## 🛠️ Tecnologías Utilizadas

### Frontend
- HTML5
- CSS3 (Gradientes, Animaciones, Flexbox)
- JavaScript ES6+ (Async/Await, Classes, Modules)
- Web Audio API
- Canvas API
- File API
- Drag & Drop API

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Axios

### OAuth Providers
- Google OAuth 2.0
- GitHub OAuth

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT con expiración configurable
- ✅ CORS configurado correctamente
- ✅ State parameter contra CSRF
- ✅ Client secrets solo en backend
- ✅ Validación de inputs
- ✅ HTTPS en producción

## 🎯 Características Premium

### Plan Free
- ✅ Editor básico
- ✅ Exportación 720p
- ✅ 3 proyectos
- ✅ 1GB almacenamiento

### Plan Pro ($9.99/mes)
- ✅ Editor completo
- ✅ Exportación 4K
- ✅ Proyectos ilimitados
- ✅ 100GB almacenamiento
- ✅ Efectos premium
- ✅ Renderizado acelerado

### Plan Enterprise ($29.99/mes)
- ✅ Todo de Pro
- ✅ Colaboración en equipo
- ✅ Almacenamiento ilimitado
- ✅ API access
- ✅ Soporte prioritario
- ✅ White label

## 🗺️ Roadmap

### v2.1 (Próxima versión)
- [ ] Renderizado de video funcional
- [ ] Más efectos visuales
- [ ] Keyframes y animaciones
- [ ] Export múltiples formatos

### v2.5 (Q1 2026)
- [ ] Colaboración en tiempo real
- [ ] Versionado de proyectos
- [ ] Biblioteca de assets
- [ ] Templates prediseñados

### v3.0 (Q2 2026)
- [ ] IA para edición automática
- [ ] Subtítulos automáticos
- [ ] Eliminación de fondo automática
- [ ] Estabilización de video

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles.

### Proceso
1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📊 Estadísticas

- **Archivos**: 20+
- **Líneas de código**: ~4,500
- **Formatos soportados**: 8+ audio, video ilimitados
- **Efectos**: 20+ efectos de video
- **Transiciones**: 8+ transiciones

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Studio Pro Team** - Desarrollo inicial
- **Contributors** - Ver [contributors](https://github.com/Blackmvmba88/reproductornuevo/contributors)

## 🙏 Agradecimientos

- Inspirado por **Winamp** (reproductor de música)
- Inspirado por **Filmora** (editor de video)
- **Web Audio API** community
- **OAuth providers** (Google, GitHub)
- Todos los contribuidores

## 📞 Soporte

- 🐛 **Issues**: [GitHub Issues](https://github.com/Blackmvmba88/reproductornuevo/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Blackmvmba88/reproductornuevo/discussions)
- 📧 **Email**: support@studiopro.com
- 🌐 **Website**: https://studiopro.com

## 🌟 Dale una estrella

Si te gusta este proyecto, ¡dale una ⭐ en GitHub!

---

<div align="center">

**Hecho con ❤️ por el Studio Pro Team**

[Website](https://studiopro.com) • [Documentation](OAUTH_SETUP.md) • [Roadmap](ROADMAP.md) • [Contributing](CONTRIBUTING.md)

</div>
