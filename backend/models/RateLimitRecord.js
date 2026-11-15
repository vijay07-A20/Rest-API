import mongoose from 'mongoose';

const rateLimitRecordSchema = new mongoose.Schema(
  {
    clientKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    clientIpMasked: {
      type: String,
      required: true,
    },
    requestTimestamps: {
      type: [Number],
      default: [],
    },
    totalRequestsCount: {
      type: Number,
      default: 0,
    },
    totalBlockedCount: {
      type: Number,
      default: 0,
    },
    windowStartTime: {
      type: Date,
      default: Date.now,
    },
    lastRequestTime: {
      type: Date,
      default: Date.now,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

rateLimitRecordSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export const RateLimitRecord = mongoose.model('RateLimitRecord', rateLimitRecordSchema);
