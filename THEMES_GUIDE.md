# 🎨 Studio Pro - Guía de Temas

## Descripción

Studio Pro incluye un sistema de temas dinámico con **11 esquemas de colores audaces y vibrantes**, incluyendo temas inspirados en Neon Genesis Evangelion, Hotline Miami, Cyberpunk, y más.

## Temas Disponibles

### 1. 🎮 **Neon Green** (Default)
- **Colores principales**: Verde neón (#00ff88) y Cyan (#00d4ff)
- **Estilo**: Clásico Winamp retro con colores neón vibrantes
- **Mejor para**: Uso general, nostalgia de los 90s

### 2. 🤖 **Evangelion**
- **Colores principales**: Verde lima (#00ff41) y Púrpura (#9d00ff)
- **Estilo**: Inspirado en Neon Genesis Evangelion
- **Mejor para**: Fans del anime, ambiente futurista oscuro
- **Características**: Contraste alto, muy dramático

### 3. 🌅 **Sunset Fire**
- **Colores principales**: Naranja (#ff6b00) y Rosa (#ff0077)
- **Estilo**: Atardecer cálido con toques de fuego
- **Mejor para**: Ambiente cálido y energético

### 4. 🌊 **Ocean Wave**
- **Colores principales**: Cyan (#00ffff) y Azul (#0088ff)
- **Estilo**: Profundidades del océano
- **Mejor para**: Ambiente relajante, música chill

### 5. 📞 **Hotline Miami**
- **Colores principales**: Rosa neón (#ff10f0) y Cyan (#00ffff)
- **Estilo**: Retro 80s, inspirado en el videojuego
- **Mejor para**: Synthwave, música electrónica retro

### 6. 💚 **Matrix**
- **Colores principales**: Verde Matrix (#00ff00) y Verde lima (#39ff14)
- **Estilo**: Código Matrix clásico
- **Mejor para**: Coding sessions, ambiente hacker

### 7. 🔥 **Lava**
- **Colores principales**: Rojo (#ff0000) y Naranja (#ff6600)
- **Estilo**: Lava fundida, muy caliente
- **Mejor para**: Rock, metal, música intensa

### 8. 🌃 **Cyberpunk**
- **Colores principales**: Amarillo neón (#fcee09) y Magenta (#ff00ff)
- **Estilo**: Inspirado en Cyberpunk 2077
- **Mejor para**: Música electrónica, techno

### 9. 🌸 **Vaporwave**
- **Colores principales**: Rosa pastel (#ff71ce) y Cyan (#01cdfe)
- **Estilo**: Estética vaporwave/aesthetic
- **Mejor para**: Lo-fi, vaporwave, música relajante

### 10. ☢️ **Toxic**
- **Colores principales**: Verde tóxico (#ccff00) y Verde radiactivo (#00ff00)
- **Estilo**: Advertencia radioactiva
- **Mejor para**: Dubstep, bass music, electrónica pesada

### 11. 👑 **Royal**
- **Colores principales**: Oro (#ffd700) y Púrpura (#9370db)
- **Estilo**: Lujo y realeza
- **Mejor para**: Música clásica, jazz, ambiente elegante

## Cómo Usar los Temas

### Método 1: Selector Visual
1. Haz clic en el botón **🎨 Temas** en la esquina superior derecha
2. Selecciona un tema de la lista desplegable
3. El tema se aplica inmediatamente con una animación suave

### Método 2: Atajos de Teclado

#### Abrir/Cerrar Menú de Temas
- **Windows/Linux**: `Ctrl + T`
- **macOS**: `Cmd + T`

#### Cambio Rápido de Temas
Usa `Alt + [número]` para cambiar directamente al tema:
- `Alt + 1` → Neon Green
- `Alt + 2` → Evangelion
- `Alt + 3` → Sunset Fire
- `Alt + 4` → Ocean Wave
- `Alt + 5` → Hotline Miami
- `Alt + 6` → Matrix
- `Alt + 7` → Lava
- `Alt + 8` → Cyberpunk
- `Alt + 9` → Vaporwave
- `Alt + 0` → Toxic
- (Para Royal: abre el menú con `Ctrl/Cmd + T`)

## Características del Sistema de Temas

### 🎯 Persistencia
- El tema seleccionado se guarda automáticamente en **localStorage**
- Se restaura automáticamente al reabrir la aplicación
- No necesitas volver a seleccionarlo cada vez

### 🌈 Transiciones Suaves
- Todas las transiciones de color son suaves (0.5s)
- Animaciones fluidas al cambiar de tema
- Sin parpadeos o cambios bruscos

### 🔔 Notificaciones
- Cuando cambias de tema, aparece una notificación elegante
- Muestra el nombre del tema activado
- Se desvanece automáticamente después de 3 segundos

### 📱 Responsive
- El selector de temas se adapta a pantallas móviles
- Los colores se mantienen consistentes en todos los dispositivos
- Funciona en tablets y smartphones

## Personalización de Temas

### Crear tu Propio Tema

Si quieres crear un tema personalizado, puedes modificar el archivo `themes.css`:

```css
/* Tu tema personalizado */
[data-theme="mi-tema"] {
    --primary-color: #tu-color-principal;
    --secondary-color: #tu-color-secundario;
    --accent-color: #tu-color-acento;
    --bg-gradient-start: #tu-fondo-inicio;
    --bg-gradient-end: #tu-fondo-fin;
    /* ... más variables */
}
```

Luego agrega tu tema al array en `theme-manager.js`:

```javascript
{ id: 'mi-tema', name: '🎨 Mi Tema', colors: ['#color1', '#color2'] }
```

## Variables CSS Disponibles

Todas las variables que puedes personalizar:

- `--primary-color` - Color principal (botones, texto destacado)
- `--secondary-color` - Color secundario (texto alternativo)
- `--accent-color` - Color de acento (detalles)
- `--bg-gradient-start` - Inicio del gradiente de fondo
- `--bg-gradient-end` - Fin del gradiente de fondo
- `--header-gradient-start` - Inicio del gradiente del header
- `--header-gradient-end` - Fin del gradiente del header
- `--border-color` - Color de bordes
- `--button-bg` - Fondo de botones
- `--button-border` - Borde de botones
- `--text-primary` - Texto principal
- `--text-secondary` - Texto secundario
- `--glow-color` - Color del resplandor (con transparencia)
- `--body-gradient-start` - Inicio del gradiente del body
- `--body-gradient-end` - Fin del gradiente del body

## Compatibilidad

### Navegadores Soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

### Funcionalidades
- ✅ CSS Variables (Custom Properties)
- ✅ LocalStorage API
- ✅ CSS Transitions
- ✅ CSS Gradients
- ✅ Data Attributes

## API JavaScript

### Acceder al Theme Manager

```javascript
// El theme manager está disponible globalmente
const themeManager = window.themeManager;

// Obtener tema actual
const currentTheme = themeManager.getCurrentTheme();

// Cambiar tema programáticamente
themeManager.changeTheme('evangelion');

// Siguiente tema
themeManager.nextTheme();

// Tema anterior
themeManager.previousTheme();

// Tema aleatorio
themeManager.randomTheme();

// Obtener todos los temas disponibles
const allThemes = themeManager.getAllThemes();
```

### Eventos Personalizados

```javascript
// Escuchar cambios de tema
window.addEventListener('themeChanged', (event) => {
    console.log('Nuevo tema:', event.detail.theme);
    // Tu código aquí
});
```

## Tips y Recomendaciones

### 🎵 Combinaciones de Tema + Género Musical

- **EDM/Electrónica**: Cyberpunk, Hotline Miami, Toxic
- **Rock/Metal**: Lava, Matrix
- **Lo-fi/Chill**: Vaporwave, Ocean Wave
- **Hip-Hop**: Neon Green, Hotline Miami
- **Clásica/Jazz**: Royal, Sunset Fire
- **Anime OST**: Evangelion
- **Synthwave**: Hotline Miami, Cyberpunk

### 💡 Para Streaming
Los temas con alto contraste como **Evangelion**, **Matrix**, y **Hotline Miami** se ven especialmente bien en streams y capturas de pantalla.

### 🎨 Para Sesiones de Trabajo
Los temas más oscuros como **Matrix**, **Ocean Wave**, y **Evangelion** son menos cansados para la vista durante sesiones largas.

## Troubleshooting

### El tema no se guarda
- Verifica que tu navegador permita localStorage
- Comprueba que no estés en modo incógnito
- Limpia la caché del navegador

### Los colores no cambian
- Refresca la página (F5)
- Verifica que `themes.css` esté cargado correctamente
- Abre la consola del navegador para ver errores

### El selector no aparece
- Asegúrate de que `theme-manager.js` esté cargado
- Verifica el orden de los scripts en `index.html`
- Revisa la consola para errores de JavaScript

## Futuras Mejoras

En futuras versiones se planea agregar:
- [ ] Editor visual de temas
- [ ] Importar/Exportar temas personalizados
- [ ] Sincronización de temas con la nube
- [ ] Temas animados con gradientes en movimiento
- [ ] Modo automático (cambia según hora del día)
- [ ] Más de 20 temas predefinidos
- [ ] Themes basados en carátulas de álbumes

## Licencia

Los temas están incluidos bajo la misma licencia MIT del proyecto Studio Pro.

---

**¿Preguntas o sugerencias?** Abre un issue en GitHub o envía un PR con tu tema personalizado. 🚀
