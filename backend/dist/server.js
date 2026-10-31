import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
async function bootstrap() {
    await connectDatabase();
    const app = createApp();
    app.listen(config.port, () => {
        console.log(`Typing Speed Test Backend running on http://localhost:${config.port}`);
        console.log(`Environment: ${config.nodeEnv} | Scoring Engine: v${config.scoringVersion}`);
    });
}
bootstrap().catch(err => {
    console.error('Fatal startup error:', err);
    process.exit(1);
});
const cors = require('cors'); // Add this at the top

const express = require('express');
const app = express();

// Add this block BEFORE your routes
app.use(cors({
    origin: [
        'http://localhost:5173', // Allows local testing
        'https://aula-typing-iota.vercel.app', // Your specific Vercel URL
        'https://aula-typing-2aw24lare-g13-da4a.vercel.app' // Your other Vercel URL (just in case)
    ], 
    credentials: true
}));

// ... the rest of your app routes continue below
