/**
 * Hydra Audio-Reactive Visuals Integration
 * Creates live coding video synth visuals synchronized with audio
 * Version: 1.0.0
 */

class HydraVisuals {
    constructor() {
        this.hydra = null;
        this.canvas = null;
        this.isInitialized = false;
        this.isActive = false;
        this.currentPreset = 'sinewaves';
        this.audioData = null;
        this.analyser = null;
        
        // Visual presets
        this.presets = {
            sinewaves: this.sineWaves.bind(this),
            kaleidoscope: this.kaleidoscope.bind(this),
            fractals: this.fractals.bind(this),
            plasma: this.plasma.bind(this),
            tunnel: this.tunnel.bind(this),
            spirals: this.spirals.bind(this),
            glitch: this.glitch.bind(this),
            matrix: this.matrix.bind(this),
            waves3d: this.waves3d.bind(this),
            cosmic: this.cosmic.bind(this)
        };
    }

    /**
     * Initialize Hydra with canvas
     */
    async init(canvasElement, analyser) {
        if (this.isInitialized) return;

        this.canvas = canvasElement;
        this.analyser = analyser;

        try {
            // Initialize Hydra synth
            this.hydra = new Hydra({
                canvas: this.canvas,
                detectAudio: false, // We'll provide our own audio
                enableStreamCapture: false
            });

            this.isInitialized = true;
            console.log('✅ Hydra visuals initialized');
            
            // Start with default preset
            this.startVisual(this.currentPreset);
        } catch (error) {
            console.error('❌ Error initializing Hydra:', error);
        }
    }

    /**
     * Get audio amplitude (0-1)
     */
    getAmplitude() {
        if (!this.analyser) return 0;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calculate average amplitude
        const sum = dataArray.reduce((a, b) => a + b, 0);
        return (sum / dataArray.length) / 255;
    }

    /**
     * Get bass frequency amplitude
     */
    getBass() {
        if (!this.analyser) return 0;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Bass frequencies (0-250Hz, roughly first 10% of spectrum)
        const bassEnd = Math.floor(dataArray.length * 0.1);
        const bassData = dataArray.slice(0, bassEnd);
        const sum = bassData.reduce((a, b) => a + b, 0);
        return (sum / bassData.length) / 255;
    }

    /**
     * Get mid frequency amplitude
     */
    getMid() {
        if (!this.analyser) return 0;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Mid frequencies (250Hz-4kHz, roughly 10-40% of spectrum)
        const midStart = Math.floor(dataArray.length * 0.1);
        const midEnd = Math.floor(dataArray.length * 0.4);
        const midData = dataArray.slice(midStart, midEnd);
        const sum = midData.reduce((a, b) => a + b, 0);
        return (sum / midData.length) / 255;
    }

    /**
     * Get treble frequency amplitude
     */
    getTreble() {
        if (!this.analyser) return 0;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Treble frequencies (4kHz+, roughly last 60% of spectrum)
        const trebleStart = Math.floor(dataArray.length * 0.4);
        const trebleData = dataArray.slice(trebleStart);
        const sum = trebleData.reduce((a, b) => a + b, 0);
        return (sum / trebleData.length) / 255;
    }

    /**
     * PRESET: Sine Waves - Classic audio waveform visualization
     */
    sineWaves() {
        const amp = () => this.getAmplitude();
        const bass = () => this.getBass();
        
        osc(10, 0.1, () => amp() * 2)
            .rotate(() => bass() * 3.14)
            .mult(osc(5, 0.1).modulate(osc(3, 0.5)))
            .color(0, 1, 1)
            .saturate(1.5)
            .out();
    }

    /**
     * PRESET: Kaleidoscope - Psychedelic symmetry
     */
    kaleidoscope() {
        const amp = () => this.getAmplitude();
        const bass = () => this.getBass();
        const treble = () => this.getTreble();
        
        osc(5, 0.1, () => amp() * 2)
            .kaleid(() => 3 + Math.floor(bass() * 10))
            .rotate(() => treble() * 3.14)
            .modulate(osc(10, 0.1), () => amp() * 0.5)
            .color(1, 0.5, 1)
            .saturate(2)
            .out();
    }

    /**
     * PRESET: Fractals - Recursive patterns
     */
    fractals() {
        const amp = () => this.getAmplitude();
        const mid = () => this.getMid();
        
        voronoi(() => 5 + amp() * 10, () => 0.1 + mid() * 0.5)
            .modulateScale(osc(8).rotate(Math.PI/2), () => amp())
            .color(0, 1, 0.5)
            .contrast(1.5)
            .out();
    }

    /**
     * PRESET: Plasma - Energy fields
     */
    plasma() {
        const amp = () => this.getAmplitude();
        const bass = () => this.getBass();
        const treble = () => this.getTreble();
        
        osc(10, 0.1, () => bass() * 2)
            .blend(osc(15, -0.1, () => treble()), () => amp())
            .modulate(noise(3, 0.1))
            .color(1, 0, 1)
            .saturate(1.8)
            .out();
    }

    /**
     * PRESET: Tunnel - Hypnotic depth
     */
    tunnel() {
        const amp = () => this.getAmplitude();
        const bass = () => this.getBass();
        
        osc(20, 0.01, () => bass())
            .mult(osc(10, -0.1).modulate(osc(10).rotate(Math.PI/2), () => amp() * 0.5))
            .color(0, 0.5, 1)
            .scrollX(() => amp() * 0.1)
            .out();
    }

    /**
     * PRESET: Spirals - Rotating patterns
     */
    spirals() {
        const amp = () => this.getAmplitude();
        const mid = () => this.getMid();
        const treble = () => this.getTreble();
        
        shape(() => 3 + Math.floor(mid() * 5), () => 0.5 + amp() * 0.5)
            .repeat(() => 2 + Math.floor(treble() * 3), () => 2 + Math.floor(bass() * 3))
            .rotate(() => treble() * 3.14)
            .color(1, 1, 0)
            .saturate(1.5)
            .out();
    }

    /**
     * PRESET: Glitch - Digital artifacts
     */
    glitch() {
        const amp = () => this.getAmplitude();
        const bass = () => this.getBass();
        const treble = () => this.getTreble();
        
        osc(10, 0.1, () => amp())
            .pixelate(() => 20 + bass() * 100, () => 20 + treble() * 100)
            .modulateKaleid(osc(12), () => amp())
            .color(1, 0, 0.5)
            .contrast(1.8)
            .out();
    }

    /**
     * PRESET: Matrix - Digital rain
     */
    matrix() {
        const amp = () => this.getAmplitude();
        const bass = () => this.getBass();
        
        osc(30, 0.01, () => amp())
            .rotate(Math.PI/2)
            .pixelate(10, () => 100 + bass() * 100)
            .scrollY(() => -0.2 - amp() * 0.2)
            .color(0, 1, 0)
            .contrast(2)
            .out();
    }

    /**
     * PRESET: 3D Waves - Dimensional depth
     */
    waves3d() {
        const amp = () => this.getAmplitude();
        const bass = () => this.getBass();
        const mid = () => this.getMid();
        
        osc(5, 0.1, () => bass() * 2)
            .modulate(osc(3, -0.5).rotate(Math.PI/4), () => amp() * 0.5)
            .modulateScale(osc(2), () => mid() * 0.5)
            .color(0, 1, 1)
            .saturate(1.6)
            .out();
    }

    /**
     * PRESET: Cosmic - Space vibes
     */
    cosmic() {
        const amp = () => this.getAmplitude();
        const bass = () => this.getBass();
        const treble = () => this.getTreble();
        
        noise(3, 0.1)
            .mult(osc(10, 0.1, () => bass()).rotate(Math.PI/2))
            .modulateRotate(osc(1, 0.5), () => treble() * 3.14)
            .color(() => 0.5 + amp() * 0.5, 0, 1)
            .saturate(2)
            .out();
    }

    /**
     * Start a visual preset
     */
    startVisual(presetName = 'sinewaves') {
        if (!this.isInitialized) {
            console.warn('⚠️ Hydra not initialized');
            return;
        }

        if (!this.presets[presetName]) {
            console.warn(`⚠️ Preset "${presetName}" not found, using default`);
            presetName = 'sinewaves';
        }

        this.currentPreset = presetName;
        this.isActive = true;
        
        // Run the preset
        this.presets[presetName]();
        
        console.log(`🎨 Started Hydra visual: ${presetName}`);
    }

    /**
     * Stop visuals
     */
    stop() {
        if (this.hydra) {
            solid(0, 0, 0).out();
            this.isActive = false;
            console.log('⏹️ Hydra visuals stopped');
        }
    }

    /**
     * Change to next preset
     */
    nextPreset() {
        const presetNames = Object.keys(this.presets);
        const currentIndex = presetNames.indexOf(this.currentPreset);
        const nextIndex = (currentIndex + 1) % presetNames.length;
        this.startVisual(presetNames[nextIndex]);
        return presetNames[nextIndex];
    }

    /**
     * Change to previous preset
     */
    previousPreset() {
        const presetNames = Object.keys(this.presets);
        const currentIndex = presetNames.indexOf(this.currentPreset);
        const prevIndex = (currentIndex - 1 + presetNames.length) % presetNames.length;
        this.startVisual(presetNames[prevIndex]);
        return presetNames[prevIndex];
    }

    /**
     * Get list of available presets
     */
    getPresets() {
        return Object.keys(this.presets);
    }

    /**
     * Get current preset name
     */
    getCurrentPreset() {
        return this.currentPreset;
    }

    /**
     * Check if Hydra is active
     */
    isRunning() {
        return this.isActive;
    }
}

// Export for use in other scripts
window.HydraVisuals = HydraVisuals;
