import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    maxRequestsPerMinute: {
      type: Number,
      default: 100,
      min: 1,
      max: 10000,
    },
    burstLimit: {
      type: Number,
      default: 25,
      min: 1,
      max: 1000,
    },
    slidingWindowSeconds: {
      type: Number,
      default: 60,
      min: 5,
      max: 3600,
    },
    quarantineDurationSeconds: {
      type: Number,
      default: 180,
      min: 10,
      max: 86400,
    },
    dfaStrictness: {
      type: String,
      enum: ['PERMISSIVE', 'MODERATE', 'STRICT'],
      default: 'MODERATE',
    },
    ipWhitelist: {
      type: [String],
      default: ['127.0.0.1', '::1'],
    },
    ipBlacklist: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
