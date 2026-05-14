const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    // Medicine Basic Information
    name: {
      type: String,
      required: true,
      trim: true
    },
    
    genericName: {
      type: String,
      required: true,
      trim: true
    },
    
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    
    category: {
      type: String,
      required: true,
      enum: ['Painkiller', 'Antibiotic', 'Antihistamine', 'Antiviral', 'Antifungal', 'Other'],
      default: 'Other'
    },
    
    description: {
      type: String,
      trim: true
    },
    
    manufacturer: {
      type: String,
      trim: true
    },
    
    // Medical Information
    sideEffects: [{
      type: String,
      trim: true
    }],
    
    contraindications: [{
      type: String,
      trim: true
    }],
    
    dosageInstructions: {
      type: String,
      trim: true
    },
    
    // Regulatory Information
    registrationNumber: {
      type: String,
      trim: true
    },
    
    // Additional Info
    strength: {
      type: String,
      trim: true
    },
    
    // Images/Media
    image: {
      type: String
    },
    
    // Status
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for search optimization
medicineSchema.index({ name: 'text', genericName: 'text', category: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);
