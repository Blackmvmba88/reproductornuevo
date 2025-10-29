// Music Player with Metadata Support
class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.playlist = [];
        this.currentTrackIndex = -1;
        this.isPlaying = false;
        this.isShuffleOn = false;
        this.isRepeatOn = false;
        this.isMuted = false;
        
        // Initialize audio context for visualization
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.eqInterval = null;
        
        // Hydra visuals
        this.hydra = null;
        this.hydraActive = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupVisualization();
        this.updateEqualizer();
        this.initializeHydra();
    }
    
    initializeElements() {
        // Control buttons
        this.playBtn = document.getElementById('play');
        this.stopBtn = document.getElementById('stop');
        this.prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.shuffleBtn = document.getElementById('shuffle');
        this.repeatBtn = document.getElementById('repeat');
        
        // Display elements
        this.trackTitle = document.querySelector('.track-title');
        this.trackArtist = document.querySelector('.track-artist');
        this.currentTimeEl = document.querySelector('.current-time');
        this.totalTimeEl = document.querySelector('.total-time');
        
        // Controls
        this.progressBar = document.querySelector('.progress-bar');
        this.volumeSlider = document.querySelector('.volume-slider');
        this.volumeValue = document.querySelector('.volume-value');
        this.muteBtn = document.getElementById('mute');
        
        // Playlist
        this.playlistEl = document.getElementById('playlist');
        this.fileInput = document.getElementById('fileInput');
        this.addFilesBtn = document.getElementById('addFiles');
        this.clearPlaylistBtn = document.getElementById('clearPlaylist');
        
        // Visualization
        this.canvas = document.getElementById('visualizer');
        this.canvasCtx = this.canvas.getContext('2d');
        this.eqBars = document.querySelectorAll('.eq-bar');
        this.equalizerSection = document.querySelector('.equalizer-section');
        
        // Hydra controls
        this.hydraCanvas = document.getElementById('hydraCanvas');
        this.hydraToggleBtn = document.getElementById('hydraToggle');
        this.hydraNextBtn = document.getElementById('hydraNext');
    }
    
    attachEventListeners() {
        // Playback controls
        this.playBtn.addEventListener('click', () => this.togglePlayPause());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onTrackEnded());
        this.audio.addEventListener('loadedmetadata', () => this.onMetadataLoaded());
        
        // Progress bar
        this.progressBar.addEventListener('input', (e) => this.seek(e));
        
        // Volume controls
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Playlist controls
        this.addFilesBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.clearPlaylistBtn.addEventListener('click', () => this.clearPlaylist());
        
        // Drag and drop
        this.playlistEl.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.playlistEl.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.playlistEl.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Hydra controls
        if (this.hydraToggleBtn) {
            this.hydraToggleBtn.addEventListener('click', () => this.toggleHydra());
        }
        if (this.hydraNextBtn) {
            this.hydraNextBtn.addEventListener('click', () => this.nextHydraPreset());
        }
        
        // Set initial volume
        this.setVolume(70);
    }
    
    setupVisualization() {
        // Set canvas size
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        
        // Initialize audio context on first user interaction
        document.body.addEventListener('click', () => {
            if (!this.audioContext) {
                this.initAudioContext();
            }
        }, { once: true });
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            if (!this.source) {
                this.source = this.audioContext.createMediaElementSource(this.audio);
                this.source.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            }
        } catch (error) {
            console.error('Error initializing audio context:', error);
        }
    }
    
    // Metadata extraction from audio files
    async extractMetadata(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                const metadata = {
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    artist: 'Artista Desconocido',
                    album: 'Álbum Desconocido',
                    year: '',
                    genre: '',
                    duration: 0,
                    albumArt: null,
                    filename: file.name,
                    format: file.type || this.getFileFormat(file.name),
                    size: this.formatFileSize(file.size),
                    bitrate: '',
                    sampleRate: ''
                };
                
                // Try to parse ID3 tags (for MP3 files)
                try {
                    const tags = this.parseID3Tags(arrayBuffer);
                    if (tags) {
                        Object.assign(metadata, tags);
                    }
                } catch (error) {
                    console.log('Error parsing metadata:', error);
                }
                
                // Get audio duration using audio element
                const audioBlob = new Blob([arrayBuffer], { type: file.type });
                const url = URL.createObjectURL(audioBlob);
                const audioElement = new Audio();
                
                audioElement.onloadedmetadata = () => {
                    metadata.duration = audioElement.duration;
                    metadata.sampleRate = audioElement.mozSampleRate || '';
                    URL.revokeObjectURL(url);
                    resolve(metadata);
                };
                
                audioElement.onerror = () => {
                    URL.revokeObjectURL(url);
                    resolve(metadata);
                };
                
                audioElement.src = url;
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Parse ID3 tags from MP3 files
    parseID3Tags(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        const tags = {};
        
        // Check for ID3v2 header
        if (view.byteLength < 10) return null;
        
        const id3Header = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
        if (id3Header !== 'ID3') return null;
        
        const version = view.getUint8(3);
        const flags = view.getUint8(5);
        
        // Get tag size (synchsafe integer)
        const size = (view.getUint8(6) << 21) | (view.getUint8(7) << 14) | 
                     (view.getUint8(8) << 7) | view.getUint8(9);
        
        let offset = 10;
        const endOffset = Math.min(offset + size, view.byteLength);
        
        // Parse frames
        while (offset < endOffset - 10) {
            const frameId = String.fromCharCode(
                view.getUint8(offset), view.getUint8(offset + 1),
                view.getUint8(offset + 2), view.getUint8(offset + 3)
            );
            
            if (frameId === '\x00\x00\x00\x00') break;
            
            const frameSize = version >= 4 ?
                ((view.getUint8(offset + 4) << 21) | (view.getUint8(offset + 5) << 14) |
                 (view.getUint8(offset + 6) << 7) | view.getUint8(offset + 7)) :
                ((view.getUint8(offset + 4) << 24) | (view.getUint8(offset + 5) << 16) |
                 (view.getUint8(offset + 6) << 8) | view.getUint8(offset + 7));
            
            const frameFlags = (view.getUint8(offset + 8) << 8) | view.getUint8(offset + 9);
            
            offset += 10;
            
            if (frameSize > 0 && offset + frameSize <= endOffset) {
                const frameData = new Uint8Array(arrayBuffer, offset, frameSize);
                const text = this.decodeID3Text(frameData);
                
                // Map frame IDs to metadata
                switch (frameId) {
                    case 'TIT2': tags.title = text; break;
                    case 'TPE1': tags.artist = text; break;
                    case 'TALB': tags.album = text; break;
                    case 'TYER': case 'TDRC': tags.year = text; break;
                    case 'TCON': tags.genre = text; break;
                    case 'APIC': 
                        tags.albumArt = this.extractAlbumArt(frameData);
                        break;
                }
            }
            
            offset += frameSize;
        }
        
        return Object.keys(tags).length > 0 ? tags : null;
    }
    
    decodeID3Text(data) {
        if (data.length < 2) return '';
        
        const encoding = data[0];
        let text = '';
        
        try {
            // Skip encoding byte
            const textData = data.slice(1);
            
            switch (encoding) {
                case 0: // ISO-8859-1
                case 3: // UTF-8
                    text = new TextDecoder('utf-8').decode(textData);
                    break;
                case 1: // UTF-16 with BOM
                case 2: // UTF-16BE without BOM
                    text = new TextDecoder('utf-16').decode(textData);
                    break;
            }
            
            // Remove null terminators
            text = text.replace(/\0/g, '').trim();
        } catch (error) {
            console.error('Error decoding text:', error);
        }
        
        return text;
    }
    
    extractAlbumArt(data) {
        try {
            // Skip encoding byte
            let offset = 1;
            
            // Find MIME type (null-terminated)
            let mimeType = '';
            while (offset < data.length && data[offset] !== 0) {
                mimeType += String.fromCharCode(data[offset]);
                offset++;
            }
            offset++; // Skip null terminator
            
            // Skip picture type byte
            offset++;
            
            // Skip description (null-terminated)
            while (offset < data.length && data[offset] !== 0) {
                offset++;
            }
            offset++; // Skip null terminator
            
            // Remaining data is the image
            if (offset < data.length) {
                const imageData = data.slice(offset);
                const blob = new Blob([imageData], { type: mimeType || 'image/jpeg' });
                return URL.createObjectURL(blob);
            }
        } catch (error) {
            console.error('Error extracting album art:', error);
        }
        return null;
    }
    
    getFileFormat(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const formats = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac',
            'aac': 'audio/aac',
            'm4a': 'audio/mp4',
            'wma': 'audio/x-ms-wma',
            'opus': 'audio/opus'
        };
        return formats[ext] || 'audio/*';
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    
    async handleFileSelect(event) {
        const files = Array.from(event.target.files);
        await this.addFilesToPlaylist(files);
        event.target.value = '';
    }
    
    async addFilesToPlaylist(files) {
        const audioFiles = files.filter(file => file.type.startsWith('audio/') || 
            /\.(mp3|wav|ogg|flac|aac|m4a|wma|opus)$/i.test(file.name));
        
        for (const file of audioFiles) {
            const metadata = await this.extractMetadata(file);
            const url = URL.createObjectURL(file);
            
            this.playlist.push({
                url: url,
                file: file,
                metadata: metadata
            });
        }
        
        this.renderPlaylist();
        
        // Auto-play first track if nothing is playing
        if (this.currentTrackIndex === -1 && this.playlist.length > 0) {
            this.playTrack(0);
        }
    }
    
    renderPlaylist() {
        // Remove drop zone if playlist has items
        if (this.playlist.length > 0) {
            const dropZone = this.playlistEl.querySelector('.drop-zone');
            if (dropZone) dropZone.remove();
        }
        
        // Clear and rebuild playlist
        const existingItems = this.playlistEl.querySelectorAll('.playlist-item');
        existingItems.forEach(item => item.remove());
        
        this.playlist.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            if (index === this.currentTrackIndex) {
                item.classList.add('active');
            }
            
            const info = document.createElement('div');
            info.className = 'playlist-item-info';
            
            const title = document.createElement('div');
            title.className = 'playlist-item-title';
            title.textContent = `${index + 1}. ${track.metadata.title}`;
            if (track.metadata.artist && track.metadata.artist !== 'Artista Desconocido') {
                title.textContent += ` - ${track.metadata.artist}`;
            }
            
            const details = document.createElement('div');
            details.className = 'playlist-item-duration';
            const duration = this.formatTime(track.metadata.duration);
            let detailsText = duration;
            if (track.metadata.album && track.metadata.album !== 'Álbum Desconocido') {
                detailsText += ` • ${track.metadata.album}`;
            }
            if (track.metadata.format) {
                const format = track.metadata.format.split('/').pop().toUpperCase();
                detailsText += ` • ${format}`;
            }
            details.textContent = detailsText;
            
            info.appendChild(title);
            info.appendChild(details);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'playlist-item-remove';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeTrack(index);
            });
            
            item.appendChild(info);
            item.appendChild(removeBtn);
            
            item.addEventListener('click', () => this.playTrack(index));
            
            this.playlistEl.appendChild(item);
        });
        
        // Show drop zone if playlist is empty
        if (this.playlist.length === 0) {
            this.showDropZone();
        }
    }
    
    showDropZone() {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = `
            <p>Arrastra archivos de audio aquí</p>
            <p class="formats">Formatos soportados: MP3, WAV, OGG, FLAC, AAC, M4A</p>
        `;
        this.playlistEl.appendChild(dropZone);
    }
    
    removeTrack(index) {
        // Revoke object URL to free memory
        URL.revokeObjectURL(this.playlist[index].url);
        
        // Adjust current track index if needed
        if (index === this.currentTrackIndex) {
            this.stop();
            this.currentTrackIndex = -1;
        } else if (index < this.currentTrackIndex) {
            this.currentTrackIndex--;
        }
        
        this.playlist.splice(index, 1);
        this.renderPlaylist();
    }
    
    clearPlaylist() {
        this.stop();
        this.playlist.forEach(track => URL.revokeObjectURL(track.url));
        this.playlist = [];
        this.currentTrackIndex = -1;
        this.renderPlaylist();
        this.updateDisplay();
    }
    
    playTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        
        this.audio.src = track.url;
        this.audio.play();
        this.isPlaying = true;
        
        this.updateDisplay();
        this.updatePlayButton();
        this.renderPlaylist();
        
        // Resume audio context if suspended
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    togglePlayPause() {
        if (this.playlist.length === 0) return;
        
        if (this.currentTrackIndex === -1) {
            this.playTrack(0);
            return;
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play();
            this.isPlaying = true;
        }
        
        this.updatePlayButton();
    }
    
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayButton();
        this.updateProgress();
    }
    
    playNext() {
        if (this.playlist.length === 0) return;
        
        let nextIndex;
        if (this.isShuffleOn) {
            nextIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        }
        
        this.playTrack(nextIndex);
    }
    
    playPrevious() {
        if (this.playlist.length === 0) return;
        
        if (this.audio.currentTime > 3) {
            // Restart current track if more than 3 seconds played
            this.audio.currentTime = 0;
        } else {
            let prevIndex = this.currentTrackIndex - 1;
            if (prevIndex < 0) prevIndex = this.playlist.length - 1;
            this.playTrack(prevIndex);
        }
    }
    
    onTrackEnded() {
        if (this.isRepeatOn) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.playNext();
        }
    }
    
    toggleShuffle() {
        this.isShuffleOn = !this.isShuffleOn;
        this.shuffleBtn.classList.toggle('active', this.isShuffleOn);
    }
    
    toggleRepeat() {
        this.isRepeatOn = !this.isRepeatOn;
        this.repeatBtn.classList.toggle('active', this.isRepeatOn);
    }
    
    seek(event) {
        if (this.audio.duration) {
            const time = (event.target.value / 100) * this.audio.duration;
            this.audio.currentTime = time;
        }
    }
    
    setVolume(value) {
        this.audio.volume = value / 100;
        this.volumeValue.textContent = `${Math.round(value)}%`;
        this.volumeSlider.value = value;
        
        // Update mute button icon
        if (value === 0) {
            this.showMuteIcon(true);
        } else {
            this.showMuteIcon(false);
        }
    }
    
    toggleMute() {
        if (this.isMuted) {
            this.audio.volume = this.volumeSlider.value / 100;
            this.isMuted = false;
            this.showMuteIcon(false);
        } else {
            this.audio.volume = 0;
            this.isMuted = true;
            this.showMuteIcon(true);
        }
    }
    
    showMuteIcon(muted) {
        const volumeIcon = this.muteBtn.querySelector('.volume-icon');
        const muteIcon = this.muteBtn.querySelector('.mute-icon');
        
        if (muted) {
            volumeIcon.style.display = 'none';
            muteIcon.style.display = 'block';
        } else {
            volumeIcon.style.display = 'block';
            muteIcon.style.display = 'none';
        }
    }
    
    updatePlayButton() {
        const playIcon = this.playBtn.querySelector('.play-icon');
        const pauseIcon = this.playBtn.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            this.equalizerSection.classList.add('playing');
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            this.equalizerSection.classList.remove('playing');
        }
    }
    
    updateDisplay() {
        if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.playlist.length) {
            const track = this.playlist[this.currentTrackIndex];
            const metadata = track.metadata;
            
            // Update track info with metadata
            this.trackTitle.textContent = metadata.title || track.file.name;
            
            // Build artist info with additional metadata
            let artistInfo = [];
            if (metadata.artist && metadata.artist !== 'Artista Desconocido') {
                artistInfo.push(metadata.artist);
            }
            if (metadata.album && metadata.album !== 'Álbum Desconocido') {
                artistInfo.push(metadata.album);
            }
            if (metadata.year) {
                artistInfo.push(metadata.year);
            }
            if (metadata.genre) {
                artistInfo.push(metadata.genre);
            }
            
            this.trackArtist.textContent = artistInfo.length > 0 ? artistInfo.join(' • ') : '';
            
            // Update document title
            document.title = `▶ ${metadata.title} - Reproductor HD`;
        } else {
            this.trackTitle.textContent = 'Sin pista seleccionada';
            this.trackArtist.textContent = '';
            document.title = 'Reproductor de Música HD - Estilo Winamp';
        }
    }
    
    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.value = progress;
            
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
            this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
        }
        
        // Update visualization
        if (this.isPlaying) {
            this.updateVisualization();
        }
    }
    
    onMetadataLoaded() {
        this.totalTimeEl.textContent = this.formatTime(this.audio.duration);
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateVisualization() {
        if (!this.analyser || !this.dataArray) return;
        
        requestAnimationFrame(() => this.updateVisualization());
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Draw on canvas
        this.canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            
            const r = barHeight + (25 * (i / this.dataArray.length));
            const g = 250 * (i / this.dataArray.length);
            const b = 50;
            
            this.canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.canvasCtx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    updateEqualizer() {
        if (!this.analyser || !this.isPlaying) {
            // Random animation when not playing (only set once)
            if (!this.eqInterval) {
                this.eqInterval = setInterval(() => {
                    if (!this.isPlaying) {
                        this.eqBars.forEach(bar => {
                            const height = Math.random() * 30 + 10;
                            bar.style.height = `${height}px`;
                        });
                    } else {
                        // Clear interval when playing starts
                        clearInterval(this.eqInterval);
                        this.eqInterval = null;
                    }
                }, 200);
            }
            return;
        }
        
        if (!this.dataArray) return;
        
        requestAnimationFrame(() => this.updateEqualizer());
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        const step = Math.floor(this.dataArray.length / this.eqBars.length);
        
        this.eqBars.forEach((bar, index) => {
            const value = this.dataArray[index * step];
            const height = (value / 255) * 50 + 5;
            bar.style.height = `${height}px`;
        });
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropZone = this.playlistEl.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.classList.add('drag-over');
        }
    }
    
    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        const dropZone = this.playlistEl.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
    }
    
    async handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const dropZone = this.playlistEl.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
        
        const files = Array.from(event.dataTransfer.files);
        await this.addFilesToPlaylist(files);
    }
    
    handleKeyboard(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.playNext();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.playPrevious();
                break;
            case 'ArrowUp':
                event.preventDefault();
                const newVol = Math.min(100, parseInt(this.volumeSlider.value) + 5);
                this.setVolume(newVol);
                break;
            case 'ArrowDown':
                event.preventDefault();
                const volDown = Math.max(0, parseInt(this.volumeSlider.value) - 5);
                this.setVolume(volDown);
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'KeyH':
                // Toggle Hydra visuals with H key
                this.toggleHydra();
                break;
            case 'ArrowRight':
                if (event.altKey) {
                    // Alt + Arrow Right: Next Hydra preset
                    event.preventDefault();
                    this.nextHydraPreset();
                }
                break;
            case 'ArrowLeft':
                if (event.altKey) {
                    // Alt + Arrow Left: Previous Hydra preset
                    event.preventDefault();
                    this.previousHydraPreset();
                }
                break;
        }
    }
    
    // ===== HYDRA VISUAL METHODS =====
    
    async initializeHydra() {
        try {
            // Wait for Hydra to be available
            if (typeof HydraVisuals === 'undefined') {
                console.warn('⚠️ HydraVisuals not loaded');
                return;
            }
            
            this.hydra = new HydraVisuals();
            console.log('✅ Hydra visuals ready');
        } catch (error) {
            console.error('❌ Error initializing Hydra:', error);
        }
    }
    
    async toggleHydra() {
        if (!this.hydra) {
            await this.initializeHydra();
        }
        
        if (!this.hydra) {
            this.showNotification('⚠️ Hydra no disponible');
            return;
        }
        
        this.hydraActive = !this.hydraActive;
        
        if (this.hydraActive) {
            // Initialize Hydra with canvas and analyser
            if (!this.hydra.isInitialized) {
                // Make sure audio context is created
                if (!this.audioContext) {
                    this.initAudioContext();
                }
                
                await this.hydra.init(this.hydraCanvas, this.analyser);
            } else {
                this.hydra.startVisual();
            }
            
            // Show Hydra canvas
            this.hydraCanvas.style.display = 'block';
            this.hydraNextBtn.style.display = 'inline-block';
            this.hydraToggleBtn.style.opacity = '1';
            this.hydraToggleBtn.style.color = 'var(--accent-color)';
            
            const presetName = this.hydra.getCurrentPreset();
            this.showNotification(`🎨 Hydra activado: ${presetName}`);
        } else {
            // Stop Hydra
            if (this.hydra) {
                this.hydra.stop();
            }
            
            // Hide Hydra canvas
            this.hydraCanvas.style.display = 'none';
            this.hydraNextBtn.style.display = 'none';
            this.hydraToggleBtn.style.opacity = '0.7';
            this.hydraToggleBtn.style.color = '';
            
            this.showNotification('⏹️ Hydra desactivado');
        }
    }
    
    nextHydraPreset() {
        if (!this.hydra || !this.hydraActive) {
            this.showNotification('⚠️ Activa Hydra primero (H)');
            return;
        }
        
        const presetName = this.hydra.nextPreset();
        this.showNotification(`🎨 Visual: ${presetName}`);
    }
    
    previousHydraPreset() {
        if (!this.hydra || !this.hydraActive) {
            this.showNotification('⚠️ Activa Hydra primero (H)');
            return;
        }
        
        const presetName = this.hydra.previousPreset();
        this.showNotification(`🎨 Visual: ${presetName}`);
    }
    
    showNotification(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'hydra-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--button-bg);
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Initialize player when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const player = new MusicPlayer();
    console.log('Reproductor de Música HD iniciado con soporte completo de metadata');
});
