// ============================================
// Studio Pro - Authentication System
// Supports Google OAuth, GitHub OAuth, and Email/Password
// ============================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authProvider = null;
        
        // OAuth Configuration
        this.config = {
            google: {
                clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                redirectUri: window.location.origin + '/auth/google/callback',
                scope: 'profile email'
            },
            github: {
                clientId: 'YOUR_GITHUB_CLIENT_ID',
                redirectUri: window.location.origin + '/auth/github/callback',
                scope: 'user:email'
            }
        };
        
        this.init();
    }
    
    init() {
        this.loadGoogleAPI();
        this.attachEventListeners();
        this.checkAuthState();
    }
    
    // ============================================
    // Google OAuth Integration
    // ============================================
    
    loadGoogleAPI() {
        // Load Google Identity Services
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => this.initializeGoogleAuth();
        document.head.appendChild(script);
    }
    
    initializeGoogleAuth() {
        if (typeof google !== 'undefined') {
            google.accounts.id.initialize({
                client_id: this.config.google.clientId,
                callback: (response) => this.handleGoogleResponse(response),
                auto_select: false
            });
        }
    }
    
    handleGoogleLogin() {
        this.showLoading();
        
        if (typeof google !== 'undefined') {
            // Use Google One Tap or prompt for login
            google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Fallback to OAuth 2.0 flow
                    this.initiateGoogleOAuth();
                }
            });
        } else {
            this.initiateGoogleOAuth();
        }
    }
    
    initiateGoogleOAuth() {
        const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const params = new URLSearchParams({
            client_id: this.config.google.clientId,
            redirect_uri: this.config.google.redirectUri,
            response_type: 'token',
            scope: this.config.google.scope,
            include_granted_scopes: 'true',
            state: this.generateState()
        });
        
        window.location.href = `${authUrl}?${params.toString()}`;
    }
    
    handleGoogleResponse(response) {
        // Decode JWT token
        const userInfo = this.parseJWT(response.credential);
        
        this.authenticateUser({
            provider: 'google',
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            token: response.credential
        });
    }
    
    // ============================================
    // GitHub OAuth Integration
    // ============================================
    
    handleGithubLogin() {
        this.showLoading();
        
        const authUrl = 'https://github.com/login/oauth/authorize';
        const params = new URLSearchParams({
            client_id: this.config.github.clientId,
            redirect_uri: this.config.github.redirectUri,
            scope: this.config.github.scope,
            state: this.generateState(),
            allow_signup: 'true'
        });
        
        window.location.href = `${authUrl}?${params.toString()}`;
    }
    
    async handleGithubCallback(code) {
        try {
            // In production, this should be done on your backend
            // Frontend should never expose client secret
            const response = await fetch('/api/auth/github', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.authenticateUser({
                    provider: 'github',
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    username: data.user.login,
                    picture: data.user.avatar_url,
                    token: data.access_token
                });
            } else {
                this.showToast('Error al autenticar con GitHub', 'error');
                this.hideLoading();
            }
        } catch (error) {
            console.error('GitHub auth error:', error);
            this.showToast('Error de conexión', 'error');
            this.hideLoading();
        }
    }
    
    // ============================================
    // Email/Password Authentication
    // ============================================
    
    async handleEmailLogin(email, password, rememberMe) {
        this.showLoading();
        
        try {
            // In production, this should call your backend API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, rememberMe })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.authenticateUser({
                    provider: 'email',
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    picture: data.user.picture,
                    token: data.token
                });
            } else {
                this.showToast(data.message || 'Credenciales inválidas', 'error');
                this.hideLoading();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Error de conexión', 'error');
            this.hideLoading();
        }
    }
    
    async handleEmailRegister(name, email, password) {
        this.showLoading();
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Cuenta creada exitosamente', 'success');
                setTimeout(() => {
                    this.closeRegisterModal();
                    this.hideLoading();
                }, 1500);
            } else {
                this.showToast(data.message || 'Error al crear cuenta', 'error');
                this.hideLoading();
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showToast('Error de conexión', 'error');
            this.hideLoading();
        }
    }
    
    // ============================================
    // Authentication Helpers
    // ============================================
    
    authenticateUser(userData) {
        this.currentUser = userData;
        this.authProvider = userData.provider;
        
        // Store in localStorage or sessionStorage
        localStorage.setItem('studio_pro_user', JSON.stringify(userData));
        localStorage.setItem('studio_pro_token', userData.token);
        
        this.showToast(`Bienvenido, ${userData.name}!`, 'success');
        
        // Redirect to editor
        setTimeout(() => {
            window.location.href = '/editor.html';
        }, 1500);
    }
    
    logout() {
        this.currentUser = null;
        this.authProvider = null;
        
        localStorage.removeItem('studio_pro_user');
        localStorage.removeItem('studio_pro_token');
        
        // Revoke Google session if applicable
        if (typeof google !== 'undefined') {
            google.accounts.id.disableAutoSelect();
        }
        
        this.showToast('Sesión cerrada', 'success');
        
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
    }
    
    checkAuthState() {
        const savedUser = localStorage.getItem('studio_pro_user');
        const savedToken = localStorage.getItem('studio_pro_token');
        
        if (savedUser && savedToken) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.authProvider = this.currentUser.provider;
                
                // Validate token with backend
                this.validateToken(savedToken);
            } catch (error) {
                console.error('Auth state error:', error);
                this.logout();
            }
        }
        
        // Check for OAuth callbacks
        this.handleOAuthCallback();
    }
    
    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (code && state) {
            // Verify state to prevent CSRF
            const savedState = sessionStorage.getItem('oauth_state');
            if (state === savedState) {
                // Determine provider from URL
                if (window.location.pathname.includes('github')) {
                    this.handleGithubCallback(code);
                }
            }
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Check for hash fragments (Google OAuth)
        if (window.location.hash) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get('access_token');
            
            if (accessToken) {
                this.handleGoogleTokenResponse(accessToken);
                window.location.hash = '';
            }
        }
    }
    
    async handleGoogleTokenResponse(accessToken) {
        this.showLoading();
        
        try {
            // Get user info from Google
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            const userInfo = await response.json();
            
            this.authenticateUser({
                provider: 'google',
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                token: accessToken
            });
        } catch (error) {
            console.error('Google token error:', error);
            this.showToast('Error al autenticar con Google', 'error');
            this.hideLoading();
        }
    }
    
    async validateToken(token) {
        try {
            const response = await fetch('/api/auth/validate', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                this.logout();
            }
        } catch (error) {
            console.error('Token validation error:', error);
        }
    }
    
    // ============================================
    // Utility Functions
    // ============================================
    
    generateState() {
        const state = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('oauth_state', state);
        return state;
    }
    
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('JWT parse error:', error);
            return null;
        }
    }
    
    // ============================================
    // UI Functions
    // ============================================
    
    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }
    
    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
    
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const content = toast.querySelector('.toast-content');
        
        content.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    showRegisterModal() {
        document.getElementById('registerModal').classList.add('active');
    }
    
    closeRegisterModal() {
        document.getElementById('registerModal').classList.remove('active');
    }
    
    // ============================================
    // Event Listeners
    // ============================================
    
    attachEventListeners() {
        // Google Login
        document.getElementById('googleLogin')?.addEventListener('click', () => {
            this.handleGoogleLogin();
        });
        
        // GitHub Login
        document.getElementById('githubLogin')?.addEventListener('click', () => {
            this.handleGithubLogin();
        });
        
        // Email Login Form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            this.handleEmailLogin(email, password, rememberMe);
        });
        
        // Register Modal
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
        });
        
        document.getElementById('closeRegister')?.addEventListener('click', () => {
            this.closeRegisterModal();
        });
        
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeRegisterModal();
        });
        
        // Register Form
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                this.showToast('Las contraseñas no coinciden', 'error');
                return;
            }
            
            this.handleEmailRegister(name, email, password);
        });
        
        // Close modal on background click
        document.getElementById('registerModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'registerModal') {
                this.closeRegisterModal();
            }
        });
    }
}

// Initialize Authentication Manager
const authManager = new AuthManager();

// Export for use in other modules
window.authManager = authManager;

console.log('🔐 Studio Pro Authentication System Initialized');
console.log('📝 Note: Configure OAuth credentials in config object');
