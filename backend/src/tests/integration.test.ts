import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Typing API Integration Suite', () => {
  const app = createApp();
  const visitorId = 'test_visitor_uuid_123';

  it('GET /health/live returns ok', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/v1/passages returns seeded passages', async () => {
    const res = await request(app).get('/api/v1/passages');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('performs full session lifecycle: create -> start -> complete with authoritative scoring', async () => {
    // 1. Create session
    const createRes = await request(app)
      .post('/api/v1/typing/sessions')
      .set('x-visitor-id', visitorId)
      .send({ duration: 60 });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.sessionId).toBeDefined();
    const sessionId = createRes.body.data.sessionId;
    const passageText = createRes.body.data.passage.text;

    // 2. Start session
    const startRes = await request(app)
      .post(`/api/v1/typing/sessions/${sessionId}/start`)
      .set('x-visitor-id', visitorId);
    expect(startRes.status).toBe(200);
    expect(startRes.body.data.status).toBe('active');

    // 3. Complete session
    const completeRes = await request(app)
      .post(`/api/v1/typing/sessions/${sessionId}/complete`)
      .set('x-visitor-id', visitorId)
      .send({ typedText: passageText });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.accuracy).toBe(100);
    expect(completeRes.body.data.netWpm).toBeGreaterThan(0);

    // 4. Retrieve history
    const historyRes = await request(app)
      .get('/api/v1/typing/history')
      .set('x-visitor-id', visitorId);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.length).toBeGreaterThan(0);
    expect(historyRes.body.data[0].sessionId).toBe(sessionId);
  });

  it('POST /api/v1/ai/feedback yields deterministic coaching feedback', async () => {
    const res = await request(app)
      .post('/api/v1/ai/feedback')
      .send({ netWpm: 55, grossWpm: 60, accuracy: 95, durationSeconds: 60 });

    expect(res.status).toBe(200);
    expect(res.body.data.strengths.length).toBeGreaterThan(0);
    expect(res.body.data.coachSummary).toBeDefined();
  });
});
