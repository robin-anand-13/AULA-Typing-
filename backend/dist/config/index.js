import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/typing_db',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    scoringVersion: process.env.SCORING_VERSION || '1.0',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    sessionSecret: process.env.SESSION_SECRET || 'dev_secret_key_12345'
};
