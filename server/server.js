const express = require('express');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const env = require('./config/env');
const { startSchedulers } = require('./schedulers');
const errorHandler = require('./middleware/global/errorHandler');
const requestLogger = require('./middleware/global/requestLogger');
const corsMiddleware = require('./middleware/global/cors');
const { generalLimiter } = require('./middleware/global/rateLimiter');
const routes = require('./routes');

connectDB();
connectRedis();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(corsMiddleware);
app.use(generalLimiter);
app.use(requestLogger);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.json({
        success: true,
        service: 'FarmVexa API',
        version: '1.0.0',
        environment: env.nodeEnv,
        docs: `${env.apiUrl}/api`,
    });
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        service: 'FarmVexa API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            admin: '/api/admin',
            farm: '/api/farm',
            internal: '/api/internal',
            public: '/api/admin/public',
        },
    });
});

app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    const os = require('os');
    res.json({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        memory: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api', routes);
app.use(errorHandler);

const PORT = env.port;

const server = app.listen(PORT, () => {
    const blue = '\x1b[36m';
    const green = '\x1b[32m';
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';

    console.log(`
${blue}${bold}   ╔══════════════════════════════╗
   ║     🌾 FARMVEXA SERVER       ║
   ╚══════════════════════════════╝${reset}
${green}   Server │ ${PORT}
   Env    │ ${env.nodeEnv}
   API    │ ${env.apiUrl}
   Client │ ${env.clientUrl}
   Admin  │ ${env.adminUrl}
   AI     │ ${env.pythonAiUrl}${reset}
`);
});

const { initSocket } = require('./config/socket');
initSocket(server);

startSchedulers();

const shutdown = async (signal) => {
    console.log(`\n\x1b[33m🟡 ${signal} received. Shutting down...\x1b[0m`);

    const { stopSchedulers } = require('./schedulers');
    stopSchedulers();

    const mongoose = require('mongoose');
    await mongoose.connection.close();

    const { getRedis } = require('./config/redis');
    const redis = getRedis();
    if (redis) await redis.quit();

    server.close(() => {
        console.log('\x1b[32m🟢 Server closed. Goodbye!\x1b[0m');
        process.exit(0);
    });

    setTimeout(() => {
        console.log('\x1b[31m🔴 Forced shutdown\x1b[0m');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
    console.error(`\x1b[31m❌ Unhandled Rejection: ${err.message}\x1b[0m`);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error(`\x1b[31m❌ Uncaught Exception: ${err.message}\x1b[0m`);
    process.exit(1);
});