const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
});

const chatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionId: { type: String, required: true, unique: true },
  messages: [messageSchema],
  symptoms: [String],
  predictions: [{
    disease: String,
    probability: Number,
    description: String,
    precautions: [String],
    confidence: Number
  }],
  severity: {
    level: String,
    score: Number,
    isEmergency: Boolean,
    reason: String,
    confidence: Number
  },
  firstAid: { type: Map, of: mongoose.Schema.Types.Mixed },
  recommendedSpecialist: { type: Map, of: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
  duration: Number,
}, { timestamps: true });

// Update updatedAt before save
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});



chatSessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
