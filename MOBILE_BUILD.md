# Studio Pro Mobile - React Native App

Este documento explica cómo crear la versión móvil (APK para Android e IPA para iOS) de Studio Pro.

## 📱 Arquitectura Móvil

Studio Pro utiliza **React Native** para las aplicaciones móviles, compartiendo la lógica de negocio con la versión web.

## 🚀 Inicio Rápido - App Móvil

### Prerrequisitos

**Para Android:**
- Node.js >= 16
- JDK 11 o superior
- Android Studio
- Android SDK (API 33)
- Gradle

**Para iOS (solo en macOS):**
- Node.js >= 16
- Xcode 14+
- CocoaPods
- iOS SDK

### Instalación

```bash
# 1. Instalar React Native CLI
npm install -g react-native-cli

# 2. Crear proyecto React Native
npx react-native init StudioProMobile --template react-native-template-typescript

# 3. Navegar al directorio
cd StudioProMobile

# 4. Instalar dependencias
npm install

# Dependencias adicionales para funcionalidad
npm install @react-navigation/native
npm install @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-vector-icons
npm install react-native-fs
npm install react-native-video
npm install react-native-sound
npm install react-native-audio-recorder-player
npm install @react-native-google-signin/google-signin
npm install react-native-document-picker
npm install react-native-share
npm install axios
npm install @react-native-async-storage/async-storage
```

## 📦 Estructura del Proyecto Móvil

```
StudioProMobile/
├── android/                 # Código nativo Android
│   ├── app/
│   │   ├── build.gradle    # Configuración de build
│   │   └── src/main/
│   │       └── AndroidManifest.xml
│   └── build.gradle
├── ios/                    # Código nativo iOS
│   ├── StudioProMobile/
│   │   └── Info.plist
│   ├── StudioProMobile.xcodeproj
│   └── Podfile
├── src/
│   ├── screens/           # Pantallas de la app
│   │   ├── HomeScreen.tsx
│   │   ├── PlayerScreen.tsx
│   │   ├── EditorScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/        # Componentes reutilizables
│   │   ├── AudioPlayer.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── Timeline.tsx
│   │   └── EffectPanel.tsx
│   ├── services/          # Servicios y APIs
│   │   ├── AuthService.ts
│   │   ├── DriveService.ts
│   │   ├── AudioService.ts
│   │   └── VideoService.ts
│   ├── utils/            # Utilidades
│   ├── navigation/       # Navegación
│   └── App.tsx           # App principal
├── package.json
└── app.json
```

## 🔨 Compilar para Android (APK)

### Debug Build

```bash
# 1. Iniciar Metro Bundler
npm start

# 2. En otra terminal, compilar APK debug
cd android
./gradlew assembleDebug

# APK generado en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Release Build (APK firmado)

```bash
# 1. Generar keystore (solo primera vez)
keytool -genkeypair -v -storetype PKCS12 -keystore studio-pro-release.keystore -alias studio-pro -keyalg RSA -keysize 2048 -validity 10000

# 2. Configurar gradle.properties
# android/gradle.properties
MYAPP_RELEASE_STORE_FILE=studio-pro-release.keystore
MYAPP_RELEASE_KEY_ALIAS=studio-pro
MYAPP_RELEASE_STORE_PASSWORD=tu_password
MYAPP_RELEASE_KEY_PASSWORD=tu_password

# 3. Actualizar build.gradle
# android/app/build.gradle (ver ejemplo abajo)

# 4. Compilar APK release
cd android
./gradlew assembleRelease

# APK generado en:
# android/app/build/outputs/apk/release/app-release.apk
```

### Configuración build.gradle

```gradle
// android/app/build.gradle
android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Bundle AAB (Google Play)

```bash
cd android
./gradlew bundleRelease

# AAB generado en:
# android/app/build/outputs/bundle/release/app-release.aab
```

## 🍎 Compilar para iOS (IPA)

**Nota:** Requiere macOS con Xcode instalado.

### Debug Build

```bash
# 1. Instalar pods
cd ios
pod install
cd ..

# 2. Ejecutar en simulador
npx react-native run-ios

# O para dispositivo específico
npx react-native run-ios --device "iPhone de [Tu Nombre]"
```

### Release Build (IPA)

```bash
# 1. Abrir workspace en Xcode
open ios/StudioProMobile.xcworkspace

# 2. En Xcode:
#    - Seleccionar esquema "Release"
#    - Product > Archive
#    - Organizer > Distribute App
#    - Elegir método (App Store, Ad Hoc, Enterprise, Development)
#    - Seguir asistente de firma
#    - Exportar IPA

# O desde línea de comandos:
xcodebuild -workspace ios/StudioProMobile.xcworkspace \
           -scheme StudioProMobile \
           -configuration Release \
           -archivePath build/StudioProMobile.xcarchive \
           archive

xcodebuild -exportArchive \
           -archivePath build/StudioProMobile.xcarchive \
           -exportPath build \
           -exportOptionsPlist ios/ExportOptions.plist
```

## 🌐 Configuración de Permisos

### Android (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### iOS (Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>Studio Pro necesita acceso a la cámara para grabar videos</string>
<key>NSMicrophoneUsageDescription</key>
<string>Studio Pro necesita acceso al micrófono para grabar audio</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Studio Pro necesita acceso a tus fotos para importar media</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Studio Pro necesita permiso para guardar videos y fotos</string>
```

## 📱 Testing

### Android

```bash
# Instalar APK en dispositivo
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Ver logs
adb logcat | grep ReactNative
```

### iOS

```bash
# Ejecutar tests
npx react-native run-ios --configuration Release

# Ver logs
xcrun simctl spawn booted log stream --predicate 'process == "StudioProMobile"'
```

## 🚀 Publicación

### Google Play Store (Android)

1. Crear cuenta de desarrollador ($25 único pago)
2. Crear app en Play Console
3. Completar información:
   - Descripción
   - Screenshots (phone, tablet, TV)
   - Icono de app (512x512 PNG)
   - Feature graphic (1024x500)
   - Categoría y clasificación de contenido
4. Subir AAB
5. Configurar precios y distribución
6. Enviar para revisión

### Apple App Store (iOS)

1. Inscripción en Apple Developer Program ($99/año)
2. Crear App ID en portal de desarrollador
3. Crear app en App Store Connect
4. Completar información:
   - Descripción
   - Screenshots (varios tamaños)
   - Icono (1024x1024)
   - Categoría
   - Clasificación por edad
5. Subir build desde Xcode
6. Enviar para revisión

## 🔧 Configuraciones Avanzadas

### Deep Links

```javascript
// Android: android/app/src/main/AndroidManifest.xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="studiopro" android:host="open" />
</intent-filter>

// iOS: ios/StudioProMobile/AppDelegate.m
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}
```

### Push Notifications

```bash
# Instalar Firebase Cloud Messaging
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging
```

### Analytics

```bash
# Instalar Firebase Analytics
npm install @react-native-firebase/analytics
```

## 📊 Optimización

### Reducir Tamaño del APK/IPA

**Android:**
```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt')
        }
    }
    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
            universalApk false
        }
    }
}
```

**iOS:**
- Enable Bitcode
- Strip Debug Symbols
- Optimize PNG files
- Use App Thinning

## 🆘 Solución de Problemas

### Android

```bash
# Limpiar build
cd android && ./gradlew clean

# Reinstalar dependencias
rm -rf node_modules && npm install
cd android && ./gradlew clean && cd ..

# Verificar configuración
npx react-native doctor
```

### iOS

```bash
# Limpiar build
cd ios && xcodebuild clean && cd ..

# Reinstalar pods
cd ios && rm -rf Pods && pod install && cd ..

# Verificar configuración
npx react-native doctor
```

## 📚 Recursos Adicionales

- [React Native Docs](https://reactnative.dev/)
- [Android Developer Guide](https://developer.android.com/)
- [iOS Developer Guide](https://developer.apple.com/ios/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)

## ✅ Checklist de Release

- [ ] Actualizar versión en package.json
- [ ] Actualizar versionCode/versionName (Android)
- [ ] Actualizar CFBundleVersion/CFBundleShortVersionString (iOS)
- [ ] Generar iconos para todas las densidades
- [ ] Preparar screenshots para stores
- [ ] Escribir release notes
- [ ] Test en dispositivos reales
- [ ] Compilar builds firmados
- [ ] Subir a stores
- [ ] Monitorear crashes y feedback

---

**Nota:** Para un enfoque más simple, considera usar **Expo** que simplifica el proceso de build:

```bash
# Usar Expo para build simplificado
npm install -g expo-cli
expo init StudioProMobile
cd StudioProMobile
expo build:android
expo build:ios
```

---

¡Tu app está lista para ser distribuida en Google Play y App Store! 🎉
