// ============================================
// Audio/Video Separator Module
// Extracts audio from video, separates tracks, and exports independently
// ============================================

class MediaSeparator {
    constructor() {
        this.currentFile = null;
        this.audioTracks = [];
        this.videoTrack = null;
        this.init();
    }
    
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        this.attachEventListeners();
    }
    
    // ============================================
    // Video/Audio Separation
    // ============================================
    
    async separateMedia(videoFile) {
        try {
            this.showNotification('🎬 Separando audio y video...', 'info');
            this.currentFile = videoFile;
            
            // Create object URL for the video
            const videoURL = URL.createObjectURL(videoFile);
            
            // Create video element to analyze
            const video = document.createElement('video');
            video.src = videoURL;
            
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve;
                video.onerror = reject;
            });
            
            // Extract audio using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioElement = new Audio(videoURL);
            
            await new Promise(resolve => {
                audioElement.onloadedmetadata = resolve;
            });
            
            // Extract video metadata
            this.videoTrack = {
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                aspectRatio: video.videoWidth / video.videoHeight,
                frameRate: this.estimateFrameRate(video),
                size: videoFile.size,
                type: videoFile.type,
                name: videoFile.name
            };
            
            // Extract audio metadata
            const audioTrack = {
                duration: audioElement.duration,
                sampleRate: audioContext.sampleRate,
                size: Math.floor(videoFile.size * 0.1), // Estimate
                type: 'audio/mp3', // Default extraction format
                name: videoFile.name.replace(/\.[^/.]+$/, '') + '.mp3'
            };
            
            this.audioTracks = [audioTrack];
            
            // Display results
            this.displaySeparationResults();
            
            this.showNotification('✅ Separación completada', 'success');
            
            // Cleanup
            URL.revokeObjectURL(videoURL);
            
        } catch (error) {
            console.error('Separation error:', error);
            this.showNotification('Error al separar audio y video', 'error');
        }
    }
    
    // ============================================
    // Audio Extraction
    // ============================================
    
    async extractAudio(videoFile, format = 'mp3', quality = 'high') {
        try {
            this.showNotification('🎵 Extrayendo audio...', 'info');
            
            // For production, use FFmpeg.wasm or backend processing
            // This is a client-side approach using MediaRecorder
            
            const videoURL = URL.createObjectURL(videoFile);
            const video = document.createElement('video');
            video.src = videoURL;
            video.muted = false;
            
            await new Promise(resolve => {
                video.onloadedmetadata = resolve;
            });
            
            // Create audio context and MediaStream
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const mediaStream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
            const audioStream = new MediaStream(mediaStream.getAudioTracks());
            
            // Record audio
            const mimeType = this.getAudioMimeType(format);
            const options = {
                mimeType: mimeType,
                audioBitsPerSecond: this.getQualityBitrate(quality)
            };
            
            const mediaRecorder = new MediaRecorder(audioStream, options);
            const audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                this.downloadBlob(audioBlob, this.getAudioFileName(videoFile.name, format));
                this.showNotification('✅ Audio extraído correctamente', 'success');
                URL.revokeObjectURL(videoURL);
            };
            
            // Start recording
            mediaRecorder.start();
            video.play();
            
            // Stop when video ends
            video.onended = () => {
                mediaRecorder.stop();
                video.pause();
            };
            
        } catch (error) {
            console.error('Audio extraction error:', error);
            this.showNotification('Error al extraer audio. Prueba con el backend.', 'error');
        }
    }
    
    // ============================================
    // Video-Only Export (No Audio)
    // ============================================
    
    async extractVideoOnly(videoFile) {
        try {
            this.showNotification('🎬 Extrayendo video sin audio...', 'info');
            
            // This would ideally be done with FFmpeg
            // Client-side approach using canvas and MediaRecorder
            
            const videoURL = URL.createObjectURL(videoFile);
            const video = document.createElement('video');
            video.src = videoURL;
            video.muted = true; // Mute to remove audio
            
            await new Promise(resolve => {
                video.onloadedmetadata = resolve;
            });
            
            // Create canvas for video frames
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Capture stream from canvas
            const canvasStream = canvas.captureStream(30); // 30 FPS
            
            // Record video
            const mediaRecorder = new MediaRecorder(canvasStream, {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 5000000 // 5 Mbps
            });
            
            const videoChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    videoChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
                this.downloadBlob(videoBlob, this.getVideoFileName(videoFile.name));
                this.showNotification('✅ Video sin audio extraído', 'success');
                URL.revokeObjectURL(videoURL);
            };
            
            // Start recording and drawing frames
            mediaRecorder.start();
            video.play();
            
            const drawFrame = () => {
                if (!video.paused && !video.ended) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    requestAnimationFrame(drawFrame);
                }
            };
            
            drawFrame();
            
            // Stop when video ends
            video.onended = () => {
                mediaRecorder.stop();
                video.pause();
            };
            
        } catch (error) {
            console.error('Video extraction error:', error);
            this.showNotification('Error al extraer video. Usa el backend para mejor calidad.', 'error');
        }
    }
    
    // ============================================
    // FFmpeg Integration (Backend)
    // ============================================
    
    async separateWithFFmpeg(videoFile) {
        try {
            this.showNotification('🔧 Procesando con FFmpeg...', 'info');
            
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('operation', 'separate');
            
            const response = await fetch('/api/media/separate', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Download results
                if (result.audioUrl) {
                    await this.downloadFromURL(result.audioUrl, 'audio.mp3');
                }
                if (result.videoUrl) {
                    await this.downloadFromURL(result.videoUrl, 'video.mp4');
                }
                
                this.showNotification('✅ Archivos separados con FFmpeg', 'success');
            } else {
                throw new Error('FFmpeg processing failed');
            }
        } catch (error) {
            console.error('FFmpeg error:', error);
            this.showNotification('⚠️ Backend no configurado. Usando método del navegador.', 'error');
            
            // Fallback to browser method
            await this.separateMedia(videoFile);
        }
    }
    
    // ============================================
    // Audio Track Management
    // ============================================
    
    async extractMultipleAudioTracks(videoFile) {
        try {
            // This would require FFmpeg to detect and extract multiple audio tracks
            const formData = new FormData();
            formData.append('video', videoFile);
            formData.append('operation', 'list_tracks');
            
            const response = await fetch('/api/media/tracks', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const tracks = await response.json();
                this.audioTracks = tracks.audio || [];
                this.displayTracks();
            }
        } catch (error) {
            console.error('Track extraction error:', error);
            this.showNotification('Usa FFmpeg en el backend para múltiples pistas', 'error');
        }
    }
    
    // ============================================
    // UI Display
    // ============================================
    
    displaySeparationResults() {
        const resultsContainer = document.getElementById('separationResults');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="separation-results">
                ${this.videoTrack ? `
                    <div class="track-card video-track">
                        <div class="track-icon">🎬</div>
                        <div class="track-info">
                            <h4>Video Track</h4>
                            <p>Resolución: ${this.videoTrack.width}x${this.videoTrack.height}</p>
                            <p>Duración: ${this.formatDuration(this.videoTrack.duration)}</p>
                            <p>Tamaño: ${this.formatFileSize(this.videoTrack.size)}</p>
                        </div>
                        <div class="track-actions">
                            <button class="export-btn" onclick="mediaSeparator.extractVideoOnly(mediaSeparator.currentFile)">
                                📤 Exportar Video Sin Audio
                            </button>
                        </div>
                    </div>
                ` : ''}
                
                ${this.audioTracks.map((track, index) => `
                    <div class="track-card audio-track">
                        <div class="track-icon">🎵</div>
                        <div class="track-info">
                            <h4>Audio Track ${index + 1}</h4>
                            <p>Duración: ${this.formatDuration(track.duration)}</p>
                            <p>Sample Rate: ${track.sampleRate} Hz</p>
                            <p>Formato: MP3</p>
                        </div>
                        <div class="track-actions">
                            <button class="export-btn" onclick="mediaSeparator.extractAudio(mediaSeparator.currentFile, 'mp3', 'high')">
                                📤 Exportar Audio MP3
                            </button>
                            <button class="export-btn" onclick="mediaSeparator.extractAudio(mediaSeparator.currentFile, 'wav', 'high')">
                                📤 Exportar Audio WAV
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    displayTracks() {
        const tracksContainer = document.getElementById('audioTracksList');
        if (!tracksContainer || this.audioTracks.length === 0) return;
        
        tracksContainer.innerHTML = this.audioTracks.map((track, index) => `
            <div class="audio-track-item">
                <span class="track-number">${index + 1}</span>
                <span class="track-name">${track.name || `Track ${index + 1}`}</span>
                <span class="track-lang">${track.language || 'Unknown'}</span>
                <button class="extract-track-btn" onclick="mediaSeparator.extractSpecificTrack(${index})">
                    Extract
                </button>
            </div>
        `).join('');
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    
    getAudioMimeType(format) {
        const mimeTypes = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'webm': 'audio/webm'
        };
        return mimeTypes[format] || 'audio/mpeg';
    }
    
    getQualityBitrate(quality) {
        const bitrates = {
            'low': 64000,
            'medium': 128000,
            'high': 192000,
            'ultra': 320000
        };
        return bitrates[quality] || 192000;
    }
    
    getAudioFileName(videoName, format) {
        const baseName = videoName.replace(/\.[^/.]+$/, '');
        return `${baseName}_audio.${format}`;
    }
    
    getVideoFileName(videoName) {
        const baseName = videoName.replace(/\.[^/.]+$/, '');
        return `${baseName}_video_only.webm`;
    }
    
    estimateFrameRate(video) {
        // This is an estimation, actual frame rate detection requires more complex analysis
        return 30; // Default assumption
    }
    
    formatDuration(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    
    async downloadFromURL(url, filename) {
        const response = await fetch(url);
        const blob = await response.blob();
        this.downloadBlob(blob, filename);
    }
    
    showNotification(message, type = 'info') {
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
        // File upload for separation
        document.getElementById('uploadVideoForSeparation')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('video/')) {
                await this.separateMedia(file);
            } else {
                this.showNotification('Por favor selecciona un archivo de video', 'error');
            }
        });
        
        // Use FFmpeg button
        document.getElementById('useFFmpeg')?.addEventListener('click', async () => {
            if (this.currentFile) {
                await this.separateWithFFmpeg(this.currentFile);
            }
        });
    }
}

// Initialize Media Separator
const mediaSeparator = new MediaSeparator();

// Export for use in other modules
window.mediaSeparator = mediaSeparator;

console.log('🎬 Media Separator initialized');
