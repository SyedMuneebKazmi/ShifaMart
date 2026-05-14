const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res) => {
  try {
    const {
      specialization,
      search,
      available,
      city,
      minFee,
      maxFee,
      sortBy,
    } = req.query;

    // Build query filter
    const filter = { role: 'doctor' };

    if (specialization && specialization !== 'All') {
      filter.specialization = { $regex: new RegExp(specialization, 'i') };
    }

    if (available === 'true') {
      filter.isAvailable = true;
    }

    if (city && city !== 'All') {
      filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    // Fee range filter (consultationFee is stored in PKR)
    const feeFilter = {};
    const minFeeNum = Number(minFee);
    const maxFeeNum = Number(maxFee);
    if (!Number.isNaN(minFeeNum) && minFee !== undefined && minFee !== '') {
      feeFilter.$gte = minFeeNum;
    }
    if (!Number.isNaN(maxFeeNum) && maxFee !== undefined && maxFee !== '') {
      feeFilter.$lte = maxFeeNum;
    }
    if (Object.keys(feeFilter).length > 0) {
      filter.consultationFee = feeFilter;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { specialization: { $regex: new RegExp(search, 'i') } },
        { hospital: { $regex: new RegExp(search, 'i') } },
        { city: { $regex: new RegExp(search, 'i') } },
      ];
    }

    let doctors = await User.find(filter).select('-password');

    // Map to response format
    doctors = doctors.map(doc => ({
      _id: doc._id,
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      specialization: doc.specialization || 'General Medicine',
      experience: doc.experience || 0,
      consultationFee: doc.consultationFee || 1500,
      hospital: doc.hospital || 'Not specified',
      city: doc.city || '',
      qualifications: doc.qualifications || 'MBBS',
      bio: doc.bio || '',
      rating: doc.rating || 4.5,
      reviews: doc.reviews || 0,
      avatar: doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`,
      isAvailable: doc.isAvailable !== false,
      availability: doc.availability || 'Available',
      licenseNumber: doc.licenseNumber,
    }));

    // Optional sort (client can also sort, this is a convenience)
    if (sortBy === 'fee_asc') {
      doctors.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
    } else if (sortBy === 'fee_desc') {
      doctors.sort((a, b) => (b.consultationFee || 0) - (a.consultationFee || 0));
    } else if (sortBy === 'rating') {
      doctors.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'experience') {
      doctors.sort((a, b) => (Number(b.experience) || 0) - (Number(a.experience) || 0));
    }

    res.json({
      success: true,
      message: 'Doctors retrieved successfully',
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctors',
      error: error.message
    });
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doc = await User.findOne({ _id: id, role: 'doctor' }).select('-password');
    
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    const doctor = {
      _id: doc._id,
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      specialization: doc.specialization || 'General Medicine',
      experience: doc.experience || 0,
      consultationFee: doc.consultationFee || 1500,
      hospital: doc.hospital || 'Not specified',
      qualifications: doc.qualifications || 'MBBS',
      bio: doc.bio || '',
      rating: doc.rating || 4.5,
      reviews: doc.reviews || 0,
      avatar: doc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}`,
      isAvailable: doc.isAvailable !== false,
      availability: doc.availability || 'Available',
      licenseNumber: doc.licenseNumber,
    };
    
    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor',
      error: error.message
    });
  }
};

// @desc    Get doctor's own profile
// @route   GET /api/doctors/profile/me
// @access  Private (doctor only)
exports.getDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can access this endpoint'
      });
    }
    
    const doc = await User.findById(req.user.id).select('-password');
    
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    res.json({
      success: true,
      data: {
        _id: doc._id,
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone || '',
        specialization: doc.specialization || '',
        experience: doc.experience || 0,
        consultationFee: doc.consultationFee || 0,
        hospital: doc.hospital || '',
        qualifications: doc.qualifications || '',
        bio: doc.bio || '',
        rating: doc.rating || 0,
        reviews: doc.reviews || 0,
        avatar: doc.avatar || '',
        isAvailable: doc.isAvailable !== false,
        availability: doc.availability || '',
        licenseNumber: doc.licenseNumber || '',
        city: doc.city || '',
        gender: doc.gender || '',
        age: doc.age || null,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching doctor profile',
      error: error.message
    });
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile/me
// @access  Private (doctor only)
exports.updateDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can access this endpoint'
      });
    }
    
    // Fields that doctors are allowed to update
    const allowedFields = [
      'name', 'phone', 'specialization', 'experience', 'consultationFee',
      'hospital', 'qualifications', 'bio', 'availability', 'isAvailable',
      'licenseNumber', 'city', 'gender', 'age'
    ];
    
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== '') {
        updates[field] = req.body[field];
      }
    }
    
    // Parse numeric fields
    if (updates.experience) updates.experience = parseInt(updates.experience);
    if (updates.consultationFee) updates.consultationFee = parseInt(updates.consultationFee);
    if (updates.age) updates.age = parseInt(updates.age);
    
    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    
    console.log(`✅ Doctor profile updated: ${doctor.email}`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: doctor._id,
        id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        experience: doctor.experience || 0,
        consultationFee: doctor.consultationFee || 0,
        hospital: doctor.hospital || '',
        qualifications: doctor.qualifications || '',
        bio: doctor.bio || '',
        rating: doctor.rating || 0,
        reviews: doctor.reviews || 0,
        avatar: doctor.avatar || '',
        isAvailable: doctor.isAvailable !== false,
        availability: doctor.availability || '',
        licenseNumber: doctor.licenseNumber || '',
        city: doctor.city || '',
        gender: doctor.gender || '',
        age: doctor.age || null,
      }
    });
  } catch (error) {
    console.error('Update Doctor Profile Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating doctor profile',
      error: error.message
    });
  }
};

// @desc    Upload doctor avatar
// @route   POST /api/doctors/profile/avatar
// @access  Private (doctor only)
exports.uploadAvatar = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can access this endpoint'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }
    
    // Build the avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Delete old avatar file if it exists and is a local file
    const doctor = await User.findById(req.user.id);
    if (doctor.avatar && doctor.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', doctor.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    // Update user record
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatar: avatarUrl } },
      { new: true }
    ).select('-password');
    
    console.log(`✅ Avatar uploaded for doctor: ${updated.email} → ${avatarUrl}`);
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    console.error('Avatar Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: error.message
    });
  }
};

// @desc    Get available slots for a doctor
// @route   GET /api/doctors/:doctorId/slots
// @access  Private
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    // Mock available slots
    const availableSlots = [
      { time: '09:00', available: true },
      { time: '09:30', available: true },
      { time: '10:00', available: false },
      { time: '10:30', available: true },
      { time: '11:00', available: true },
      { time: '14:00', available: true },
      { time: '14:30', available: false },
      { time: '15:00', available: true },
      { time: '15:30', available: true },
      { time: '16:00', available: true },
    ];
    
    res.json({
      success: true,
      message: 'Available slots retrieved',
      data: availableSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
};

// @desc    Create appointment with doctor
// @route   POST /api/doctors/:doctorId/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, time, reason } = req.body;
    
    // Mock appointment creation
    const appointment = {
      id: `apt_${Date.now()}`,
      doctorId,
      patientId: req.user.id,
      patientName: req.user.name,
      date,
      time,
      reason: reason || 'General Checkup',
      status: 'confirmed',
      createdAt: new Date()
    };
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating appointment',
      error: error.message
    });
  }
};

module.exports = exports;
