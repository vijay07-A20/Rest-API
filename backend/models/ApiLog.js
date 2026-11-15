import mongoose from 'mongoose';

const apiLogSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      index: true,
    },
    clientIpRaw: {
      type: String,
      required: true,
      index: true,
    },
    clientIpMasked: {
      type: String,
      required: true,
    },
    ipVersion: {
      type: String,
      enum: ['IPv4', 'IPv6'],
      default: 'IPv4',
    },
    networkScope: {
      type: String,
      default: 'Public Internet',
    },
    method: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    statusCode: {
      type: Number,
      required: true,
      index: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    userAgent: {
      type: String,
      default: 'Unknown Client',
    },
    contentLength: {
      type: Number,
      default: 0,
    },
    dfaState: {
      type: String,
      enum: ['S0', 'S1', 'S2', 'S3', 'S4'],
      default: 'S0',
    },
    classification: {
      type: String,
      enum: ['Normal', 'Warning', 'Suspicious', 'Rate Limited'],
      default: 'Normal',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    networkLayer: {
      applicationProtocol: { type: String, default: 'HTTP/1.1' },
      transportProtocol: { type: String, default: 'TCP' },
      qosPriorityTier: { type: String, default: 'STANDARD' },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast dashboard analytics queries
apiLogSchema.index({ createdAt: -1, statusCode: 1 });
apiLogSchema.index({ clientIpRaw: 1, createdAt: -1 });

// TTL index to automatically purge historical logs after 7 days (604800 seconds)
apiLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export const ApiLog = mongoose.model('ApiLog', apiLogSchema);
