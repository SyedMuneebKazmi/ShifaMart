const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sessionId: { type: String, ref: 'ChatSession' },
  symptoms: [String],
  predictedDiseases: [{ disease: String, probability: Number, date: Date, isConfirmed: Boolean }],
  severityAssessment: { level: String, score: Number, date: Date, wasEmergency: Boolean },
  firstAidProvided: { type: Map, of: mongoose.Schema.Types.Mixed },
  specialistRecommended: { type: Map, of: mongoose.Schema.Types.Mixed },
  actualDiagnosis: {
    disease: String,
    diagnosedBy: { type: String, enum: ['ai', 'doctor', 'self'] },
    doctorName: String,
    hospital: String,
    date: Date,
    notes: String,
    confidence: Number
  },
  followUp: { required: Boolean, scheduledDate: Date, completedDate: Date, notes: String },
  medications: [{ name: String, dosage: String, frequency: String, duration: String, prescribedBy: String }],
  notes: String,
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
healthRecordSchema.index({ userId: 1, createdAt: -1 });

// Update timestamp before update
healthRecordSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
