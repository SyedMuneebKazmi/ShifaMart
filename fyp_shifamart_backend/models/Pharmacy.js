const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    // Link to User (pharmacy role)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Pharmacy Information
    pharmacyName: {
      type: String,
      required: true,
      trim: true
    },
    
    // Address & Location
    address: {
      type: String,
      required: true,
      trim: true
    },
    
    city: {
      type: String,
      required: true,
      trim: true
    },
    
    province: {
      type: String,
      trim: true
    },
    
    postalCode: {
      type: String,
      trim: true
    },
    
    // Geolocation (GeoJSON for MongoDB geospatial queries)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    
    // Contact Information
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    
    email: {
      type: String,
      trim: true
    },
    
    // Business Information
    licenseNumber: {
      type: String,
      trim: true
    },
    
    workingHours: {
      type: String, // e.g., "9AM-10PM"
      default: '9AM-10PM'
    },
    
    isOpen: {
      type: Boolean,
      default: true
    },
    
    // Rating & Reviews
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    
    reviews: {
      type: Number,
      default: 0
    },
    
    // Store Image
    storeImage: {
      type: String
    },
    
    // Verification
    isVerified: {
      type: Boolean,
      default: false
    },
    
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Create geospatial index for location-based queries
pharmacySchema.index({ location: '2dsphere' });

// Index for city searches
pharmacySchema.index({ city: 1 });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
