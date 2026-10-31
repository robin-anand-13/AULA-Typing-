import { Router, Request, Response, NextFunction } from 'express';
import { TypingService } from './typing.service.js';
import { SEED_PASSAGES } from '../passages/passages.data.js';
import { AiService } from '../../integrations/ai/ai.service.js';
import { ValidationError } from '../../common/errors/AppError.js';

export const apiRouter = Router();

// Helper to extract visitorId
function getVisitorId(req: Request): string {
  const visitorId = (req.headers['x-visitor-id'] as string) || (req.query.visitorId as string);
  if (!visitorId) {
    throw new ValidationError('Missing required X-Visitor-Id header or visitorId parameter');
  }
  return visitorId;
}

// 1. Passages list, detail & dynamic AI generation
apiRouter.get('/passages', async (req: Request, res: Response) => {
  const { category, difficulty, ai } = req.query;

  // If user requests a dynamic AI generated sentence on reload/refresh
  if (ai === 'true' || ai === '1') {
    try {
      const dynamicPassage = await AiService.generateDynamicPassage(
        (category as string) || 'general',
        (difficulty as string) || 'medium'
      );
      res.json({ success: true, count: 1, data: [dynamicPassage] });
      return;
    } catch (e) {
      console.warn('AI passage generation error, serving seeded passages:', e);
    }
  }

  let results = SEED_PASSAGES;
  if (category && category !== 'all') results = results.filter(p => p.category === category);
  if (difficulty && difficulty !== 'all') results = results.filter(p => p.difficulty === difficulty);
  res.json({ success: true, count: results.length, data: results });
});

apiRouter.get('/passages/random-gemini', async (req: Request, res: Response) => {
  try {
    const { category = 'general', difficulty = 'medium' } = req.query;
    const dynamicPassage = await AiService.generateDynamicPassage(category as string, difficulty as string);
    res.json({ success: true, data: dynamicPassage });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/passages/:id', (req: Request, res: Response) => {
  const passage = SEED_PASSAGES.find(p => p.id === req.params.id);
  if (!passage) {
    res.status(404).json({ success: false, error: 'Passage not found' });
    return;
  }
  res.json({ success: true, data: passage });
});

// 2. Typing Sessions
apiRouter.post('/typing/sessions', (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitorId = getVisitorId(req);
    const { passageId, customPassage, mode, duration } = req.body || {};
    const session = TypingService.createSession(visitorId, { passageId, customPassage, mode, duration });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/typing/sessions/:sessionId/start', (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitorId = getVisitorId(req);
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
    const session = TypingService.startSession(sessionId, visitorId);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/typing/sessions/:sessionId/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitorId = getVisitorId(req);
    const sessionId = Array.isArray(req.params.sessionId) ? req.params.sessionId[0] : req.params.sessionId;
    const { typedText = '', events = [] } = req.body || {};
    const result = await TypingService.completeSession(sessionId, visitorId, { typedText, events });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// 3. History and Analytics
apiRouter.get('/typing/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitorId = getVisitorId(req);
    const history = await TypingService.getHistory(visitorId);
    res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    next(err);
  }
});

apiRouter.get('/analytics/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const visitorId = getVisitorId(req);
    const summary = await TypingService.getAnalyticsSummary(visitorId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// 4. Gemini / Deterministic AI Coaching
apiRouter.post('/ai/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { netWpm = 0, grossWpm = 0, accuracy = 0, durationSeconds = 60, passageCategory = 'general' } = req.body || {};
    const feedback = await AiService.generateFeedback({ netWpm, grossWpm, accuracy, durationSeconds, passageCategory });
    res.json({ success: true, data: feedback });
  } catch (err) {
    next(err);
  }
});
