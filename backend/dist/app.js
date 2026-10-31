import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { apiRouter } from './modules/typing/typing.routes.js';
import { errorHandler } from './common/middleware/errorHandler.js';
export function createApp() {
    const app = express();
    // Basic security and parsing
    app.use(helmet({
        contentSecurityPolicy: false // Allow Three.js canvas & dev setups
    }));
    app.use(cors({
        origin: config.corsOrigin,
        credentials: true
    }));
    app.use(express.json({ limit: '1mb' }));
    // Operational health checks
    app.get('/health/live', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.get('/health/ready', (req, res) => {
        res.json({
            status: 'ready',
            version: config.scoringVersion,
            environment: config.nodeEnv
        });
    });
    // REST API v1
    app.use('/api/v1', apiRouter);
    // Error handling middleware
    app.use(errorHandler);
    return app;
}
