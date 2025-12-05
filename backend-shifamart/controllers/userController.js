const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.sessionId;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Get user's medical history
// @route   GET /api/users/medical-history
// @access  Private
exports.getMedicalHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('medicalHistory')
      .lean();

    res.json({
      success: true,
      data: user.medicalHistory || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical history',
      error: error.message
    });
  }
};

// @desc    Add medical history entry
// @route   POST /api/users/medical-history
// @access  Private
exports.addMedicalHistory = async (req, res) => {
  try {
    const { condition, diagnosedDate, status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          medicalHistory: {
            condition,
            diagnosedDate: diagnosedDate || new Date(),
            status: status || 'ongoing'
          }
        }
      },
      { new: true }
    ).select('medicalHistory');

    res.status(201).json({
      success: true,
      message: 'Medical history added',
      data: user.medicalHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add medical history',
      error: error.message
    });
  }
};

// @desc    Delete medical history entry
// @route   DELETE /api/users/medical-history/:historyId
// @access  Private
exports.deleteMedicalHistory = async (req, res) => {
  try {
    const { historyId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          medicalHistory: { _id: historyId }
        }
      },
      { new: true }
    ).select('medicalHistory');

    res.json({
      success: true,
      message: 'Medical history entry deleted',
      data: user.medicalHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete medical history',
      error: error.message
    });
  }
};

// @desc    Get user's allergies
// @route   GET /api/users/allergies
// @access  Private
exports.getAllergies = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('allergies')
      .lean();

    res.json({
      success: true,
      data: user.allergies || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch allergies',
      error: error.message
    });
  }
};

// @desc    Add allergy
// @route   POST /api/users/allergies
// @access  Private
exports.addAllergy = async (req, res) => {
  try {
    const { allergy } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: { allergies: allergy }
      },
      { new: true }
    ).select('allergies');

    res.status(201).json({
      success: true,
      message: 'Allergy added',
      data: user.allergies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add allergy',
      error: error.message
    });
  }
};

// @desc    Delete allergy
// @route   DELETE /api/users/allergies/:allergy
// @access  Private
exports.deleteAllergy = async (req, res) => {
  try {
    const { allergy } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { allergies: allergy }
      },
      { new: true }
    ).select('allergies');

    res.json({
      success: true,
      message: 'Allergy deleted',
      data: user.allergies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete allergy',
      error: error.message
    });
  }
};

// @desc    Get user's medications
// @route   GET /api/users/medications
// @access  Private
exports.getMedications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('medications')
      .lean();

    res.json({
      success: true,
      data: user.medications || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medications',
      error: error.message
    });
  }
};

// @desc    Add medication
// @route   POST /api/users/medications
// @access  Private
exports.addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, duration } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          medications: {
            name,
            dosage,
            frequency,
            duration
          }
        }
      },
      { new: true }
    ).select('medications');

    res.status(201).json({
      success: true,
      message: 'Medication added',
      data: user.medications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add medication',
      error: error.message
    });
  }
};

// @desc    Delete medication
// @route   DELETE /api/users/medications/:medicationId
// @access  Private
exports.deleteMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          medications: { _id: medicationId }
        }
      },
      { new: true }
    ).select('medications');

    res.json({
      success: true,
      message: 'Medication deleted',
      data: user.medications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete medication',
      error: error.message
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users/all
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin - FIXED: req.user.role check
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};