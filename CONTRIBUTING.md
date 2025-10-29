# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Reproductor de Música HD! Este documento te guiará en el proceso.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guías de Estilo](#guías-de-estilo)
- [Commits y Pull Requests](#commits-y-pull-requests)

## 📜 Código de Conducta

Este proyecto sigue un código de conducta simple:
- 🤝 Sé respetuoso y considerado
- 💬 Acepta críticas constructivas
- 🎯 Enfócate en lo mejor para el proyecto
- 🌟 Muestra empatía con otros contribuidores

## 🎯 ¿Cómo puedo contribuir?

### 1. Reportar Bugs

Antes de reportar un bug:
- ✅ Verifica que no esté ya reportado en [Issues](https://github.com/Blackmvmba88/reproductornuevo/issues)
- ✅ Asegúrate de estar usando la última versión
- ✅ Prueba en diferentes navegadores si es posible

Al reportar un bug incluye:
```markdown
**Descripción del bug**
Descripción clara y concisa del problema.

**Pasos para reproducir**
1. Ve a '...'
2. Haz clic en '....'
3. Desplázate hasta '....'
4. Ver error

**Comportamiento esperado**
Lo que esperabas que sucediera.

**Screenshots**
Si aplica, agrega screenshots.

**Entorno**
 - OS: [e.g. Windows 10]
 - Browser: [e.g. Chrome 96]
 - Versión: [e.g. 1.0.0]
```

### 2. Sugerir Features

Antes de sugerir una feature:
- ✅ Revisa el [ROADMAP.md](ROADMAP.md)
- ✅ Busca en issues existentes
- ✅ Considera si es útil para la mayoría de usuarios

Al sugerir una feature incluye:
```markdown
**¿Resuelve un problema?**
Descripción clara del problema.

**Describe la solución que te gustaría**
Cómo debería funcionar la feature.

**Alternativas consideradas**
Otras soluciones que consideraste.

**Contexto adicional**
Screenshots, mockups, etc.
```

### 3. Contribuir Código

#### Configuración del Entorno

```bash
# 1. Fork el proyecto en GitHub

# 2. Clona tu fork
git clone https://github.com/tu-usuario/reproductornuevo.git
cd reproductornuevo

# 3. Agrega el repositorio original como upstream
git remote add upstream https://github.com/Blackmvmba88/reproductornuevo.git

# 4. Crea una rama para tu cambio
git checkout -b feature/mi-feature
```

#### Tipos de Contribuciones

**🐛 Bug Fixes**
```bash
git checkout -b fix/descripcion-del-bug
```

**✨ New Features**
```bash
git checkout -b feature/nombre-de-la-feature
```

**📝 Documentation**
```bash
git checkout -b docs/descripcion-cambio
```

**🎨 UI/UX Improvements**
```bash
git checkout -b ui/descripcion-mejora
```

**⚡ Performance**
```bash
git checkout -b perf/descripcion-optimizacion
```

## 🔧 Proceso de Desarrollo

### 1. Antes de Empezar

```bash
# Asegúrate de estar actualizado
git checkout main
git pull upstream main
git checkout tu-rama
git rebase main
```

### 2. Durante el Desarrollo

**Prueba Frecuentemente**
```bash
# Abre index.html en tu navegador
# O usa un servidor local:
python3 -m http.server 8080

# Prueba en múltiples navegadores:
- Chrome/Edge
- Firefox
- Safari (si es posible)
```

**Verifica tu Código**
- ✅ No hay errores en la consola
- ✅ Funciona en diferentes tamaños de pantalla
- ✅ No rompe funcionalidad existente
- ✅ Sigue las guías de estilo

### 3. Testing

**Manual Testing**
```bash
✅ Carga de archivos
✅ Reproducción
✅ Controles
✅ Visualizador
✅ Playlist
✅ Metadata
✅ Responsive
```

**Performance Check**
```javascript
// Verifica en DevTools:
- Memory usage estable
- No memory leaks
- 60 FPS en animaciones
- < 1s tiempo de carga
```

## 📝 Guías de Estilo

### JavaScript

**Formato General**
```javascript
// ✅ Bueno
class MusicPlayer {
    constructor() {
        this.isPlaying = false;
    }
    
    playTrack(index) {
        if (index < 0 || index >= this.playlist.length) {
            return;
        }
        // Logic here...
    }
}

// ❌ Evitar
class musicplayer {
  constructor(){
      this.isPlaying=false
  }
  playTrack(index){if(index<0||index>=this.playlist.length)return;
  }
}
```

**Naming Conventions**
```javascript
// Variables y funciones: camelCase
const audioPlayer = new Audio();
function updatePlaylist() { }

// Clases: PascalCase
class MusicPlayer { }

// Constantes: UPPER_SNAKE_CASE
const MAX_VOLUME = 100;
const DEFAULT_THEME = 'dark';
```

**Comparaciones**
```javascript
// ✅ Usa strict equality
if (value === 0) { }
if (array.length === 0) { }

// ❌ Evita loose equality
if (value == 0) { }
```

**Async/Await**
```javascript
// ✅ Usa async/await con try-catch
async function loadAudio(file) {
    try {
        const metadata = await extractMetadata(file);
        return metadata;
    } catch (error) {
        console.error('Error loading audio:', error);
        return null;
    }
}

// ❌ Evita callback hell
loadAudio(file, function(metadata) {
    processMetadata(metadata, function(result) {
        updateUI(result, function() {
            // ...
        });
    });
});
```

### CSS

**Organización**
```css
/* 1. Layout */
.player-container {
    display: flex;
    flex-direction: column;
}

/* 2. Visual */
.player-container {
    background: #1a1a2e;
    border-radius: 10px;
}

/* 3. Animations */
.player-container:hover {
    transform: scale(1.02);
    transition: transform 0.3s;
}
```

**Naming**
```css
/* ✅ BEM-like naming */
.player-container { }
.player-header { }
.player-header__title { }
.player-header--active { }

/* ❌ Evitar nombres genéricos */
.container { }
.box { }
.item { }
```

### HTML

**Estructura Semántica**
```html
<!-- ✅ Usa elementos semánticos -->
<section class="player-controls">
    <button aria-label="Play">▶</button>
</section>

<!-- ❌ Evita divitis -->
<div class="controls">
    <div onclick="play()">▶</div>
</div>
```

## 💬 Commits y Pull Requests

### Mensajes de Commit

**Formato**
```
<tipo>: <descripción corta>

<descripción larga opcional>

<footer opcional>
```

**Tipos**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `test`: Agregar o corregir tests
- `chore`: Tareas de mantenimiento

**Ejemplos**
```bash
# ✅ Buenos commits
git commit -m "feat: Add shuffle mode to playlist"
git commit -m "fix: Prevent memory leak in visualizer"
git commit -m "docs: Update installation instructions"
git commit -m "perf: Optimize metadata extraction"

# ❌ Evitar
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "changes"
```

### Pull Requests

**Título**
```
<tipo>: Descripción clara y concisa
```

**Descripción**
```markdown
## Qué hace este PR

Descripción clara de los cambios.

## Por qué es necesario

Explicación del problema que resuelve.

## Cómo se probó

- [ ] Pruebas manuales en Chrome
- [ ] Pruebas manuales en Firefox
- [ ] Verificado en mobile
- [ ] Sin errores en consola
- [ ] Performance aceptable

## Screenshots (si aplica)

[Imagen del cambio]

## Checklist

- [ ] Mi código sigue las guías de estilo
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] No rompe funcionalidad existente
- [ ] He probado en múltiples navegadores
```

### Revisión de Código

**Qué Buscar**
- ✅ Código limpio y legible
- ✅ Sin bugs obvios
- ✅ Performance aceptable
- ✅ Sigue guías de estilo
- ✅ Documentación actualizada

**Cómo Comentar**
```markdown
# ✅ Comentario constructivo
"Considera usar `requestAnimationFrame` aquí para mejor performance"

# ❌ Comentario no constructivo
"Este código es horrible"
```

## 🎓 Recursos

### Aprendizaje
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [JavaScript.info](https://javascript.info/)

### Herramientas
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Firefox Developer Tools](https://firefox-source-docs.mozilla.org/devtools-user/)
- [Can I Use](https://caniuse.com/)

## 🙋 ¿Preguntas?

- 💬 Abre un [Discussion](https://github.com/Blackmvmba88/reproductornuevo/discussions)
- 🐛 Reporta un [Issue](https://github.com/Blackmvmba88/reproductornuevo/issues)
- 📧 Contacta a los maintainers

## 🎉 ¡Gracias!

Tu contribución, grande o pequeña, es muy apreciada. ¡Juntos hacemos mejor software! 🚀

---

**Recuerda**: El mejor código es el que nunca escribes. Siempre pregúntate si hay una forma más simple.
