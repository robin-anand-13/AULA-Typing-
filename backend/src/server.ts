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
