// ============================================
// Electron Main Process
// Creates native desktop application for Windows, macOS, and Linux
// ============================================

const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Keep a global reference of the window object
let mainWindow;
let splashWindow;

// App configuration
const APP_CONFIG = {
    name: 'Studio Pro',
    version: '2.0.0',
    author: 'Studio Pro Team',
    description: 'Professional Audio/Video Editor',
    url: 'https://studiopro.com'
};

// ============================================
// Create Main Window
// ============================================

function createWindow() {
    // Create splash screen
    createSplashScreen();
    
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        show: false, // Don't show until ready
        backgroundColor: '#1a1a2e',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: true,
            allowRunningInsecureContent: false
        },
        titleBarStyle: 'hidden', // Custom title bar
        frame: true,
        transparent: false
    });
    
    // Load the index.html of the app
    if (app.isPackaged) {
        // Production: load from build
        mainWindow.loadFile('index.html');
    } else {
        // Development: load from local server or file
        mainWindow.loadFile('index.html');
        
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
    }
    
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            if (splashWindow) {
                splashWindow.close();
            }
            mainWindow.show();
            mainWindow.focus();
        }, 1500);
    });
    
    // Emitted when the window is closed
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    
    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    
    // Create application menu
    createMenu();
}

// ============================================
// Splash Screen
// ============================================

function createSplashScreen() {
    splashWindow = new BrowserWindow({
        width: 500,
        height: 300,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    
    splashWindow.loadFile('splash.html');
    splashWindow.center();
}

// ============================================
// Application Menu
// ============================================

function createMenu() {
    const template = [
        // App Menu (macOS)
        ...(process.platform === 'darwin' ? [{
            label: APP_CONFIG.name,
            submenu: [
                { label: `About ${APP_CONFIG.name}`, click: showAbout },
                { type: 'separator' },
                { label: 'Preferences...', accelerator: 'Cmd+,', click: showPreferences },
                { type: 'separator' },
                { label: 'Services', role: 'services' },
                { type: 'separator' },
                { label: `Hide ${APP_CONFIG.name}`, accelerator: 'Cmd+H', role: 'hide' },
                { label: 'Hide Others', accelerator: 'Cmd+Alt+H', role: 'hideOthers' },
                { label: 'Show All', role: 'unhide' },
                { type: 'separator' },
                { label: 'Quit', accelerator: 'Cmd+Q', click: () => app.quit() }
            ]
        }] : []),
        
        // File Menu
        {
            label: 'File',
            submenu: [
                { label: 'New Project', accelerator: 'CmdOrCtrl+N', click: newProject },
                { label: 'Open Project...', accelerator: 'CmdOrCtrl+O', click: openProject },
                { type: 'separator' },
                { label: 'Save', accelerator: 'CmdOrCtrl+S', click: saveProject },
                { label: 'Save As...', accelerator: 'CmdOrCtrl+Shift+S', click: saveProjectAs },
                { type: 'separator' },
                { label: 'Import Media...', accelerator: 'CmdOrCtrl+I', click: importMedia },
                { label: 'Export Video...', accelerator: 'CmdOrCtrl+E', click: exportVideo },
                { type: 'separator' },
                ...(process.platform !== 'darwin' ? [
                    { label: 'Preferences...', accelerator: 'Ctrl+,', click: showPreferences },
                    { type: 'separator' },
                    { label: 'Exit', accelerator: 'Alt+F4', click: () => app.quit() }
                ] : [])
            ]
        },
        
        // Edit Menu
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Delete', accelerator: 'Delete', click: deleteSelection },
                { type: 'separator' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
            ]
        },
        
        // View Menu
        {
            label: 'View',
            submenu: [
                { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { label: 'Toggle Developer Tools', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: 'Toggle Full Screen', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        
        // Window Menu
        {
            label: 'Window',
            submenu: [
                { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
                ...(process.platform === 'darwin' ? [
                    { type: 'separator' },
                    { label: 'Bring All to Front', role: 'front' }
                ] : [])
            ]
        },
        
        // Help Menu
        {
            label: 'Help',
            submenu: [
                { label: 'Documentation', click: () => shell.openExternal(`${APP_CONFIG.url}/docs`) },
                { label: 'Keyboard Shortcuts', click: showShortcuts },
                { type: 'separator' },
                { label: 'Report Issue', click: () => shell.openExternal(`${APP_CONFIG.url}/issues`) },
                { label: 'Check for Updates...', click: checkForUpdates },
                { type: 'separator' },
                ...(process.platform !== 'darwin' ? [
                    { label: `About ${APP_CONFIG.name}`, click: showAbout }
                ] : [])
            ]
        }
    ];
    
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// ============================================
// Menu Actions
// ============================================

function newProject() {
    mainWindow.webContents.send('menu-action', { action: 'new-project' });
}

function openProject() {
    dialog.showOpenDialog(mainWindow, {
        title: 'Open Project',
        filters: [
            { name: 'Studio Pro Project', extensions: ['stpro', 'json'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0];
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (!err) {
                    mainWindow.webContents.send('menu-action', {
                        action: 'open-project',
                        data: JSON.parse(data),
                        path: filePath
                    });
                }
            });
        }
    });
}

function saveProject() {
    mainWindow.webContents.send('menu-action', { action: 'save-project' });
}

function saveProjectAs() {
    dialog.showSaveDialog(mainWindow, {
        title: 'Save Project As',
        defaultPath: 'untitled.stpro',
        filters: [
            { name: 'Studio Pro Project', extensions: ['stpro'] }
        ]
    }).then(result => {
        if (!result.canceled && result.filePath) {
            mainWindow.webContents.send('menu-action', {
                action: 'save-project-as',
                path: result.filePath
            });
        }
    });
}

function importMedia() {
    dialog.showOpenDialog(mainWindow, {
        title: 'Import Media',
        filters: [
            { name: 'Media Files', extensions: ['mp4', 'avi', 'mov', 'mp3', 'wav', 'png', 'jpg'] },
            { name: 'Video', extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm'] },
            { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a'] },
            { name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile', 'multiSelections']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            mainWindow.webContents.send('menu-action', {
                action: 'import-media',
                files: result.filePaths
            });
        }
    });
}

function exportVideo() {
    dialog.showSaveDialog(mainWindow, {
        title: 'Export Video',
        defaultPath: 'video.mp4',
        filters: [
            { name: 'MP4 Video', extensions: ['mp4'] },
            { name: 'WebM Video', extensions: ['webm'] },
            { name: 'AVI Video', extensions: ['avi'] }
        ]
    }).then(result => {
        if (!result.canceled && result.filePath) {
            mainWindow.webContents.send('menu-action', {
                action: 'export-video',
                path: result.filePath
            });
        }
    });
}

function deleteSelection() {
    mainWindow.webContents.send('menu-action', { action: 'delete-selection' });
}

function showPreferences() {
    mainWindow.webContents.send('menu-action', { action: 'show-preferences' });
}

function showShortcuts() {
    mainWindow.webContents.send('menu-action', { action: 'show-shortcuts' });
}

function showAbout() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: `About ${APP_CONFIG.name}`,
        message: APP_CONFIG.name,
        detail: `Version: ${APP_CONFIG.version}\n` +
                `Author: ${APP_CONFIG.author}\n\n` +
                `${APP_CONFIG.description}\n\n` +
                `© 2025 Studio Pro Team. All rights reserved.`,
        buttons: ['OK']
    });
}

function checkForUpdates() {
    // In production, implement auto-updater
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Check for Updates',
        message: 'You are using the latest version!',
        detail: `Version ${APP_CONFIG.version}`,
        buttons: ['OK']
    });
}

// ============================================
// IPC Handlers
// ============================================

ipcMain.handle('save-file', async (event, { content, path }) => {
    try {
        fs.writeFileSync(path, content, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('read-file', async (event, { path }) => {
    try {
        const content = fs.readFileSync(path, 'utf8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-app-path', async (event, name) => {
    return app.getPath(name);
});

ipcMain.handle('get-system-info', async () => {
    return {
        platform: process.platform,
        arch: process.arch,
        version: process.version,
        osType: os.type(),
        osRelease: os.release(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length
    };
});

// ============================================
// App Events
// ============================================

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', function () {
        // On macOS recreate window when dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
    // On macOS stay active until user quits explicitly
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Focus main window if user tries to open another instance
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

console.log(`🚀 Studio Pro v${APP_CONFIG.version} - Electron App Started`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
