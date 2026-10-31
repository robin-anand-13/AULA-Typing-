import mongoose, { Schema } from 'mongoose';
const TypingResultSchema = new Schema({
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorId: { type: String, required: true, index: true },
    passageId: { type: String, required: true },
    passageTitle: { type: String, default: 'Typing Test' },
    grossWpm: { type: Number, required: true },
    netWpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    keystrokeAccuracy: { type: Number, required: true },
    correctChars: { type: Number, required: true },
    incorrectChars: { type: Number, required: true },
    totalInsertions: { type: Number, required: true },
    corrections: { type: Number, default: 0 },
    durationSeconds: { type: Number, required: true },
    benchmarkEligible: { type: Boolean, default: true },
    scoringVersion: { type: String, default: '1.0' },
    intervalData: [
        {
            second: Number,
            wpm: Number,
            accuracy: Number
        }
    ]
}, {
    timestamps: true
});
export const TypingResultModel = mongoose.model('TypingResult', TypingResultSchema);
