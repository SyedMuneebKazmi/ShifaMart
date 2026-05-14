const Medicine = require('../models/Medicine');
const PharmacyInventory = require('../models/PharmacyInventory');
const Pharmacy = require('../models/Pharmacy');
const { calculateDistance, geoJSONToCoordinates, getPakistaniCityCoordinates, formatDistance } = require('../utils/geolocation');


/**
 * @desc    Get all medicines with pagination
 * @route   GET /api/medicines
 * @access  Public
 * @query   category, search, page, limit
 */
exports.getMedicines = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const medicines = await Medicine.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Medicine.countDocuments(filter);

    res.json({
      success: true,
      count: medicines.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medicines',
      error: error.message
    });
  }
};

/**
 * @desc    Get single medicine by ID
 * @route   GET /api/medicines/:id
 * @access  Public
 */
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medicine',
      error: error.message
    });
  }
};


/**
 * @desc    Create a new medicine (admin/system only)
 * @route   POST /api/medicines
 * @access  Private (admin)
 */
exports.createMedicine = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create medicines'
      });
    }

    const { name, genericName, dosage, category, description, manufacturer, sideEffects, dosageInstructions, registrationNumber, strength } = req.body;

    // Validate required fields
    if (!name || !genericName || !dosage || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, genericName, dosage, category'
      });
    }

    // Check if medicine already exists
    const existingMedicine = await Medicine.findOne({ name, dosage });
    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: 'Medicine with this name and dosage already exists'
      });
    }

    const medicine = new Medicine({
      name,
      genericName,
      dosage,
      category,
      description,
      manufacturer,
      sideEffects: sideEffects || [],
      dosageInstructions,
      registrationNumber,
      strength
    });

    await medicine.save();

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating medicine',
      error: error.message
    });
  }
};

/**
 * @desc    Update medicine
 * @route   PUT /api/medicines/:id
 * @access  Private (admin)
 */
exports.updateMedicine = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only admins or pharmacies can update medicines'
      });
    }

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating medicine',
      error: error.message
    });
  }
};

/**
 * @desc    Delete medicine
 * @route   DELETE /api/medicines/:id
 * @access  Private (admin)
 */
exports.deleteMedicine = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only admins or pharmacies can delete medicines'
      });
    }

    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting medicine',
      error: error.message
    });
  }
};


/**
 * @desc    Add medicine to pharmacy inventory (pharmacy only)
 * @route   POST /api/medicines/inventory/add
 * @access  Private (pharmacy)
 */
exports.addToInventory = async (req, res) => {
  try {
    if (req.user.role !== 'pharmacy') {
      return res.status(403).json({
        success: false,
        message: 'Only pharmacies can add medicines to inventory'
      });
    }

    const { medicineId, price, stock, batchNumber, expiryDate, discount, discountType } = req.body;

    if (!medicineId || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide medicineId, price, and stock'
      });
    }

    // Get the medicine
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Get the pharmacy
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy profile not found'
      });
    }

    // Check if inventory already exists
    let inventory = await PharmacyInventory.findOne({
      pharmacy: pharmacy._id,
      medicine: medicineId
    });

    if (inventory) {
      // Update existing inventory
      inventory.price = price;
      inventory.stock = stock;
      inventory.batchNumber = batchNumber;
      inventory.expiryDate = expiryDate;
      inventory.discount = discount || 0;
      inventory.discountType = discountType || 'percentage';
      await inventory.save();

      return res.json({
        success: true,
        message: 'Inventory updated successfully',
        data: inventory
      });
    }

    // Create new inventory
    inventory = new PharmacyInventory({
      pharmacy: pharmacy._id,
      medicine: medicineId,
      medicineName: medicine.name,
      genericName: medicine.genericName,
      dosage: medicine.dosage,
      price,
      stock,
      batchNumber,
      expiryDate,
      discount: discount || 0,
      discountType: discountType || 'percentage'
    });

    await inventory.save();

    res.status(201).json({
      success: true,
      message: 'Medicine added to inventory successfully',
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding medicine to inventory',
      error: error.message
    });
  }
};

/**
 * @desc    Compare medicine prices across nearby pharmacies
 * @route   POST /api/medicines/compare-prices
 * @access  Public
 * @body    {medicineName, city, latitude, longitude, radius}
 */
exports.comparePrices = async (req, res) => {
  try {
    const { medicineName, city, latitude, longitude, radius = 5 } = req.body;

    if (!medicineName || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide medicineName and city'
      });
    }

    let userCoords = { latitude, longitude };

    // If coordinates not provided, use city coordinates
    if (!latitude || !longitude) {
      userCoords = getPakistaniCityCoordinates(city);
    }

    // Find pharmacies in the city
    let pharmacies = await Pharmacy.find({
      city: { $regex: city, $options: 'i' },
      status: 'active'
    });

    // If no pharmacies found by city, use geolocation
    if (pharmacies.length === 0) {
      pharmacies = await Pharmacy.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [userCoords.longitude, userCoords.latitude]
            },
            $maxDistance: radius * 1000 // Convert to meters
          }
        },
        status: 'active'
      });
    }

    if (pharmacies.length === 0) {
      return res.json({
        success: true,
        message: `No pharmacies found in ${city}`,
        data: []
      });
    }

    const pharmacyIds = pharmacies.map(p => p._id);

    // Find inventory for the medicine in these pharmacies
    const inventory = await PharmacyInventory.find({
      pharmacy: { $in: pharmacyIds },
      medicineName: { $regex: medicineName, $options: 'i' },
      stock: { $gt: 0 },
      isAvailable: true
    }).populate('pharmacy', 'pharmacyName city address phoneNumber rating workingHours location');

    if (inventory.length === 0) {
      return res.json({
        success: true,
        message: `Medicine '${medicineName}' not found in nearby pharmacies`,
        data: []
      });
    }

    // Format response with distance calculation
    const results = inventory.map(item => {
      let distance = 0;
      
      if (item.pharmacy && item.pharmacy.location) {
        const coords = geoJSONToCoordinates(item.pharmacy.location);
        if (coords) {
          distance = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            coords.latitude,
            coords.longitude
          );
        }
      }

      return {
        pharmacyId: item.pharmacy?._id,
        pharmacyName: item.pharmacy?.pharmacyName,
        city: item.pharmacy?.city,
        address: item.pharmacy?.address,
        phoneNumber: item.pharmacy?.phoneNumber,
        workingHours: item.pharmacy?.workingHours,
        rating: item.pharmacy?.rating,
        distance: formatDistance(distance),
        distanceKm: parseFloat(distance.toFixed(1)),
        price: item.finalPrice || item.price,
        originalPrice: item.price,
        discount: item.discount,
        discountType: item.discountType,
        stock: item.stock,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate
      };
    });

    // Sort by price (low to high)
    results.sort((a, b) => a.price - b.price);

    res.json({
      success: true,
      count: results.length,
      medicineName,
      userLocation: city,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing prices',
      error: error.message
    });
  }
};

/**
 * @desc    Compare multiple medicines across ALL pharmacies. Groups results by pharmacy.
 * @route   POST /api/medicines/compare-multi
 * @access  Public
 * @body    {
 *            medicineNames: string[],    // required, list of medicine names
 *            latitude?: number,          // user location (optional)
 *            longitude?: number,
 *            city?: string,              // fallback if no coords
 *            inStockOnly?: boolean,      // default false -- when true, only pharmacies with all items in stock
 *            sortBy?: 'price_desc' | 'price_asc' | 'distance'  // default 'price_desc'
 *          }
 */
exports.compareMultipleMedicines = async (req, res) => {
  try {
    const {
      medicineNames,
      latitude,
      longitude,
      city,
      inStockOnly = false,
      sortBy = 'price_desc',
    } = req.body || {};

    if (!Array.isArray(medicineNames) || medicineNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of medicineNames'
      });
    }

    // Clean + de-duplicate requested medicine names (case-insensitive)
    const requested = Array.from(
      new Set(
        medicineNames
          .map(n => (typeof n === 'string' ? n.trim() : ''))
          .filter(Boolean)
      )
    );

    if (requested.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid medicine names provided'
      });
    }

    // Resolve user coordinates (optional)
    let userCoords = null;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      userCoords = { latitude, longitude };
    } else if (city) {
      try { userCoords = getPakistaniCityCoordinates(city); } catch (_) { userCoords = null; }
    }

    // Fetch ALL active pharmacies (no city filter so we search every pharmacy in DB)
    const pharmacies = await Pharmacy.find({ status: 'active' })
      .select('pharmacyName city address phoneNumber rating workingHours location isVerified isOpen');

    if (pharmacies.length === 0) {
      return res.json({
        success: true,
        count: 0,
        medicineNames: requested,
        data: [],
      });
    }

    const pharmacyIds = pharmacies.map(p => p._id);

    // Build a regex that matches ANY of the requested medicine names
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRegex = new RegExp(requested.map(escapeRegex).join('|'), 'i');

    const inventoryFilter = {
      pharmacy: { $in: pharmacyIds },
      $or: [
        { medicineName: nameRegex },
        { genericName: nameRegex }
      ]
    };

    const inventoryRecords = await PharmacyInventory.find(inventoryFilter)
      .populate('medicine', 'name genericName category dosage');

    // Group by pharmacy, and for each pharmacy produce an entry per requested medicine
    const pharmacyMap = new Map();
    pharmacies.forEach(p => {
      pharmacyMap.set(p._id.toString(), {
        pharmacy: p,
        invByRequested: new Map(requested.map(name => [name.toLowerCase(), null])),
      });
    });

    inventoryRecords.forEach(inv => {
      const key = inv.pharmacy.toString();
      const entry = pharmacyMap.get(key);
      if (!entry) return;
      const medName = (inv.medicineName || '').toLowerCase();
      const genName = (inv.genericName || '').toLowerCase();

      // Find which requested name(s) this inventory satisfies
      requested.forEach(reqName => {
        const low = reqName.toLowerCase();
        if (medName.includes(low) || genName.includes(low)) {
          const existing = entry.invByRequested.get(low);
          // Prefer the one that is in stock and cheaper
          const candidate = {
            inventoryId: inv._id,
            requestedName: reqName,
            medicineName: inv.medicineName,
            genericName: inv.genericName,
            dosage: inv.dosage,
            category: inv.medicine?.category,
            price: typeof inv.finalPrice === 'number' ? inv.finalPrice : inv.price,
            originalPrice: inv.price,
            discount: inv.discount || 0,
            discountType: inv.discountType,
            stock: inv.stock,
            inStock: (inv.stock > 0) && inv.isAvailable !== false,
            expiryDate: inv.expiryDate,
          };
          if (
            !existing ||
            (candidate.inStock && !existing.inStock) ||
            (candidate.inStock === existing.inStock && candidate.price < existing.price)
          ) {
            entry.invByRequested.set(low, candidate);
          }
        }
      });
    });

    // Build result list
    const results = [];
    for (const [, entry] of pharmacyMap) {
      const p = entry.pharmacy;
      const items = requested.map(reqName => {
        const found = entry.invByRequested.get(reqName.toLowerCase());
        if (found) return { ...found, matched: true };
        return {
          requestedName: reqName,
          medicineName: reqName,
          matched: false,
          inStock: false,
          stock: 0,
          price: 0,
        };
      });

      const matchedItems = items.filter(i => i.matched);
      if (matchedItems.length === 0) continue; // Skip pharmacies that don't stock ANY requested item

      const inStockCount = matchedItems.filter(i => i.inStock).length;

      if (inStockOnly && inStockCount < requested.length) continue;

      const totalPrice = matchedItems.reduce((sum, i) => sum + (i.inStock ? (i.price || 0) : 0), 0);

      // Distance
      let distanceKm = null;
      if (userCoords && p.location) {
        const coords = geoJSONToCoordinates(p.location);
        if (coords) {
          distanceKm = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            coords.latitude,
            coords.longitude
          );
        }
      }

      let availability = 'Out of Stock';
      if (inStockCount === requested.length) availability = 'In Stock';
      else if (inStockCount > 0) availability = 'Partial';

      results.push({
        id: p._id,
        pharmacyId: p._id,
        pharmacy: p.pharmacyName,
        pharmacyName: p.pharmacyName,
        city: p.city,
        address: p.address,
        phoneNumber: p.phoneNumber,
        rating: p.rating,
        workingHours: p.workingHours,
        isVerified: p.isVerified,
        isOpen: p.isOpen,
        distance: distanceKm !== null ? formatDistance(distanceKm) : 'N/A',
        distanceKm: distanceKm !== null ? parseFloat(distanceKm.toFixed(1)) : null,
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        availability,
        matchedCount: matchedItems.length,
        requestedCount: requested.length,
        items,
      });
    }

    // Sort by the requested order
    results.sort((a, b) => {
      if (sortBy === 'price_asc') {
        if (a.totalPrice !== b.totalPrice) return a.totalPrice - b.totalPrice;
        return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      }
      if (sortBy === 'distance') {
        const da = a.distanceKm ?? Infinity;
        const db = b.distanceKm ?? Infinity;
        if (da !== db) return da - db;
        return b.totalPrice - a.totalPrice;
      }
      // default: price_desc -> price high to low, then nearest first
      if (a.totalPrice !== b.totalPrice) return b.totalPrice - a.totalPrice;
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
    });

    res.json({
      success: true,
      count: results.length,
      medicineNames: requested,
      userLocation: userCoords,
      sortBy,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing medicines across pharmacies',
      error: error.message,
    });
  }
};

/**
 * @desc    Search medicines by name or generic name
 * @route   GET /api/medicines/search
 * @access  Public
 * @query   q (search query)
 */
exports.searchMedicines = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { genericName: { $regex: q, $options: 'i' } }
      ]
    }).limit(parseInt(limit));

    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching medicines',
      error: error.message
    });
  }
};

module.exports = exports;
