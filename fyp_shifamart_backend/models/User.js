const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    phone: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
    role: { type: String, enum: ['patient', 'doctor', 'pharmacy', 'admin'], default: 'patient' },
    sessionId: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    
    // Doctor-specific fields
    licenseNumber: { type: String }, // Medical license number
    specialization: { type: String }, // e.g., 'Cardiology', 'Pediatrics'
    experience: { type: Number }, // Years of experience
    hospital: { type: String }, // Hospital name
    qualifications: { type: String }, // e.g., 'MBBS, MD Cardiology'
    bio: { type: String }, // Doctor bio
    consultationFee: { type: Number }, // Consultation fee in PKR
    rating: { type: Number, default: 4.5, min: 0, max: 5 }, // Rating out of 5
    reviews: { type: Number, default: 0 }, // Number of reviews
    avatar: { type: String }, // Avatar URL
    isAvailable: { type: Boolean, default: true }, // Availability status
    availability: { type: String }, // e.g., 'Mon-Fri 9AM-5PM'
    
    // Location fields for patients (for medicine search)
    city: { type: String }, // User's city for location-based search
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number] // [longitude, latitude]
      }
    }
  },
  {
    timestamps: true
  }
);

// Create sparse geospatial index — only indexes docs that have location data
userSchema.index({ location: '2dsphere' }, { sparse: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
