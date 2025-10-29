/**
 * STUDIO PRO - THEME MANAGER
 * Manages dynamic theme switching with bold, colorful skins
 */

class ThemeManager {
    constructor() {
        this.themes = [
            { id: 'default', name: '🎮 Neon Green', colors: ['#00ff88', '#00d4ff'] },
            { id: 'evangelion', name: '🤖 Evangelion', colors: ['#00ff41', '#9d00ff'] },
            { id: 'sunset', name: '🌅 Sunset Fire', colors: ['#ff6b00', '#ff0077'] },
            { id: 'ocean', name: '🌊 Ocean Wave', colors: ['#00ffff', '#0088ff'] },
            { id: 'hotline', name: '📞 Hotline Miami', colors: ['#ff10f0', '#00ffff'] },
            { id: 'matrix', name: '💚 Matrix', colors: ['#00ff00', '#39ff14'] },
            { id: 'lava', name: '🔥 Lava', colors: ['#ff0000', '#ff6600'] },
            { id: 'cyberpunk', name: '🌃 Cyberpunk', colors: ['#fcee09', '#ff00ff'] },
            { id: 'vaporwave', name: '🌸 Vaporwave', colors: ['#ff71ce', '#01cdfe'] },
            { id: 'toxic', name: '☢️ Toxic', colors: ['#ccff00', '#00ff00'] },
            { id: 'royal', name: '👑 Royal', colors: ['#ffd700', '#9370db'] }
        ];
        
        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);
        
        // Create theme selector UI
        this.createThemeSelector();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    createThemeSelector() {
        // Create theme selector container
        const selector = document.createElement('div');
        selector.className = 'theme-selector';
        selector.innerHTML = `
            <button class="theme-button" id="theme-toggle">
                <span>🎨</span>
                <span>Temas</span>
            </button>
            <div class="theme-dropdown" id="theme-dropdown">
                ${this.themes.map(theme => `
                    <div class="theme-option ${theme.id === this.currentTheme ? 'active' : ''}" 
                         data-theme="${theme.id}">
                        <div class="theme-color-preview" 
                             style="background: linear-gradient(90deg, ${theme.colors[0]}, ${theme.colors[1]})">
                        </div>
                        <span>${theme.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.body.appendChild(selector);
    }

    setupEventListeners() {
        const toggleButton = document.getElementById('theme-toggle');
        const dropdown = document.getElementById('theme-dropdown');
        const options = document.querySelectorAll('.theme-option');

        // Toggle dropdown
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                dropdown.classList.remove('active');
            }
        });

        // Handle theme selection
        options.forEach(option => {
            option.addEventListener('click', () => {
                const themeId = option.dataset.theme;
                this.changeTheme(themeId);
                
                // Update active state
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Close dropdown
                dropdown.classList.remove('active');
            });
        });

        // Keyboard shortcut: Ctrl/Cmd + T to toggle theme menu
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });

        // Keyboard shortcut: 1-9, 0 for quick theme switching
        document.addEventListener('keydown', (e) => {
            if (e.altKey && !isNaN(e.key)) {
                const index = e.key === '0' ? 9 : parseInt(e.key) - 1;
                if (index >= 0 && index < this.themes.length) {
                    this.changeTheme(this.themes[index].id);
                    this.updateActiveOption();
                }
            }
        });
    }

    changeTheme(themeId) {
        this.currentTheme = themeId;
        this.applyTheme(themeId);
        this.saveTheme(themeId);
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: themeId } 
        }));
        
        // Show notification
        this.showNotification(themeId);
    }

    applyTheme(themeId) {
        // Remove all theme attributes
        document.body.removeAttribute('data-theme');
        
        // Apply new theme
        if (themeId !== 'default') {
            document.body.setAttribute('data-theme', themeId);
        }
        
        // Add animation class
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 500);
    }

    saveTheme(themeId) {
        try {
            localStorage.setItem('studioPro_theme', themeId);
        } catch (e) {
            console.warn('Could not save theme to localStorage:', e);
        }
    }

    loadTheme() {
        try {
            return localStorage.getItem('studioPro_theme') || 'default';
        } catch (e) {
            console.warn('Could not load theme from localStorage:', e);
            return 'default';
        }
    }

    updateActiveOption() {
        const options = document.querySelectorAll('.theme-option');
        options.forEach(opt => {
            if (opt.dataset.theme === this.currentTheme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    showNotification(themeId) {
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme) return;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <div class="theme-notification-content">
                <span class="theme-notification-icon">🎨</span>
                <span>Tema: ${theme.name}</span>
            </div>
        `;
        
        // Add styles inline
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid var(--primary-color);
            border-radius: 8px;
            padding: 15px 20px;
            color: var(--primary-color);
            font-family: 'Courier New', monospace;
            font-weight: bold;
            z-index: 10000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s;
            box-shadow: 0 0 30px var(--glow-color);
        `;
        
        document.body.appendChild(notification);
        
        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Public method to get current theme
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Public method to get all themes
    getAllThemes() {
        return this.themes;
    }

    // Cycle to next theme
    nextTheme() {
        const currentIndex = this.themes.findIndex(t => t.id === this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.changeTheme(this.themes[nextIndex].id);
        this.updateActiveOption();
    }

    // Cycle to previous theme
    previousTheme() {
        const currentIndex = this.themes.findIndex(t => t.id === this.currentTheme);
        const prevIndex = (currentIndex - 1 + this.themes.length) % this.themes.length;
        this.changeTheme(this.themes[prevIndex].id);
        this.updateActiveOption();
    }

    // Random theme
    randomTheme() {
        const randomIndex = Math.floor(Math.random() * this.themes.length);
        this.changeTheme(this.themes[randomIndex].id);
        this.updateActiveOption();
    }
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    .theme-notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .theme-notification-icon {
        font-size: 24px;
    }

    .theme-transitioning {
        transition: all 0.5s ease;
    }
`;
document.head.appendChild(style);

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
