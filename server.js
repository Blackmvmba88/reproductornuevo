// ============================================
// Studio Pro - Authentication Backend Server
// Node.js + Express + MongoDB
// ============================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// ============================================
// Database Connection
// ============================================

mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/studiopro', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// User Model
// ============================================

const userSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: ['email', 'google', 'github'],
        required: true
    },
    providerId: String,
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    name: String,
    username: String,
    picture: String,
    password: String,
    subscription: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    projects: [{
        name: String,
        data: Object,
        createdAt: Date,
        updatedAt: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date
});

const User = mongoose.model('User', userSchema);

// ============================================
// Helper Functions
// ============================================

async function createOrUpdateUser(userData) {
    try {
        let user = await User.findOne({ 
            provider: userData.provider,
            providerId: userData.providerId 
        });
        
        if (user) {
            user.name = userData.name || user.name;
            user.picture = userData.picture || user.picture;
            user.lastLogin = new Date();
            await user.save();
        } else {
            user = new User({
                ...userData,
                lastLogin: new Date()
            });
            await user.save();
        }
        
        return user;
    } catch (error) {
        throw error;
    }
}

async function findUserByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
}

async function verifyUserCredentials(email, password) {
    const user = await findUserByEmail(email);
    if (!user || user.provider !== 'email') {
        return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
}

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

function generateToken(userId, provider) {
    return jwt.sign(
        { userId, provider },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.sendStatus(401);
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.userId = decoded.userId;
        req.provider = decoded.provider;
        next();
    });
}

// ============================================
// Authentication Routes
// ============================================

// GitHub OAuth
app.post('/api/auth/github', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Code required' 
            });
        }
        
        // Exchange code for access token
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code
            },
            {
                headers: { Accept: 'application/json' }
            }
        );
        
        const accessToken = tokenResponse.data.access_token;
        
        if (!accessToken) {
            return res.status(400).json({ 
                success: false, 
                message: 'Failed to get access token' 
            });
        }
        
        // Get user info
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });
        
        const githubUser = userResponse.data;
        
        // Get user email if not public
        if (!githubUser.email) {
            const emailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `token ${accessToken}` }
            });
            const primaryEmail = emailResponse.data.find(e => e.primary && e.verified);
            githubUser.email = primaryEmail ? primaryEmail.email : null;
        }
        
        if (!githubUser.email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email required. Please make your email public on GitHub.' 
            });
        }
        
        // Create or update user
        const user = await createOrUpdateUser({
            provider: 'github',
            providerId: String(githubUser.id),
            email: githubUser.email,
            name: githubUser.name || githubUser.login,
            username: githubUser.login,
            picture: githubUser.avatar_url
        });
        
        // Generate JWT
        const token = generateToken(user._id, 'github');
        
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                picture: user.picture,
                subscription: user.subscription
            },
            access_token: token
        });
    } catch (error) {
        console.error('GitHub auth error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Authentication failed',
            error: error.message
        });
    }
});

// Google OAuth (verify token from frontend)
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        
        // Verify Google token
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
        );
        
        const googleUser = response.data;
        
        // Create or update user
        const user = await createOrUpdateUser({
            provider: 'google',
            providerId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture
        });
        
        // Generate JWT
        const jwtToken = generateToken(user._id, 'google');
        
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                subscription: user.subscription
            },
            access_token: jwtToken
        });
    } catch (error) {
        console.error('Google auth error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Authentication failed' 
        });
    }
});

// Email/Password Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email y contraseña requeridos' 
            });
        }
        
        const user = await verifyUserCredentials(email, password);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales inválidas' 
            });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate JWT
        const expiresIn = rememberMe ? '30d' : '7d';
        const token = jwt.sign(
            { userId: user._id, provider: 'email' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn }
        );
        
        res.json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                subscription: user.subscription
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error de servidor' 
        });
    }
});

// Email/Password Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos los campos son requeridos' 
            });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: 'La contraseña debe tener al menos 8 caracteres' 
            });
        }
        
        // Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'El email ya está registrado' 
            });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create user
        const user = new User({
            provider: 'email',
            email: email.toLowerCase(),
            name,
            password: hashedPassword
        });
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Cuenta creada exitosamente'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al crear cuenta' 
        });
    }
});

// Validate Token
app.get('/api/auth/validate', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.sendStatus(404);
        }
        
        res.json({ 
            success: true, 
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                subscription: user.subscription
            }
        });
    } catch (error) {
        res.sendStatus(500);
    }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                provider: user.provider,
                email: user.email,
                name: user.name,
                username: user.username,
                picture: user.picture,
                subscription: user.subscription,
                projectCount: user.projects.length,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error de servidor' 
        });
    }
});

// ============================================
// Project Management Routes
// ============================================

// Save Project
app.post('/api/projects/save', authenticateToken, async (req, res) => {
    try {
        const { projectId, name, data } = req.body;
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }
        
        if (projectId) {
            // Update existing project
            const project = user.projects.id(projectId);
            if (project) {
                project.name = name;
                project.data = data;
                project.updatedAt = new Date();
            }
        } else {
            // Create new project
            user.projects.push({
                name,
                data,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Proyecto guardado',
            projectId: user.projects[user.projects.length - 1]._id
        });
    } catch (error) {
        console.error('Save project error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al guardar proyecto' 
        });
    }
});

// Get Projects
app.get('/api/projects', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('projects');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            });
        }
        
        res.json({
            success: true,
            projects: user.projects.map(p => ({
                id: p._id,
                name: p.name,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            }))
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener proyectos' 
        });
    }
});

// ============================================
// Health Check
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'Studio Pro Auth API'
    });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log(`\n🎬 Studio Pro Auth Server`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔐 OAuth endpoints ready`);
    console.log(`\n⚠️  Remember to configure OAuth credentials in .env`);
});
