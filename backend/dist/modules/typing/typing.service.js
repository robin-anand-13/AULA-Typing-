import crypto from 'crypto';
import { SEED_PASSAGES } from '../passages/passages.data.js';
import { calculateTypingScore } from './scoring.engine.js';
import { TypingResultModel } from '../../database/models/TypingResult.model.js';
import { isDbConnected } from '../../config/database.js';
import { NotFoundError, ConflictError, ValidationError } from '../../common/errors/AppError.js';
// In-memory sessions & backup repository
const activeSessions = new Map();
const inMemoryResults = [];
export class TypingService {
    static createSession(visitorId, options) {
        const { passageId, customPassage, mode = 'standard', duration = 60 } = options;
        let passage;
        if (customPassage) {
            passage = customPassage;
        }
        else if (passageId) {
            passage = SEED_PASSAGES.find(p => p.id === passageId);
        }
        if (!passage) {
            const randomIndex = Math.floor(Math.random() * SEED_PASSAGES.length);
            passage = SEED_PASSAGES[randomIndex];
        }
        const sessionId = `sess_${crypto.randomUUID()}`;
        const now = Date.now();
        const expiresAt = now + (duration + 60) * 1000; // grace period of 60 seconds
        const session = {
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
    static startSession(sessionId, visitorId) {
        const session = activeSessions.get(sessionId);
        if (!session)
            throw new NotFoundError('Typing session not found or expired');
        if (session.visitorId !== visitorId)
            throw new ValidationError('Session ownership mismatch');
        if (session.status !== 'ready')
            throw new ConflictError(`Session cannot be started from status: ${session.status}`);
        session.status = 'active';
        session.serverStartTime = Date.now();
        return session;
    }
    static async completeSession(sessionId, visitorId, payload) {
        const session = activeSessions.get(sessionId);
        if (!session)
            throw new NotFoundError('Typing session not found or expired');
        if (session.visitorId !== visitorId)
            throw new ValidationError('Session ownership mismatch');
        if (session.status === 'completed')
            throw new ConflictError('Session already finalized');
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
            }
            catch (err) {
                console.error('Failed to persist to MongoDB, falling back to memory store:', err);
                inMemoryResults.unshift({ ...resultPayload, createdAt: new Date() });
            }
        }
        else {
            inMemoryResults.unshift({ ...resultPayload, createdAt: new Date() });
        }
        return {
            ...score,
            resultId,
            passageTitle: session.passage.title
        };
    }
    static async getHistory(visitorId, limit = 20) {
        if (isDbConnected()) {
            try {
                const docs = await TypingResultModel.find({ visitorId }).sort({ createdAt: -1 }).limit(limit).lean();
                return docs;
            }
            catch (err) {
                console.warn('MongoDB query failed, using in-memory store:', err);
            }
        }
        return inMemoryResults.filter(r => r.visitorId === visitorId).slice(0, limit);
    }
    static async getAnalyticsSummary(visitorId) {
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
            if (item.netWpm > maxWpm)
                maxWpm = item.netWpm;
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
