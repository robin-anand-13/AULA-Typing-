import mongoose, { Schema, Document } from 'mongoose';

export interface ITypingResult extends Document {
  sessionId: string;
  visitorId: string;
  passageId: string;
  passageTitle: string;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  keystrokeAccuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalInsertions: number;
  corrections: number;
  durationSeconds: number;
  benchmarkEligible: boolean;
  scoringVersion: string;
  intervalData: Array<{ second: number; wpm: number; accuracy: number }>;
  createdAt: Date;
}

const TypingResultSchema = new Schema<ITypingResult>(
  {
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
  },
  {
    timestamps: true
  }
);

export const TypingResultModel = mongoose.model<ITypingResult>('TypingResult', TypingResultSchema);
