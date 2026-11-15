import mongoose from 'mongoose';

const clientActivitySchema = new mongoose.Schema(
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
    reputationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    totalBlocked: {
      type: Number,
      default: 0,
    },
    totalSuspicious: {
      type: Number,
      default: 0,
    },
    dfaCurrentState: {
      type: String,
      enum: ['S0', 'S1', 'S2', 'S3', 'S4'],
      default: 'S0',
    },
    isQuarantined: {
      type: Boolean,
      default: false,
    },
    quarantineExpiresAt: {
      type: Date,
      default: null,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ClientActivity = mongoose.model('ClientActivity', clientActivitySchema);
