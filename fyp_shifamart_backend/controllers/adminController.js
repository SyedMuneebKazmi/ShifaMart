const User = require('../models/User');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by role if provided
    if (role) {
      query.role = role;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/stats
// @access  Admin
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPharmacies = await User.countDocuments({ role: 'pharmacy' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Get user growth data (last 7 months)
    const userGrowth = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextMonth }
      });
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      userGrowth.push({
        name: monthNames[date.getMonth()],
        users: count
      });
    }
    
    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalPharmacies,
        totalAdmins,
        userGrowth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// @desc    Get reports/activity logs
// @route   GET /api/admin/reports
// @access  Admin
exports.getReports = async (req, res) => {
  try {
    // Get recent user registrations
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Get active users (logged in within last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });
    
    // Get platform overview
    const roleDistribution = [
      {
        role: 'patients',
        count: await User.countDocuments({ role: 'patient' })
      },
      {
        role: 'doctors',
        count: await User.countDocuments({ role: 'doctor' })
      },
      {
        role: 'pharmacies',
        count: await User.countDocuments({ role: 'pharmacy' })
      },
      {
        role: 'admins',
        count: await User.countDocuments({ role: 'admin' })
      }
    ];
    
    res.json({
      success: true,
      message: 'Reports retrieved successfully',
      data: {
        recentUsers,
        activeUsers,
        roleDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

// @desc    Deactivate user account
// @route   PUT /api/admin/users/:id/deactivate
// @access  Admin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating user',
      error: error.message
    });
  }
};

// @desc    Activate user account
// @route   PUT /api/admin/users/:id/activate
// @access  Admin
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User activated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating user',
      error: error.message
    });
  }
};
