import mongoose from 'mongoose';
import { config } from './index.js';
let isConnected = false;
export async function connectDatabase() {
    try {
        if (isConnected)
            return true;
        mongoose.set('strictQuery', true);
        await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 2500
        });
        isConnected = true;
        console.log('MongoDB connected successfully to', config.mongoUri);
        return true;
    }
    catch (error) {
        console.warn('MongoDB connection failed or skipped. Running with in-memory persistence fallback:', error.message);
        isConnected = false;
        return false;
    }
}
export function isDbConnected() {
    return isConnected && mongoose.connection.readyState === 1;
}
export async function disconnectDatabase() {
    if (isConnected) {
        await mongoose.disconnect();
        isConnected = false;
    }
}
