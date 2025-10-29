// ============================================
// Google Drive Integration Module
// Handles file upload, download, and sync with Google Drive
// ============================================

class GoogleDriveManager {
    constructor() {
        this.gapiLoaded = false;
        this.tokenClient = null;
        this.accessToken = null;
        this.isAuthorized = false;
        
        // Google Drive API Configuration
        this.config = {
            apiKey: 'YOUR_GOOGLE_API_KEY',
            clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata'
        };
        
        this.folderId = null; // Studio Pro folder in Drive
        this.init();
    }
    
    // ============================================
    // Initialization
    // ============================================
    
    async init() {
        await this.loadGoogleAPI();
        this.attachEventListeners();
    }
    
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            // Load Google API client
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.onload = () => {
                gapi.load('client', async () => {
                    await gapi.client.init({
                        apiKey: this.config.apiKey,
                        discoveryDocs: this.config.discoveryDocs
                    });
                    this.gapiLoaded = true;
                    console.log('✅ Google Drive API loaded');
                    resolve();
                });
            };
            gapiScript.onerror = reject;
            document.head.appendChild(gapiScript);
            
            // Load Google Identity Services
            const gisScript = document.createElement('script');
            gisScript.src = 'https://accounts.google.com/gsi/client';
            gisScript.onload = () => {
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.config.clientId,
                    scope: this.config.scopes,
                    callback: (response) => {
                        if (response.error) {
                            console.error('GIS error:', response);
                            return;
                        }
                        this.accessToken = response.access_token;
                        this.isAuthorized = true;
                        this.onAuthSuccess();
                    }
                });
                console.log('✅ Google Identity Services loaded');
            };
            document.head.appendChild(gisScript);
        });
    }
    
    // ============================================
    // Authentication
    // ============================================
    
    async authorize() {
        if (!this.tokenClient) {
            this.showNotification('Google Drive API not loaded', 'error');
            return false;
        }
        
        // Request access token
        this.tokenClient.requestAccessToken({ prompt: '' });
        return true;
    }
    
    async onAuthSuccess() {
        this.showNotification('✅ Conectado a Google Drive', 'success');
        
        // Create or find Studio Pro folder
        await this.ensureStudioProFolder();
        
        // Update UI
        this.updateDriveStatus(true);
        
        // Load existing files
        await this.listDriveFiles();
    }
    
    revokeAccess() {
        if (this.accessToken) {
            google.accounts.oauth2.revoke(this.accessToken, () => {
                this.accessToken = null;
                this.isAuthorized = false;
                this.updateDriveStatus(false);
                this.showNotification('Desconectado de Google Drive', 'success');
            });
        }
    }
    
    // ============================================
    // Folder Management
    // ============================================
    
    async ensureStudioProFolder() {
        try {
            // Search for existing folder
            const response = await gapi.client.drive.files.list({
                q: "name='Studio Pro Music' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name)',
                spaces: 'drive'
            });
            
            if (response.result.files.length > 0) {
                this.folderId = response.result.files[0].id;
                console.log('Found existing folder:', this.folderId);
            } else {
                // Create new folder
                const folderResponse = await gapi.client.drive.files.create({
                    resource: {
                        name: 'Studio Pro Music',
                        mimeType: 'application/vnd.google-apps.folder'
                    },
                    fields: 'id'
                });
                this.folderId = folderResponse.result.id;
                console.log('Created new folder:', this.folderId);
            }
        } catch (error) {
            console.error('Error ensuring folder:', error);
        }
    }
    
    // ============================================
    // File Upload
    // ============================================
    
    async uploadFile(file, metadata = {}) {
        if (!this.isAuthorized) {
            this.showNotification('Por favor autoriza Google Drive primero', 'error');
            return null;
        }
        
        try {
            this.showNotification(`Subiendo ${file.name}...`, 'info');
            
            const fileMetadata = {
                name: file.name,
                parents: [this.folderId],
                description: metadata.description || 'Uploaded from Studio Pro',
                appProperties: {
                    artist: metadata.artist || '',
                    album: metadata.album || '',
                    genre: metadata.genre || '',
                    duration: metadata.duration || ''
                }
            };
            
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
            form.append('file', file);
            
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,webViewLink', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: form
            });
            
            const result = await response.json();
            
            if (result.id) {
                this.showNotification(`✅ ${file.name} subido a Drive`, 'success');
                return result;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(`Error al subir ${file.name}`, 'error');
            return null;
        }
    }
    
    async uploadMultipleFiles(files, onProgress) {
        const results = [];
        let completed = 0;
        
        for (const file of files) {
            const result = await this.uploadFile(file);
            results.push(result);
            completed++;
            
            if (onProgress) {
                onProgress(completed, files.length);
            }
        }
        
        return results;
    }
    
    // ============================================
    // File Download
    // ============================================
    
    async downloadFile(fileId, fileName) {
        if (!this.isAuthorized) {
            this.showNotification('Por favor autoriza Google Drive primero', 'error');
            return null;
        }
        
        try {
            this.showNotification(`Descargando ${fileName}...`, 'info');
            
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Download failed');
            }
            
            const blob = await response.blob();
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification(`✅ ${fileName} descargado`, 'success');
            return blob;
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification(`Error al descargar ${fileName}`, 'error');
            return null;
        }
    }
    
    // ============================================
    // File Listing
    // ============================================
    
    async listDriveFiles() {
        if (!this.isAuthorized || !this.folderId) {
            return [];
        }
        
        try {
            const response = await gapi.client.drive.files.list({
                q: `'${this.folderId}' in parents and trashed=false`,
                fields: 'files(id, name, size, createdTime, modifiedTime, webViewLink, thumbnailLink, mimeType)',
                orderBy: 'modifiedTime desc',
                pageSize: 100
            });
            
            const files = response.result.files || [];
            this.updateFileList(files);
            return files;
        } catch (error) {
            console.error('Error listing files:', error);
            return [];
        }
    }
    
    // ============================================
    // File Deletion
    // ============================================
    
    async deleteFile(fileId, fileName) {
        if (!this.isAuthorized) {
            this.showNotification('Por favor autoriza Google Drive primero', 'error');
            return false;
        }
        
        try {
            await gapi.client.drive.files.delete({
                fileId: fileId
            });
            
            this.showNotification(`✅ ${fileName} eliminado de Drive`, 'success');
            await this.listDriveFiles(); // Refresh list
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification(`Error al eliminar ${fileName}`, 'error');
            return false;
        }
    }
    
    // ============================================
    // UI Updates
    // ============================================
    
    updateDriveStatus(connected) {
        const statusElement = document.getElementById('driveStatus');
        if (statusElement) {
            if (connected) {
                statusElement.innerHTML = '✅ Conectado a Google Drive';
                statusElement.className = 'drive-status connected';
            } else {
                statusElement.innerHTML = '⭕ No conectado';
                statusElement.className = 'drive-status disconnected';
            }
        }
        
        // Update buttons
        const connectBtn = document.getElementById('connectDrive');
        const disconnectBtn = document.getElementById('disconnectDrive');
        
        if (connectBtn && disconnectBtn) {
            if (connected) {
                connectBtn.style.display = 'none';
                disconnectBtn.style.display = 'block';
            } else {
                connectBtn.style.display = 'block';
                disconnectBtn.style.display = 'none';
            }
        }
    }
    
    updateFileList(files) {
        const listElement = document.getElementById('driveFileList');
        if (!listElement) return;
        
        if (files.length === 0) {
            listElement.innerHTML = '<div class="empty-state">No hay archivos en Google Drive</div>';
            return;
        }
        
        listElement.innerHTML = files.map(file => `
            <div class="drive-file-item" data-file-id="${file.id}">
                <div class="file-icon">
                    ${this.getFileIcon(file.mimeType)}
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-details">
                        ${this.formatFileSize(file.size)} • ${this.formatDate(file.modifiedTime)}
                    </div>
                </div>
                <div class="file-actions">
                    <button class="action-btn download-btn" onclick="driveManager.downloadFile('${file.id}', '${file.name}')" title="Descargar">
                        ⬇️
                    </button>
                    <button class="action-btn delete-btn" onclick="driveManager.confirmDelete('${file.id}', '${file.name}')" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    confirmDelete(fileId, fileName) {
        if (confirm(`¿Eliminar "${fileName}" de Google Drive?`)) {
            this.deleteFile(fileId, fileName);
        }
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    
    getFileIcon(mimeType) {
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType.startsWith('image/')) return '🖼️';
        return '📄';
    }
    
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    showNotification(message, type = 'info') {
        // Use existing toast system or create simple one
        const toast = document.getElementById('toast');
        if (toast) {
            const content = toast.querySelector('.toast-content');
            if (content) {
                content.textContent = message;
                toast.className = `toast ${type} show`;
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    
    // ============================================
    // Event Listeners
    // ============================================
    
    attachEventListeners() {
        // Connect button
        document.getElementById('connectDrive')?.addEventListener('click', () => {
            this.authorize();
        });
        
        // Disconnect button
        document.getElementById('disconnectDrive')?.addEventListener('click', () => {
            this.revokeAccess();
        });
        
        // Upload button
        document.getElementById('uploadToDrive')?.addEventListener('click', async () => {
            const files = document.getElementById('fileInput')?.files;
            if (files && files.length > 0) {
                await this.uploadMultipleFiles(Array.from(files), (completed, total) => {
                    this.showNotification(`Subiendo ${completed}/${total}...`, 'info');
                });
                await this.listDriveFiles();
            }
        });
        
        // Refresh button
        document.getElementById('refreshDrive')?.addEventListener('click', () => {
            this.listDriveFiles();
        });
    }
}

// Initialize Google Drive Manager
const driveManager = new GoogleDriveManager();

// Export for use in other modules
window.driveManager = driveManager;

console.log('🗂️ Google Drive Manager initialized');
