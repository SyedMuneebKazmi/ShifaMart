const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');
const PharmacyInventory = require('../models/PharmacyInventory');
const { coordinatesToGeoJSON, isValidCoordinates } = require('../utils/geolocation');

/**
 * @desc    Create a new pharmacy
 * @route   POST /api/pharmacies
 * @access  Private (pharmacy role only)
 */
exports.createPharmacy = async (req, res) => {
  try {
    // Check if user is pharmacy
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy users can create pharmacy profiles'
      });
    }

    const { pharmacyName, address, city, province, postalCode, phoneNumber, email, workingHours, licenseNumber, latitude, longitude } = req.body;

    // Validate required fields
    if (!pharmacyName || !address || !city || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: pharmacyName, address, city, phoneNumber'
      });
    }

    // Validate coordinates if provided
    if (latitude && longitude) {
      if (!isValidCoordinates(latitude, longitude)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude or longitude values'
        });
      }
    }

    // Check if pharmacy already exists for this user
    const existingPharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (existingPharmacy) {
      return res.status(400).json({
        success: false,
        message: 'User already has a pharmacy profile. Use update instead.'
      });
    }

    // Create location object
    const location = latitude && longitude 
      ? coordinatesToGeoJSON(latitude, longitude)
      : null;

    const pharmacy = new Pharmacy({
      owner: req.user._id,
      pharmacyName,
      address,
      city,
      province,
      postalCode,
      phoneNumber,
      email,
      workingHours,
      licenseNumber,
      location,
      isVerified: false,
      status: 'pending'
    });

    await pharmacy.save();

    // Populate owner details
    await pharmacy.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Pharmacy created successfully. Awaiting verification.',
      data: pharmacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating pharmacy',
      error: error.message
    });
  }
};

/**
 * @desc    Get all pharmacies
 * @route   GET /api/pharmacies
 * @access  Public
 */
exports.getAllPharmacies = async (req, res) => {
  try {
    const { city, status = 'active' } = req.query;

    const filter = { status };
    if (city) {
      filter.city = { $regex: city, $options: 'i' }; // Case-insensitive search
    }

    const pharmacies = await Pharmacy.find(filter)
      .populate('owner', 'name email phone')
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: pharmacies.length,
      data: pharmacies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacies',
      error: error.message
    });
  }
};

/**
 * @desc    Get single pharmacy by ID
 * @route   GET /api/pharmacies/:id
 * @access  Public
 */
exports.getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    res.json({
      success: true,
      data: pharmacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacy',
      error: error.message
    });
  }
};

/**
 * @desc    Get current user's pharmacy (if owner)
 * @route   GET /api/pharmacies/my-profile
 * @access  Private (pharmacy role)
 */
exports.getMyPharmacy = async (req, res) => {
  try {
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacy users can access this endpoint'
      });
    }

    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'You do not have a pharmacy profile yet. Create one to continue.'
      });
    }

    res.json({
      success: true,
      data: pharmacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacy',
      error: error.message
    });
  }
};

/**
 * @desc    Update pharmacy profile
 * @route   PUT /api/pharmacies/:id
 * @access  Private (owner only)
 */
exports.updatePharmacy = async (req, res) => {
  try {
    let pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    // Check authorization
    if (pharmacy.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this pharmacy'
      });
    }

    const { latitude, longitude, ...updates } = req.body;

    // Update location if provided
    if (latitude && longitude) {
      if (!isValidCoordinates(latitude, longitude)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude or longitude values'
        });
      }
      updates.location = coordinatesToGeoJSON(latitude, longitude);
    }

    pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Pharmacy updated successfully',
      data: pharmacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating pharmacy',
      error: error.message
    });
  }
};

/**
 * @desc    Delete pharmacy
 * @route   DELETE /api/pharmacies/:id
 * @access  Private (owner or admin)
 */
exports.deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    // Check authorization
    if (pharmacy.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this pharmacy'
      });
    }

    await Pharmacy.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Pharmacy deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting pharmacy',
      error: error.message
    });
  }
};

/**
 * @desc    Find nearby pharmacies (geolocation search)
 * @route   GET /api/pharmacies/nearby
 * @access  Public
 * @query   latitude, longitude, maxDistance (in meters, default 5000)
 */
exports.getNearbyPharmacies = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude'
      });
    }

    if (!isValidCoordinates(parseFloat(latitude), parseFloat(longitude))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      status: 'active'
    }).populate('owner', 'name email phone');

    res.json({
      success: true,
      count: pharmacies.length,
      data: pharmacies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby pharmacies',
      error: error.message
    });
  }
};

/**
 * @desc    Get inventory (medicines list) for a pharmacy
 * @route   GET /api/pharmacies/:id/inventory
 * @access  Public
 * @query   search, inStockOnly, category
 */
exports.getPharmacyInventory = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).select('pharmacyName city address');
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    const { search, inStockOnly, category } = req.query;
    const filter = { pharmacy: pharmacy._id };
    if (inStockOnly === 'true') {
      filter.stock = { $gt: 0 };
      filter.isAvailable = true;
    }
    if (search && search.trim()) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [
        { medicineName: rx },
        { genericName: rx }
      ];
    }

    let query = PharmacyInventory.find(filter)
      .populate('medicine', 'name genericName category dosage image manufacturer')
      .sort({ medicineName: 1 });

    let inventory = await query;

    if (category && category !== 'All') {
      inventory = inventory.filter(inv => inv.medicine && inv.medicine.category === category);
    }

    res.json({
      success: true,
      count: inventory.length,
      pharmacy: {
        _id: pharmacy._id,
        pharmacyName: pharmacy.pharmacyName,
        city: pharmacy.city,
        address: pharmacy.address
      },
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pharmacy inventory',
      error: error.message
    });
  }
};

/**
 * @desc    Verify pharmacy (admin only)
 * @route   PUT /api/pharmacies/:id/verify
 * @access  Private (admin)
 */
exports.verifyPharmacy = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can verify pharmacies'
      });
    }

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, status: 'active' },
      { new: true }
    ).populate('owner', 'name email phone');

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found'
      });
    }

    res.json({
      success: true,
      message: 'Pharmacy verified successfully',
      data: pharmacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying pharmacy',
      error: error.message
    });
  }
};
