import mongoose from 'mongoose';

const abuseAlertSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    clientIpRaw: {
      type: String,
      required: true,
    },
    clientIpMasked: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    ruleTriggered: {
      type: String,
      required: true,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    detectionDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE',
    },
    actionTaken: {
      type: String,
      enum: ['LOGGED', 'WARNED', 'THROTTLED', 'QUARANTINED'],
      default: 'LOGGED',
    },
  },
  {
    timestamps: true,
  }
);

abuseAlertSchema.index({ createdAt: -1, severity: 1 });

export const AbuseAlert = mongoose.model('AbuseAlert', abuseAlertSchema);
