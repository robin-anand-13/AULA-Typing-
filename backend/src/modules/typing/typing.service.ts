import crypto from 'crypto';
import { SEED_PASSAGES, Passage } from '../passages/passages.data.js';
import { calculateTypingScore, ScoringResult, TraceEvent } from './scoring.engine.js';
import { TypingResultModel, ITypingResult } from '../../database/models/TypingResult.model.js';
import { isDbConnected } from '../../config/database.js';
import { NotFoundError, ConflictError, ValidationError } from '../../common/errors/AppError.js';

export interface TypingSession {
  sessionId: string;
  visitorId: string;
  passageId: string;
  passage: Passage;
  mode: string;
  targetDurationSeconds: number;
  status: 'ready' | 'active' | 'completed' | 'abandoned';
  serverStartTime?: number;
  serverEndTime?: number;
  expiresAt: number;
}

// In-memory sessions & backup repository
const activeSessions = new Map<string, TypingSession>();
const inMemoryResults: ITypingResult[] = [];

export class TypingService {
  public static createSession(visitorId: string, options: { passageId?: string; customPassage?: Passage; mode?: string; duration?: number }): TypingSession {
    const { passageId, customPassage, mode = 'standard', duration = 60 } = options;
    
    let passage: Passage | undefined;
    if (customPassage) {
      passage = customPassage;
    } else if (passageId) {
      passage = SEED_PASSAGES.find(p => p.id === passageId);
    }
    if (!passage) {
      const randomIndex = Math.floor(Math.random() * SEED_PASSAGES.length);
      passage = SEED_PASSAGES[randomIndex];
    }

    const sessionId = `sess_${crypto.randomUUID()}`;
    const now = Date.now();
    const expiresAt = now + (duration + 60) * 1000; // grace period of 60 seconds

    const session: TypingSession = {
      sessionId,
      visitorId,
      passageId: passage.id,
      passage,
      mode,
      targetDurationSeconds: duration,
      status: 'ready',
      expiresAt
    };

    activeSessions.set(sessionId, session);
    return session;
  }

  public static startSession(sessionId: string, visitorId: string): TypingSession {
    const session = activeSessions.get(sessionId);
    if (!session) throw new NotFoundError('Typing session not found or expired');
    if (session.visitorId !== visitorId) throw new ValidationError('Session ownership mismatch');
    if (session.status !== 'ready') throw new ConflictError(`Session cannot be started from status: ${session.status}`);

    session.status = 'active';
    session.serverStartTime = Date.now();
    return session;
  }

  public static async completeSession(
    sessionId: string,
    visitorId: string,
    payload: { typedText: string; events?: TraceEvent[] }
  ): Promise<ScoringResult & { resultId: string; passageTitle: string }> {
    const session = activeSessions.get(sessionId);
    if (!session) throw new NotFoundError('Typing session not found or expired');
    if (session.visitorId !== visitorId) throw new ValidationError('Session ownership mismatch');
    if (session.status === 'completed') throw new ConflictError('Session already finalized');

    const now = Date.now();
    session.serverEndTime = now;
    const serverDurationMs = session.serverStartTime ? Math.max(1, now - session.serverStartTime) : session.targetDurationSeconds * 1000;

    // Run authoritative scoring engine
    const score = calculateTypingScore({
      targetPassage: session.passage.text,
      typedText: payload.typedText,
      durationMs: serverDurationMs,
      events: payload.events
    });

    session.status = 'completed';

    // Persist result
    const resultPayload = {
      sessionId: session.sessionId,
      visitorId: session.visitorId,
      passageId: session.passage.id,
      passageTitle: session.passage.title,
      grossWpm: score.grossWpm,
      netWpm: score.netWpm,
      accuracy: score.accuracy,
      keystrokeAccuracy: score.keystrokeAccuracy,
      correctChars: score.correctChars,
      incorrectChars: score.incorrectChars,
      totalInsertions: score.totalInsertions,
      corrections: score.corrections,
      durationSeconds: score.elapsedSeconds,
      benchmarkEligible: score.benchmarkEligible,
      scoringVersion: score.scoringVersion,
      intervalData: score.intervalData
    };

    let resultId = session.sessionId;

    if (isDbConnected()) {
      try {
        const savedDoc = await TypingResultModel.create(resultPayload);
        resultId = savedDoc._id.toString();
      } catch (err) {
        console.error('Failed to persist to MongoDB, falling back to memory store:', err);
        inMemoryResults.unshift({ ...resultPayload, createdAt: new Date() } as unknown as ITypingResult);
      }
    } else {
      inMemoryResults.unshift({ ...resultPayload, createdAt: new Date() } as unknown as ITypingResult);
    }

    return {
      ...score,
      resultId,
      passageTitle: session.passage.title
    };
  }

  public static async getHistory(visitorId: string, limit = 20): Promise<any[]> {
    if (isDbConnected()) {
      try {
        const docs = await TypingResultModel.find({ visitorId }).sort({ createdAt: -1 }).limit(limit).lean();
        return docs;
      } catch (err) {
        console.warn('MongoDB query failed, using in-memory store:', err);
      }
    }
    return inMemoryResults.filter(r => r.visitorId === visitorId).slice(0, limit);
  }

  public static async getAnalyticsSummary(visitorId: string) {
    const history = await this.getHistory(visitorId, 100);
    if (history.length === 0) {
      return {
        totalTests: 0,
        bestWpm: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        totalTimeSeconds: 0
      };
    }

    const totalTests = history.length;
    let sumWpm = 0;
    let maxWpm = 0;
    let sumAccuracy = 0;
    let totalTime = 0;

    for (const item of history) {
      sumWpm += item.netWpm;
      if (item.netWpm > maxWpm) maxWpm = item.netWpm;
      sumAccuracy += item.accuracy;
      totalTime += item.durationSeconds || 0;
    }

    return {
      totalTests,
      bestWpm: Math.round(maxWpm * 10) / 10,
      averageWpm: Math.round((sumWpm / totalTests) * 10) / 10,
      averageAccuracy: Math.round((sumAccuracy / totalTests) * 10) / 10,
      totalTimeSeconds: totalTime
    };
  }
}
