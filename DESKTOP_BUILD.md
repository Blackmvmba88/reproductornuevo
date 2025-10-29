# 🖥️ Studio Pro - Guía de Compilación Desktop

Instrucciones completas para crear ejecutables nativos de Studio Pro para Windows (EXE), macOS (DMG), y Linux (AppImage/DEB/RPM).

## 📋 Requisitos Previos

### Para todas las plataformas:
- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### Para Windows (EXE):
- Windows 10 o superior
- Visual Studio Build Tools (opcional pero recomendado)

### Para macOS (DMG):
- macOS 10.15 (Catalina) o superior
- Xcode Command Line Tools
- Apple Developer Account (para firma de código)

### Para Linux (AppImage/DEB/RPM):
- Ubuntu 20.04+ / Fedora 34+ / Arch Linux
- Build essentials instalados

## 🚀 Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/Blackmvmba88/reproductornuevo.git
cd reproductornuevo

# 2. Instalar dependencias
npm install

# 3. Instalar Electron y electron-builder
npm install --save-dev electron electron-builder

# 4. Verificar instalación
npm run start
```

## 🔨 Comandos de Build

### Build para tu plataforma actual

```bash
# Compilar para tu sistema operativo
npm run build

# Los archivos se generarán en la carpeta dist/
```

### Build específico por plataforma

```bash
# Windows (EXE + Portable)
npm run build:win

# macOS (DMG + ZIP)
npm run build:mac

# Linux (AppImage + DEB + RPM + Snap)
npm run build:linux

# Todas las plataformas (requiere estar en macOS)
npm run build:all
```

## 🪟 Windows (EXE)

### Build en Windows

```bash
npm run build:win
```

**Salidas generadas:**
- `dist/Studio Pro-2.0.0-x64-Setup.exe` - Instalador NSIS (64-bit)
- `dist/Studio Pro-2.0.0-ia32-Setup.exe` - Instalador NSIS (32-bit)
- `dist/Studio Pro-2.0.0-x64-portable.exe` - Versión portable (64-bit)

### Configuración Avanzada

Para personalizar el instalador, edita `package.json`:

```json
"build": {
  "win": {
    "target": ["nsis", "portable", "msi"],
    "icon": "build/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": true,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "license": "LICENSE"
  }
}
```

### Firma de Código Windows

```bash
# 1. Obtener certificado de firma de código (.pfx)
# Comprar en: Sectigo, DigiCert, GlobalSign

# 2. Configurar variables de entorno
set CSC_LINK=C:\path\to\certificate.pfx
set CSC_KEY_PASSWORD=tu_password

# 3. Build con firma
npm run build:win
```

### Cross-compilation (Build Windows desde macOS/Linux)

```bash
# Instalar Wine (Linux)
sudo apt-get install wine64

# Instalar Wine (macOS)
brew install wine-stable

# Build
npm run build:win
```

## 🍎 macOS (DMG)

### Build en macOS

```bash
npm run build:mac
```

**Salidas generadas:**
- `dist/Studio Pro-2.0.0-x64.dmg` - Instalador DMG (Intel)
- `dist/Studio Pro-2.0.0-arm64.dmg` - Instalador DMG (Apple Silicon)
- `dist/Studio Pro-2.0.0-x64.zip` - App comprimida (Intel)
- `dist/Studio Pro-2.0.0-arm64.zip` - App comprimida (Apple Silicon)
- `dist/Studio Pro-2.0.0-universal.dmg` - Universal (Intel + ARM64)

### Configuración Avanzada

```json
"build": {
  "mac": {
    "target": ["dmg", "zip", "pkg"],
    "icon": "build/icon.icns",
    "category": "public.app-category.productivity",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist"
  },
  "dmg": {
    "title": "Install Studio Pro",
    "icon": "build/icon.icns",
    "background": "build/background.png",
    "window": {
      "width": 540,
      "height": 380
    }
  }
}
```

### Firma de Código macOS

```bash
# 1. Obtener Apple Developer Account ($99/año)
# https://developer.apple.com/programs/

# 2. Crear certificados en Xcode
# Xcode > Preferences > Accounts > Manage Certificates

# 3. Configurar variables de entorno
export CSC_NAME="Developer ID Application: Tu Nombre"
export APPLE_ID="tu@email.com"
export APPLE_ID_PASSWORD="app-specific-password"

# 4. Build con firma y notarización
npm run build:mac
```

### Notarización Apple

```bash
# Después del build, notarizar con Apple
xcrun notarytool submit "dist/Studio Pro-2.0.0.dmg" \
    --apple-id "tu@email.com" \
    --password "app-specific-password" \
    --team-id "TEAM_ID" \
    --wait

# Verificar notarización
xcrun stapler staple "dist/Studio Pro-2.0.0.dmg"
```

### Universal Binary (Intel + Apple Silicon)

```json
"build": {
  "mac": {
    "target": {
      "target": "dmg",
      "arch": ["universal"]
    }
  }
}
```

## 🐧 Linux (AppImage/DEB/RPM)

### Build en Linux

```bash
npm run build:linux
```

**Salidas generadas:**
- `dist/Studio Pro-2.0.0-x64.AppImage` - AppImage (universal)
- `dist/Studio Pro-2.0.0-arm64.AppImage` - AppImage (ARM64)
- `dist/Studio Pro_2.0.0_amd64.deb` - Paquete Debian/Ubuntu
- `dist/Studio Pro-2.0.0.x86_64.rpm` - Paquete RedHat/Fedora
- `dist/Studio Pro_2.0.0_amd64.snap` - Snap package

### Configuración Avanzada

```json
"build": {
  "linux": {
    "target": ["AppImage", "deb", "rpm", "snap", "pacman"],
    "icon": "build/icons",
    "category": "AudioVideo",
    "maintainer": "Studio Pro Team <contact@studiopro.com>",
    "vendor": "Studio Pro",
    "synopsis": "Professional Audio/Video Editor",
    "description": "Complete audio and video editing suite"
  },
  "snap": {
    "confinement": "strict",
    "grade": "stable",
    "publish": ["edge", "beta", "stable"]
  }
}
```

### AppImage (Recomendado para distribución universal)

```bash
# Build solo AppImage
electron-builder --linux AppImage

# Hacer ejecutable
chmod +x dist/Studio\ Pro-2.0.0-x64.AppImage

# Ejecutar
./dist/Studio\ Pro-2.0.0-x64.AppImage
```

### DEB Package (Ubuntu/Debian)

```bash
# Build DEB
electron-builder --linux deb

# Instalar
sudo dpkg -i dist/Studio\ Pro_2.0.0_amd64.deb

# Resolver dependencias si es necesario
sudo apt-get install -f
```

### RPM Package (Fedora/RedHat)

```bash
# Build RPM
electron-builder --linux rpm

# Instalar
sudo rpm -i dist/Studio\ Pro-2.0.0.x86_64.rpm

# O con dnf
sudo dnf install dist/Studio\ Pro-2.0.0.x86_64.rpm
```

### Snap Package

```bash
# Build Snap
electron-builder --linux snap

# Instalar localmente
sudo snap install dist/Studio\ Pro_2.0.0_amd64.snap --dangerous

# Publicar en Snap Store
snapcraft upload dist/Studio\ Pro_2.0.0_amd64.snap --release=stable
```

## 🎨 Preparación de Assets

### Iconos Requeridos

**Windows:**
```
build/icon.ico (256x256 ICO file)
```

**macOS:**
```
build/icon.icns (1024x1024 ICNS file)
```

Crear ICNS desde PNG:
```bash
# Crear iconset
mkdir icon.iconset
sips -z 16 16     icon-1024.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon-1024.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon-1024.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon-1024.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon-1024.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon-1024.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon-1024.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon-1024.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon-1024.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon-1024.png --out icon.iconset/icon_512x512@2x.png

# Convertir a ICNS
iconutil -c icns icon.iconset
```

**Linux:**
```
build/icons/
  ├── 16x16.png
  ├── 32x32.png
  ├── 48x48.png
  ├── 64x64.png
  ├── 128x128.png
  ├── 256x256.png
  └── 512x512.png
```

### Background DMG (macOS)

```
build/background.png (540x380 PNG)
build/background@2x.png (1080x760 PNG para Retina)
```

## 🔧 Configuración de Firma

### Archivo de Configuración (.env)

```bash
# Windows
CSC_LINK=C:\path\to\certificate.pfx
CSC_KEY_PASSWORD=password

# macOS
CSC_NAME=Developer ID Application: Your Name
APPLE_ID=your@email.com
APPLE_ID_PASSWORD=app-specific-password
APPLE_TEAM_ID=XXXXXXXXXX

# General
GH_TOKEN=github_token_for_releases
```

## 📦 Publicación Automática

### GitHub Releases

```bash
# 1. Crear GitHub token con permisos de release
# https://github.com/settings/tokens

# 2. Configurar token
export GH_TOKEN=your_github_token

# 3. Build y publicar
npm run dist
```

Configuración en `package.json`:
```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "Blackmvmba88",
    "repo": "reproductornuevo"
  }
}
```

### Auto-Updates

```javascript
// En main.js
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
    autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', () => {
    console.log('Update available');
});

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
});
```

## 🧪 Testing

```bash
# Test build sin empaquetar
npm run pack

# Ejecutar desde carpeta dist sin instalar
# Windows
dist/win-unpacked/Studio\ Pro.exe

# macOS
open dist/mac/Studio\ Pro.app

# Linux
dist/linux-unpacked/studio-pro
```

## 📊 Optimización de Tamaño

### Reducir tamaño del ejecutable

```json
"build": {
  "asar": true,
  "asarUnpack": [
    "**\\*.{node,dll}",
    "node_modules/@ffmpeg-installer/**"
  ],
  "files": [
    "**/*",
    "!**/*.ts",
    "!*.map",
    "!node_modules/@types",
    "!node_modules/.cache"
  ],
  "compression": "maximum"
}
```

### Excluir node_modules innecesarios

```json
"build": {
  "files": [
    "!node_modules/nodemon",
    "!node_modules/eslint",
    "!node_modules/@types"
  ]
}
```

## 🆘 Solución de Problemas

### Error: Cannot find module 'electron'

```bash
npm install electron --save-dev
```

### Error de firma en macOS

```bash
# Limpiar keychains
security delete-certificate -c "Developer ID Application"
# Reinstalar certificados desde Xcode
```

### AppImage no ejecuta en Linux

```bash
# Instalar FUSE
sudo apt-get install fuse libfuse2

# Dar permisos
chmod +x *.AppImage
```

## 📚 Recursos

- [Electron Builder Docs](https://www.electron.build/)
- [Electron Docs](https://www.electronjs.org/docs)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Multi Platform Build](https://www.electron.build/multi-platform-build)

## ✅ Checklist de Release

- [ ] Actualizar versión en package.json
- [ ] Generar todos los iconos necesarios
- [ ] Configurar certificados de firma
- [ ] Testear builds en cada plataforma
- [ ] Verificar auto-updates
- [ ] Crear release notes
- [ ] Publicar en GitHub Releases
- [ ] Anunciar en redes sociales

---

¡Tu aplicación desktop está lista para distribuir! 🚀
