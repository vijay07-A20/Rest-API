import mongoose from 'mongoose';

class MemoryDatastore {
  constructor() {
    this.collections = {
      apiLogs: [],
      rateLimitRecords: new Map(),
      abuseAlerts: [],
      clientActivities: new Map(),
      systemSettings: {
        maxRequestsPerMinute: 100,
        burstLimit: 25,
        slidingWindowSeconds: 60,
        quarantineDurationSeconds: 180,
        dfaStrictness: 'MODERATE',
        ipWhitelist: ['127.0.0.1', '::1'],
        ipBlacklist: [],
        updatedAt: new Date(),
      },
    };
    this.maxLogRetention = 2000;
  }

  insertLog(log) {
    const item = { ...log, _id: log._id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, createdAt: new Date() };
    this.collections.apiLogs.unshift(item);
    if (this.collections.apiLogs.length > this.maxLogRetention) {
      this.collections.apiLogs.pop();
    }
    return item;
  }

  getLogs(query = {}, limit = 100) {
    let result = [...this.collections.apiLogs];
    if (query.method) result = result.filter(l => l.method === query.method);
    if (query.statusCode) result = result.filter(l => l.statusCode === parseInt(query.statusCode, 10));
    if (query.classification) result = result.filter(l => l.classification === query.classification);
    return result.slice(0, limit);
  }

  insertAlert(alert) {
    const item = { ...alert, _id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, timestamp: new Date() };
    this.collections.abuseAlerts.unshift(item);
    if (this.collections.abuseAlerts.length > 500) {
      this.collections.abuseAlerts.pop();
    }
    return item;
  }

  getAlerts(limit = 50) {
    return this.collections.abuseAlerts.slice(0, limit);
  }

  getRateLimitRecord(key) {
    return this.collections.rateLimitRecords.get(key) || null;
  }

  setRateLimitRecord(key, record) {
    this.collections.rateLimitRecords.set(key, { ...record, updatedAt: new Date() });
    return record;
  }

  getClientActivity(key) {
    return this.collections.clientActivities.get(key) || null;
  }

  setClientActivity(key, act) {
    this.collections.clientActivities.set(key, { ...act, updatedAt: new Date() });
    return act;
  }

  getSettings() {
    return { ...this.collections.systemSettings };
  }

  updateSettings(newSettings) {
    this.collections.systemSettings = {
      ...this.collections.systemSettings,
      ...newSettings,
      updatedAt: new Date(),
    };
    return this.collections.systemSettings;
  }
}

export const memoryStore = new MemoryDatastore();

export let isMongoConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rate_limiter_sentinel';
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB offline or unreachable: ${error.message}`);
    console.info('[Database] Seamlessly activated In-Memory High-Performance Datastore for live demo.');
  }

  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.warn('[Database] MongoDB connection dropped. Operating in in-memory fallback.');
  });

  mongoose.connection.on('reconnected', () => {
    isMongoConnected = true;
    console.log('[Database] MongoDB reconnected.');
  });
}
