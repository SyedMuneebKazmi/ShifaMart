const mongoose = require('mongoose');

const pharmacyInventorySchema = new mongoose.Schema(
  {
    // References
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true
    },
    
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    
    // Medicine Details (denormalized for faster queries)
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    
    genericName: {
      type: String,
      trim: true
    },
    
    dosage: {
      type: String,
      trim: true
    },
    
    // Pricing & Stock at this pharmacy
    price: {
      type: Number,
      required: true,
      min: 0
    },
    
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    
    // Inventory Management
    minimumStock: {
      type: Number,
      default: 10
    },
    
    batchNumber: {
      type: String,
      trim: true
    },
    
    expiryDate: {
      type: Date
    },
    
    // Status
    isAvailable: {
      type: Boolean,
      default: true
    },
    
    // Discount/Offers
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    
    // Calculated field for final price
    finalPrice: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Compound index for faster queries
pharmacyInventorySchema.index({ pharmacy: 1, medicine: 1 }, { unique: true });
pharmacyInventorySchema.index({ medicineName: 'text' });
pharmacyInventorySchema.index({ pharmacy: 1, medicineName: 'text' });

// Pre-save hook to calculate final price with discount
pharmacyInventorySchema.pre('save', function(next) {
  if (this.discount > 0) {
    if (this.discountType === 'percentage') {
      this.finalPrice = this.price * (1 - this.discount / 100);
    } else {
      this.finalPrice = this.price - this.discount;
    }
  } else {
    this.finalPrice = this.price;
  }
  next();
});

module.exports = mongoose.model('PharmacyInventory', pharmacyInventorySchema);
