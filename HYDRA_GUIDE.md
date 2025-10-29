# 🎨 Hydra Live Visuals Guide

## Overview

Studio Pro Universal now includes **Hydra.js** integration for live coding video synth visuals that react in real-time to your audio. Hydra creates stunning, generative visuals synchronized with the music's waveform and frequency spectrum.

## What is Hydra?

Hydra is a live coding video synth and creative coding environment that allows you to create real-time, audio-reactive visuals using simple JavaScript commands. It's designed for VJs, live performers, and visual artists.

Website: https://hydra.ojack.xyz/

## Features

### 🎵 Audio-Reactive Visuals
- **Real-time synchronization** with audio playback
- **Frequency analysis** - Bass, mid, and treble detection
- **Amplitude tracking** - Overall volume reactivity
- **Smooth transitions** between visual presets

### 🎨 10 Visual Presets

1. **Sine Waves** - Classic audio waveform visualization with rotating oscillations
2. **Kaleidoscope** - Psychedelic symmetry patterns that react to bass frequencies
3. **Fractals** - Recursive Voronoi patterns modulated by mid-range frequencies
4. **Plasma** - Energy field effects blending multiple oscillators
5. **Tunnel** - Hypnotic depth perception with audio-driven scrolling
6. **Spirals** - Rotating geometric shapes synchronized to treble
7. **Glitch** - Digital artifact effects with pixelation
8. **Matrix** - Digital rain style scrolling patterns
9. **3D Waves** - Dimensional depth effects with scale modulation
10. **Cosmic** - Space-themed noise and rotation effects

### ⌨️ Keyboard Controls

- **`H`** - Toggle Hydra visuals on/off
- **`Alt + →`** - Next visual preset
- **`Alt + ←`** - Previous visual preset

### 🖱️ Mouse Controls

- **Hydra Button** (⚡ icon) - Toggle Hydra on/off
- **Next Button** (→ icon) - Cycle through presets (visible when Hydra is active)

## How to Use

### Basic Usage

1. **Load Audio Files**
   - Add your music files to the playlist
   - Start playback

2. **Activate Hydra**
   - Click the Hydra button (⚡ icon) in the controls
   - Or press `H` on your keyboard
   - The visual canvas will appear over the display

3. **Change Visuals**
   - Click the next button (→ icon) to cycle presets
   - Or use `Alt + →` / `Alt + ←` keyboard shortcuts
   - A notification will show the current preset name

4. **Deactivate**
   - Click the Hydra button again or press `H`
   - Visuals will smoothly fade out

### Advanced Usage

#### Accessing Hydra Programmatically

You can access the Hydra instance from the browser console:

```javascript
// Get the music player instance
const player = document.querySelector('.player-container').__player;

// Access Hydra visuals
const hydra = player.hydra;

// Change to a specific preset
hydra.startVisual('kaleidoscope');

// Get current preset
console.log(hydra.getCurrentPreset());

// Get list of all presets
console.log(hydra.getPresets());
```

#### Creating Custom Presets

You can extend Hydra with custom visual presets:

```javascript
// Add a custom preset
player.hydra.presets.myCustom = function() {
    const amp = () => this.getAmplitude();
    
    osc(20, 0.1, () => amp() * 3)
        .color(1, 0, 0)
        .rotate(Math.PI/4)
        .out();
};

// Use your custom preset
player.hydra.startVisual('myCustom');
```

## Visual Presets Explained

### 1. Sine Waves (Default)
**Best for:** Any genre, classic visualization
- Rotates based on bass frequencies
- Color: Cyan/green neon
- Perfect for getting started

### 2. Kaleidoscope
**Best for:** EDM, Electronic, Psychedelic music
- Symmetry increases with bass hits
- Rotation driven by treble
- Highly psychedelic and mesmerizing

### 3. Fractals
**Best for:** Ambient, Experimental, Jazz
- Recursive Voronoi patterns
- Mid-frequency reactive
- Organic, flowing movement

### 4. Plasma
**Best for:** Trance, Techno, Industrial
- Energy field aesthetics
- Blends multiple oscillators
- Purple/magenta color scheme

### 5. Tunnel
**Best for:** Techno, Minimal, House
- Hypnotic depth effect
- Scrolls with amplitude
- Blue/cyan palette

### 6. Spirals
**Best for:** Progressive, Synthwave
- Geometric rotating shapes
- Treble-driven rotation
- Yellow/gold accents

### 7. Glitch
**Best for:** Glitch Hop, IDM, Experimental
- Digital artifact effects
- Bass-reactive pixelation
- Red/pink tones

### 8. Matrix
**Best for:** Hip-Hop, Drum & Bass
- Digital rain aesthetic
- Amplitude-driven scroll speed
- Classic green Matrix theme

### 9. 3D Waves
**Best for:** Chillwave, Lo-fi, Downtempo
- Dimensional modulation
- Mid-frequency scaling
- Cyan color palette

### 10. Cosmic
**Best for:** Space music, Ambient, Psytrance
- Noise-based patterns
- Treble-driven rotation
- Purple/blue cosmic theme

## Performance Tips

### Optimal Settings

1. **Canvas Resolution**
   - Default: 640x360
   - Higher resolution = better quality but lower FPS
   - Lower resolution = faster but more pixelated

2. **Browser Recommendations**
   - Chrome 90+ (best performance)
   - Firefox 88+ (good performance)
   - Edge 90+ (good performance)
   - Safari 14+ (moderate performance)

3. **System Requirements**
   - Modern GPU with WebGL support
   - 4GB+ RAM recommended
   - Dedicated graphics preferred

### Troubleshooting

**Issue: Low FPS / Stuttering**
- Solution: Close other browser tabs
- Solution: Lower canvas resolution
- Solution: Use simpler presets (Sine Waves, Tunnel)

**Issue: Visuals not appearing**
- Solution: Check browser console for errors
- Solution: Ensure WebGL is enabled in browser
- Solution: Try refreshing the page

**Issue: Visuals not syncing with audio**
- Solution: Ensure audio is actually playing
- Solution: Check that Web Audio API is initialized
- Solution: Try toggling Hydra off and on again

## Technical Details

### Architecture

```
Audio Source
    ↓
Web Audio API
    ↓
AnalyserNode (FFT)
    ↓
Frequency Data
    ↓
Hydra Synth
    ↓
Canvas Rendering
```

### Frequency Analysis

- **Bass** (0-250Hz) - ~10% of frequency spectrum
- **Mid** (250Hz-4kHz) - ~30% of frequency spectrum  
- **Treble** (4kHz+) - ~60% of frequency spectrum

Each preset uses these frequency ranges differently to create unique visual responses.

### Canvas Layers

1. **Base Canvas** - Original spectrum analyzer
2. **Hydra Canvas** - Overlay with 70% opacity
3. Both render simultaneously for rich visuals

## Customization

### Adjusting Opacity

```javascript
// Make Hydra more prominent
document.getElementById('hydraCanvas').style.opacity = '0.9';

// Make Hydra more subtle
document.getElementById('hydraCanvas').style.opacity = '0.5';
```

### Changing Colors

Each preset can be customized by modifying the Hydra code:

```javascript
// Example: Change Sine Waves to red/orange
player.hydra.presets.sinewaves = function() {
    const amp = () => this.getAmplitude();
    osc(10, 0.1, () => amp() * 2)
        .color(1, 0.5, 0)  // Red/Orange instead of cyan
        .out();
};
```

### Creating Theme-Matched Visuals

Presets automatically inherit CSS color variables for consistent theming with the rest of the player.

## Integration with Themes

Hydra visuals work seamlessly with all 11 Studio Pro themes:

- **Evangelion Theme** - Cosmic or Kaleidoscope presets recommended
- **Hotline Miami Theme** - Glitch or Plasma presets recommended
- **Matrix Theme** - Matrix preset (obviously!) recommended
- **Cyberpunk Theme** - Tunnel or Spirals recommended

## API Reference

### HydraVisuals Class

#### Constructor
```javascript
new HydraVisuals()
```

#### Methods

**`init(canvasElement, analyser)`**
- Initialize Hydra with canvas and audio analyser
- Returns: Promise<void>

**`startVisual(presetName)`**
- Start a visual preset
- Parameters: presetName (string)
- Returns: void

**`stop()`**
- Stop all visuals
- Returns: void

**`nextPreset()`**
- Switch to next preset in list
- Returns: string (preset name)

**`previousPreset()`**
- Switch to previous preset
- Returns: string (preset name)

**`getPresets()`**
- Get array of all preset names
- Returns: string[]

**`getCurrentPreset()`**
- Get current preset name
- Returns: string

**`isRunning()`**
- Check if Hydra is active
- Returns: boolean

**`getAmplitude()`**
- Get current overall amplitude (0-1)
- Returns: number

**`getBass()`**
- Get bass frequency amplitude (0-1)
- Returns: number

**`getMid()`**
- Get mid frequency amplitude (0-1)
- Returns: number

**`getTreble()`**
- Get treble frequency amplitude (0-1)
- Returns: number

## Examples

### Example 1: Auto-Switch Presets

```javascript
// Automatically change preset every 30 seconds
setInterval(() => {
    if (player.hydraActive) {
        player.nextHydraPreset();
    }
}, 30000);
```

### Example 2: Bass-Reactive Preset Switch

```javascript
// Switch to Kaleidoscope on bass drops
setInterval(() => {
    if (player.hydra && player.hydra.getBass() > 0.8) {
        player.hydra.startVisual('kaleidoscope');
    }
}, 100);
```

### Example 3: Custom Color Scheme

```javascript
// Create a custom red/blue theme
player.hydra.presets.redblue = function() {
    const amp = () => this.getAmplitude();
    const bass = () => this.getBass();
    
    osc(8, 0.1, () => bass() * 2)
        .blend(osc(12, -0.1), () => amp())
        .color(1, 0, 0.5)  // Red with blue tint
        .out();
};

player.hydra.startVisual('redblue');
```

## Credits

- **Hydra.js** by Olivia Jack - https://hydra.ojack.xyz/
- **Integration** by Studio Pro Universal team
- **Visual Presets** designed for optimal music reactivity

## Resources

- [Hydra Official Documentation](https://hydra.ojack.xyz/docs/)
- [Hydra Functions Reference](https://hydra.ojack.xyz/api/)
- [Hydra Community Examples](https://hydra.ojack.xyz/garden/)
- [Live Coding Tutorial](https://github.com/ojack/hydra#getting-started)

## License

Hydra.js is licensed under AGPL-3.0. Integration code is MIT licensed (same as Studio Pro Universal).

---

**Enjoy creating stunning audio-reactive visuals! 🎨✨**
