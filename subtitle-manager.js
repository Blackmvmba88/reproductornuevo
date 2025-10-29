// ============================================
// Subtitle Generation and Translation Module
// Handles speech-to-text, subtitle creation, and translation
// ============================================

class SubtitleManager {
    constructor() {
        this.subtitles = [];
        this.currentLanguage = 'es';
        this.recognition = null;
        this.isRecording = false;
        
        // Supported languages for translation
        this.languages = {
            'es': 'Español',
            'en': 'English',
            'fr': 'Français',
            'de': 'Deutsch',
            'it': 'Italiano',
            'pt': 'Português',
            'ru': 'Русский',
            'ja': '日本語',
            'zh': '中文',
            'ar': 'العربية'
        };
        
        this.init();
    }
    
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        this.setupSpeechRecognition();
        this.attachEventListeners();
    }
    
    setupSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'es-ES';
            
            this.recognition.onresult = (event) => {
                this.handleSpeechResult(event);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Error: ${event.error}`, 'error');
            };
            
            this.recognition.onend = () => {
                if (this.isRecording) {
                    // Restart if still recording
                    this.recognition.start();
                }
            };
            
            console.log('✅ Speech Recognition initialized');
        } else {
            console.warn('⚠️ Speech Recognition not supported');
            this.showNotification('Tu navegador no soporta reconocimiento de voz', 'error');
        }
    }
    
    // ============================================
    // Speech-to-Text
    // ============================================
    
    startTranscription(audioElement) {
        if (!this.recognition) {
            this.showNotification('Reconocimiento de voz no disponible', 'error');
            return;
        }
        
        try {
            this.isRecording = true;
            this.subtitles = [];
            this.recognition.start();
            this.showNotification('🎤 Generando subtítulos...', 'info');
            
            // Play audio if provided
            if (audioElement) {
                audioElement.play();
            }
        } catch (error) {
            console.error('Start transcription error:', error);
            this.showNotification('Error al iniciar transcripción', 'error');
        }
    }
    
    stopTranscription() {
        if (this.recognition && this.isRecording) {
            this.isRecording = false;
            this.recognition.stop();
            this.showNotification('✅ Subtítulos generados', 'success');
            this.displaySubtitles();
        }
    }
    
    handleSpeechResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                
                // Add to subtitles with timestamp
                const timestamp = this.getCurrentTimestamp();
                this.addSubtitle(timestamp, transcript);
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update live preview
        this.updateLivePreview(interimTranscript);
    }
    
    addSubtitle(timestamp, text) {
        const subtitle = {
            id: this.subtitles.length + 1,
            start: timestamp,
            end: timestamp + 3, // 3 seconds default duration
            text: text.trim(),
            translation: null
        };
        
        this.subtitles.push(subtitle);
        this.updateSubtitleDisplay();
    }
    
    // ============================================
    // File Upload Transcription (Web Speech API Alternative)
    // ============================================
    
    async transcribeAudioFile(audioFile) {
        this.showNotification('🎤 Procesando audio...', 'info');
        
        try {
            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await audioFile.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // For production, you would send this to a backend API
            // that uses Google Speech-to-Text, AWS Transcribe, or similar
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('language', this.currentLanguage);
            
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                this.subtitles = result.subtitles;
                this.displaySubtitles();
                this.showNotification('✅ Transcripción completada', 'success');
            } else {
                throw new Error('Transcription failed');
            }
        } catch (error) {
            console.error('Transcription error:', error);
            this.showNotification('⚠️ Usa el reconocimiento en vivo o configura el backend', 'error');
            
            // Fallback: Use Web Speech API with audio playback
            this.transcribeWithWebSpeech(audioFile);
        }
    }
    
    async transcribeWithWebSpeech(audioFile) {
        const audio = new Audio(URL.createObjectURL(audioFile));
        audio.addEventListener('loadedmetadata', () => {
            this.startTranscription(audio);
        });
    }
    
    // ============================================
    // Translation
    // ============================================
    
    async translateSubtitles(targetLanguage) {
        if (this.subtitles.length === 0) {
            this.showNotification('No hay subtítulos para traducir', 'error');
            return;
        }
        
        this.showNotification(`🌐 Traduciendo a ${this.languages[targetLanguage]}...`, 'info');
        
        try {
            // For production, use Google Translate API, DeepL, or similar
            const texts = this.subtitles.map(sub => sub.text);
            
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    texts: texts,
                    sourceLang: this.currentLanguage,
                    targetLang: targetLanguage
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update subtitles with translations
                this.subtitles.forEach((subtitle, index) => {
                    subtitle.translation = result.translations[index];
                });
                
                this.displaySubtitles();
                this.showNotification('✅ Traducción completada', 'success');
            } else {
                throw new Error('Translation failed');
            }
        } catch (error) {
            console.error('Translation error:', error);
            
            // Fallback to simple client-side translation (demo)
            await this.translateWithLibreTranslate(targetLanguage);
        }
    }
    
    async translateWithLibreTranslate(targetLanguage) {
        try {
            // Use LibreTranslate public API (demo purposes)
            for (let subtitle of this.subtitles) {
                const response = await fetch('https://libretranslate.de/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        q: subtitle.text,
                        source: this.currentLanguage,
                        target: targetLanguage,
                        format: 'text'
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    subtitle.translation = result.translatedText;
                }
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            this.displaySubtitles();
            this.showNotification('✅ Traducción completada', 'success');
        } catch (error) {
            console.error('LibreTranslate error:', error);
            this.showNotification('Error al traducir. Configura el backend para mejor rendimiento.', 'error');
        }
    }
    
    // ============================================
    // Subtitle Export
    // ============================================
    
    exportSRT() {
        if (this.subtitles.length === 0) {
            this.showNotification('No hay subtítulos para exportar', 'error');
            return;
        }
        
        let srtContent = '';
        
        this.subtitles.forEach((subtitle, index) => {
            srtContent += `${index + 1}\n`;
            srtContent += `${this.formatSRTTime(subtitle.start)} --> ${this.formatSRTTime(subtitle.end)}\n`;
            srtContent += `${subtitle.text}\n`;
            if (subtitle.translation) {
                srtContent += `${subtitle.translation}\n`;
            }
            srtContent += '\n';
        });
        
        this.downloadFile(srtContent, 'subtitles.srt', 'text/plain');
        this.showNotification('✅ Subtítulos exportados en formato SRT', 'success');
    }
    
    exportVTT() {
        if (this.subtitles.length === 0) {
            this.showNotification('No hay subtítulos para exportar', 'error');
            return;
        }
        
        let vttContent = 'WEBVTT\n\n';
        
        this.subtitles.forEach((subtitle, index) => {
            vttContent += `${index + 1}\n`;
            vttContent += `${this.formatVTTTime(subtitle.start)} --> ${this.formatVTTTime(subtitle.end)}\n`;
            vttContent += `${subtitle.text}\n`;
            if (subtitle.translation) {
                vttContent += `${subtitle.translation}\n`;
            }
            vttContent += '\n';
        });
        
        this.downloadFile(vttContent, 'subtitles.vtt', 'text/vtt');
        this.showNotification('✅ Subtítulos exportados en formato VTT', 'success');
    }
    
    exportJSON() {
        if (this.subtitles.length === 0) {
            this.showNotification('No hay subtítulos para exportar', 'error');
            return;
        }
        
        const jsonContent = JSON.stringify(this.subtitles, null, 2);
        this.downloadFile(jsonContent, 'subtitles.json', 'application/json');
        this.showNotification('✅ Subtítulos exportados en formato JSON', 'success');
    }
    
    // ============================================
    // UI Updates
    // ============================================
    
    updateSubtitleDisplay() {
        const listElement = document.getElementById('subtitleList');
        if (!listElement) return;
        
        if (this.subtitles.length === 0) {
            listElement.innerHTML = '<div class="empty-state">No hay subtítulos generados</div>';
            return;
        }
        
        listElement.innerHTML = this.subtitles.map((subtitle, index) => `
            <div class="subtitle-item" data-subtitle-id="${subtitle.id}">
                <div class="subtitle-number">${index + 1}</div>
                <div class="subtitle-content">
                    <div class="subtitle-time">
                        ${this.formatTime(subtitle.start)} → ${this.formatTime(subtitle.end)}
                    </div>
                    <div class="subtitle-text" contenteditable="true" onblur="subtitleManager.updateSubtitleText(${subtitle.id}, this.textContent)">
                        ${subtitle.text}
                    </div>
                    ${subtitle.translation ? `
                        <div class="subtitle-translation">
                            ${subtitle.translation}
                        </div>
                    ` : ''}
                </div>
                <div class="subtitle-actions">
                    <button class="action-btn" onclick="subtitleManager.deleteSubtitle(${subtitle.id})" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    displaySubtitles() {
        this.updateSubtitleDisplay();
        
        // Update counter
        const counter = document.getElementById('subtitleCount');
        if (counter) {
            counter.textContent = `${this.subtitles.length} subtítulos`;
        }
    }
    
    updateLivePreview(text) {
        const preview = document.getElementById('liveSubtitlePreview');
        if (preview) {
            preview.textContent = text;
        }
    }
    
    updateSubtitleText(id, newText) {
        const subtitle = this.subtitles.find(sub => sub.id === id);
        if (subtitle) {
            subtitle.text = newText.trim();
        }
    }
    
    deleteSubtitle(id) {
        this.subtitles = this.subtitles.filter(sub => sub.id !== id);
        this.displaySubtitles();
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    
    getCurrentTimestamp() {
        // If video/audio element is available, use its currentTime
        const media = document.getElementById('previewVideo') || document.getElementById('audioPlayer');
        if (media) {
            return media.currentTime;
        }
        return Date.now() / 1000;
    }
    
    formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    formatSRTTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    }
    
    formatVTTTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
        // Start transcription button
        document.getElementById('startTranscription')?.addEventListener('click', () => {
            this.startTranscription();
        });
        
        // Stop transcription button
        document.getElementById('stopTranscription')?.addEventListener('click', () => {
            this.stopTranscription();
        });
        
        // Upload audio for transcription
        document.getElementById('uploadAudioForSubtitles')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.transcribeAudioFile(file);
            }
        });
        
        // Translation buttons
        document.getElementById('translateSubtitles')?.addEventListener('click', () => {
            const targetLang = document.getElementById('targetLanguage')?.value || 'en';
            this.translateSubtitles(targetLang);
        });
        
        // Export buttons
        document.getElementById('exportSRT')?.addEventListener('click', () => {
            this.exportSRT();
        });
        
        document.getElementById('exportVTT')?.addEventListener('click', () => {
            this.exportVTT();
        });
        
        document.getElementById('exportJSON')?.addEventListener('click', () => {
            this.exportJSON();
        });
    }
}

// Initialize Subtitle Manager
const subtitleManager = new SubtitleManager();

// Export for use in other modules
window.subtitleManager = subtitleManager;

console.log('📝 Subtitle Manager initialized');
