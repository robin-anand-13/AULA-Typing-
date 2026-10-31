import { config } from '../../config/index.js';
import { fileURLToPath } from 'url';
// Memory cache to prevent repeating passages
import * as fs from 'fs';
import * as path from 'path';
// Path to persistent storage for generated passages
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = path.resolve(__dirname, '../../../data/passage-history.json');
// Load existing history if file exists
const generatedPassageHistory = (() => {
    try {
        if (fs.existsSync(HISTORY_FILE)) {
            const data = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
            return new Set(data);
        }
    }
    catch (e) {
        console.warn('Failed to load passage history:', e);
    }
    return new Set();
})();
// Helper to persist history after adding a new passage
function persistHistory() {
    try {
        const dir = path.dirname(HISTORY_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(Array.from(generatedPassageHistory)), 'utf-8');
    }
    catch (e) {
        console.warn('Failed to persist passage history:', e);
    }
}
const CATEGORY_PROMPTS = {
    general: 'Generate a captivating, natural English paragraph about technology, nature, flow, or human curiosity. (25-35 words).',
    code: 'Generate a clean, realistic snippet of code in JavaScript, TypeScript, or Python (4 to 6 lines). Include operators, brackets {}, (), semicolons, and indentation. Return ONLY the raw code text, no markdown backticks, no quotes.',
    punctuation: 'Generate an expressive literary sentence filled with rich punctuation: commas, em-dashes, semicolons, quotation marks, question marks, and colons. (25-35 words). Return ONLY the sentence.',
    numbers: 'Generate a realistic data-entry report scenario containing currency figures, dates, percentages, IDs, and quantities (e.g., Q3 revenue $48,210, growth +14.2%, order #9842 on 12/04/2026). (25-35 words). Return ONLY the text.'
};
const CATEGORY_FALLBACKS = {
    general: [
        'Consistency in mechanical keystrokes is the bridge between chaotic thought and elegant code.',
        'Precision in finger placement unlocks effortless velocity without unnecessary typographical strain.',
        'The tactile actuation of every switch provides immediate kinetic feedback to calibrated muscle memory.'
    ],
    code: [
        'async function processSession(id) {\n  const res = await db.find({ id });\n  return res.map((item) => item.score * 1.5);\n}',
        'const calculateWpm = (chars, timeMs) => {\n  const mins = timeMs / 60000;\n  return Math.round((chars / 5) / mins);\n};',
        'export const handleKeypress = (event) => {\n  if (event.key === "Enter") submit();\n  return event.preventDefault();\n};'
    ],
    punctuation: [
        '"Wait!" she exclaimed, pausing briefly; "Could it be that simple?" Yes—undoubtedly, it was: precision, not haste, defines mastery.',
        'Notice the details: semicolons divide balanced clauses; commas breathe life into prose; and hyphens connect related thoughts—seamlessly!'
    ],
    numbers: [
        'Audit #9481 on 10/24/2026: Total revenue was $58,920.40 (+18.5%), operating costs totaled $24,100, and net profit reached 34.8% across 142 clients.',
        'Inventory update: SKU-4029 has 184 units at $29.99 each; batch #592 shipped on 08/15/2026 with a tracking weight of 42.6 kg.'
    ]
};
export class AiService {
    /**
     * Generates a scenario-specific typing passage using Google Gemini
     */
    static async generateDynamicPassage(category = 'general', difficulty = 'medium') {
        const timestamp = Date.now();
        let passageText = '';
        const catKey = CATEGORY_PROMPTS[category] ? category : 'general';
        const basePrompt = CATEGORY_PROMPTS[catKey];
        const systemPrompt = `${basePrompt} Difficulty level: ${difficulty}. Avoid cliches. Ensure it has never been generated before. Return ONLY the plain text without explanation.`;
        if (config.geminiApiKey) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${config.geminiApiKey}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt }] }],
                        generationConfig: {
                            temperature: 0.95,
                            maxOutputTokens: 140
                        }
                    })
                });
                if (response.ok) {
                    const data = (await response.json());
                    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
                    if (raw) {
                        // Strip any wrapping markdown code blocks if generated
                        raw = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
                        if (raw.length > 15 && !generatedPassageHistory.has(raw)) {
                            passageText = raw;
                            generatedPassageHistory.add(passageText);
                            persistHistory();
                            persistHistory();
                            persistHistory();
                            persistHistory();
                        }
                    }
                }
            }
            catch (err) {
                console.warn('Gemini dynamic scenario generation error:', err);
            }
        }
        // Category-specific fallback if Gemini is offline
        if (!passageText) {
            const pool = CATEGORY_FALLBACKS[catKey] || CATEGORY_FALLBACKS.general;
            const unused = pool.filter(p => !generatedPassageHistory.has(p));
            passageText = (unused.length > 0 ? unused : pool)[Math.floor(Math.random() * pool.length)];
            generatedPassageHistory.add(passageText);
            persistHistory();
            persistHistory();
            persistHistory();
            persistHistory();
        }
        return {
            id: `gemini_pass_${timestamp}`,
            title: `Gemini AI: ${catKey.toUpperCase()} Scenario`,
            text: passageText,
            language: 'en',
            category: catKey,
            difficulty: difficulty,
            supportedModes: ['standard', 'time', 'words', 'practice'],
            benchmarkEligible: true
        };
    }
    /**
     * Diagnostic feedback using Gemini
     */
    static async generateFeedback(input) {
        const { netWpm, accuracy, durationSeconds, passageCategory = 'general' } = input;
        const strengths = [];
        const improvements = [];
        const drills = [];
        if (accuracy >= 98) {
            strengths.push('Exceptional precision and minimal error rate.');
        }
        else if (accuracy >= 92) {
            strengths.push('Solid baseline accuracy with good typographical control.');
        }
        else {
            improvements.push('Focus on reducing typos by pacing keystrokes deliberately.');
            drills.push('Punctuation and precision drills with strict accuracy focus.');
        }
        if (netWpm >= 70) {
            strengths.push('High-speed velocity suitable for competitive and professional demands.');
        }
        else if (netWpm >= 45) {
            strengths.push('Steady typing cadence above typical conversational thresholds.');
            improvements.push('Work on finger dexterity on high-frequency bigrams to break the 60+ WPM ceiling.');
            drills.push('Common English bigrams and trigram endurance sets.');
        }
        else {
            improvements.push('Develop muscle memory for home row transitions.');
            drills.push('Top 200 common words drill (2-minute sets).');
        }
        if (passageCategory === 'code' || passageCategory === 'punctuation') {
            drills.push('Special characters, brackets, and code indentation exercises.');
        }
        let coachSummary = `Great attempt! At ${netWpm} WPM and ${accuracy}% accuracy across ${durationSeconds}s in the ${passageCategory} scenario, you demonstrated solid mechanical cadence.`;
        if (config.geminiApiKey) {
            try {
                const prompt = `Act as an expert typing coach. A typist completed a test with Net WPM: ${netWpm}, Gross WPM: ${input.grossWpm}, Accuracy: ${accuracy}%, Duration: ${durationSeconds}s in category '${passageCategory}'. Provide encouraging, concise bullet points: key strengths, areas for improvement, and a suggested practice drill.`;
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${config.geminiApiKey}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 250 }
                    })
                });
                if (response.ok) {
                    const data = (await response.json());
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        coachSummary = text;
                        return {
                            strengths,
                            areasForImprovement: improvements,
                            recommendedDrills: drills,
                            coachSummary,
                            source: 'gemini'
                        };
                    }
                }
            }
            catch (err) {
                console.warn('Gemini coaching failed, using fallback:', err);
            }
        }
        return {
            strengths,
            areasForImprovement: improvements,
            recommendedDrills: drills,
            coachSummary,
            source: 'rule_based_fallback'
        };
    }
}
