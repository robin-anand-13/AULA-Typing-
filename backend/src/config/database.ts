import mongoose from 'mongoose';
import { config } from './index.js';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  try {
    if (isConnected) return true;
    
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500
    });
    
    isConnected = true;
    console.log('MongoDB connected successfully to', config.mongoUri);
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed or skipped. Running with in-memory persistence fallback:', (error as Error).message);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function disconnectDatabase(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
