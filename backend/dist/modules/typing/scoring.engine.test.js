import { describe, it, expect } from 'vitest';
import { calculateTypingScore } from './scoring.engine.js';
describe('Authoritative Scoring Engine v1.0', () => {
    it('calculates 100% accuracy and accurate Net/Gross WPM for perfect typing', () => {
        const passage = 'The quick brown fox jumps over the lazy dog.';
        const typed = 'The quick brown fox jumps over the lazy dog.'; // 44 chars
        const durationMs = 60000; // 1 minute
        const result = calculateTypingScore({
            targetPassage: passage,
            typedText: typed,
            durationMs
        });
        expect(result.scoringVersion).toBe('1.0');
        expect(result.accuracy).toBe(100);
        expect(result.correctChars).toBe(44);
        expect(result.incorrectChars).toBe(0);
        // 44 / 5 = 8.8 WPM
        expect(result.netWpm).toBe(8.8);
        expect(result.grossWpm).toBe(8.8);
        expect(result.benchmarkEligible).toBe(true);
    });
    it('handles empty input gracefully without division by zero', () => {
        const result = calculateTypingScore({
            targetPassage: 'Hello world',
            typedText: '',
            durationMs: 0
        });
        expect(result.netWpm).toBe(0);
        expect(result.grossWpm).toBe(0);
        expect(result.accuracy).toBe(0);
        expect(result.benchmarkEligible).toBe(false);
    });
    it('correctly tracks errors and differentiates gross vs net WPM', () => {
        const passage = 'abcdefghij'; // 10 chars
        const typed = 'abcde12345'; // 5 correct, 5 wrong
        const durationMs = 30000; // 0.5 minute
        const result = calculateTypingScore({
            targetPassage: passage,
            typedText: typed,
            durationMs
        });
        // 10 insertions / 5 / 0.5 = 4 WPM Gross
        // 5 correct / 5 / 0.5 = 2 WPM Net
        expect(result.grossWpm).toBe(4);
        expect(result.netWpm).toBe(2);
        expect(result.accuracy).toBe(50);
        expect(result.correctChars).toBe(5);
        expect(result.incorrectChars).toBe(5);
    });
    it('respects benchmark eligibility rules (<10s is ineligible)', () => {
        const result = calculateTypingScore({
            targetPassage: 'Quick test',
            typedText: 'Quick test',
            durationMs: 5000 // 5 seconds
        });
        expect(result.benchmarkEligible).toBe(false);
    });
});
