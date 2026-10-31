export const SEED_PASSAGES = [
    {
        id: 'pass_gen_01',
        title: 'The Flow of Focus',
        text: 'Typing with precision is not merely about moving fingers rapidly across a surface; it is an active state of rhythm and flow. When the mind synchronizes with keystrokes, ideas translate seamlessly into language without friction or hesitation.',
        language: 'en',
        category: 'general',
        difficulty: 'easy',
        supportedModes: ['standard', 'time', 'words'],
        benchmarkEligible: true
    },
    {
        id: 'pass_gen_02',
        title: 'Digital Architecture',
        text: 'Modern software platforms are built on layered abstractions, from operating system kernels and hardware device drivers to distributed cloud microservices. Designing reliable systems requires balancing performance, maintainability, and clean interfaces.',
        language: 'en',
        category: 'general',
        difficulty: 'medium',
        supportedModes: ['standard', 'time', 'words'],
        benchmarkEligible: true
    },
    {
        id: 'pass_punc_01',
        title: 'Punctuation & Flow',
        text: 'Could you imagine, even for a moment, navigating complex prose without commas, semicolons; or deliberate pauses? "Punctuation," wrote the essayist, "is the breath of thought!" Always verify: punctuation marks define clarity.',
        language: 'en',
        category: 'punctuation',
        difficulty: 'medium',
        supportedModes: ['standard', 'practice'],
        benchmarkEligible: true
    },
    {
        id: 'pass_code_01',
        title: 'JavaScript Asynchronous Flow',
        text: 'async function fetchResults(sessionId: string): Promise<Result | null> {\n  try {\n    const response = await fetch(`/api/v1/sessions/${sessionId}`);\n    if (!response.ok) throw new Error("HTTP Error");\n    return await response.json();\n  } catch (err) {\n    console.error(err);\n    return null;\n  }\n}',
        language: 'en',
        category: 'code',
        difficulty: 'hard',
        supportedModes: ['standard', 'practice', 'code'],
        benchmarkEligible: true
    },
    {
        id: 'pass_num_01',
        title: 'Financial Metrics & Data Entry',
        text: 'Quarterly review report: Q1 revenue was $4,582,190 (up 14.8%), while operating expenses totaled $2,910,400. In Q2, fiscal projections estimate net yield at +22.5% with margins exceeding 31.4% across 89 distinct regional sectors.',
        language: 'en',
        category: 'numbers',
        difficulty: 'hard',
        supportedModes: ['standard', 'practice'],
        benchmarkEligible: true
    }
];
