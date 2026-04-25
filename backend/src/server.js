/**
 * server.js — Express + Socket.IO Application Entry Point
 * Employment Potential Evaluator API
 */

require('dotenv').config();
const express     = require('express');
const http        = require('http');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const { Server }  = require('socket.io');

// DB connections
const connectMongo    = require('./config/db.mongo');
const { prisma }      = require('./config/db.postgres');

// Routes
const authRoutes      = require('./routes/auth.routes');
const predictRoutes   = require('./routes/predict.routes');
const historyRoutes   = require('./routes/history.routes');

// Middleware
const errorMiddleware = require('./middleware/error.middleware');
const rateLimiter     = require('./middleware/ratelimit.middleware');

// Socket handlers
const initSockets     = require('./sockets/prediction.socket');

// ─── App Setup ─────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

// ─── Core Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimiter);

// ─── Attach io to requests ────────────────────────────────────
app.use((req, _res, next) => {
    req.io = io;
    next();
});

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/v1/auth',    authRoutes);
app.use('/api/v1/predict', predictRoutes);
app.use('/api/v1/history', historyRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────
app.use(errorMiddleware);

// ─── Socket.IO ────────────────────────────────────────────────
initSockets(io);

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        await connectMongo();
        await prisma.$connect();
        console.log('✅ PostgreSQL (Prisma) connected');
        
        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 Socket.IO active`);
        });
    } catch (err) {
        console.error('❌ Startup error:', err.message);
        process.exit(1);
    }
}

startServer();

process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    server.close(() => process.exit(0));
});

module.exports = { app, io };
