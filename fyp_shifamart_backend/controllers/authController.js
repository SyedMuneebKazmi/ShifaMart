const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ─── Email helper ─────────────────────────────────────────────────────────────
const createTransporter = () => {
  // Works with Gmail App Passwords, Mailtrap, Brevo, etc.
  // Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS in .env
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Fallback: uses Gmail service shorthand
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  if (!process.env.EMAIL_USER && !process.env.SMTP_HOST) {
    // Dev fallback — just log the link so the app still works without SMTP config
    console.warn('⚠️  No SMTP config found. Password reset link (dev only):');
    console.warn(resetUrl);
    return;
  }
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@shifamart.com';
  await transporter.sendMail({
    from: `"ShifaMart+" <${from}>`,
    to: toEmail,
    subject: 'Password Reset Request – ShifaMart+',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-block;background:#2563eb;color:#fff;font-size:22px;font-weight:700;padding:10px 20px;border-radius:8px">S+</div>
          <h2 style="margin:16px 0 4px;color:#111827">Reset Your Password</h2>
          <p style="color:#6b7280;margin:0">ShifaMart+ Account Security</p>
        </div>
        <p style="color:#374151">Hi,</p>
        <p style="color:#374151">We received a request to reset the password for your ShifaMart+ account. Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Reset Password</a>
        </div>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px;text-align:center">© ${new Date().getFullYear()} ShifaMart+. All rights reserved.</p>
      </div>
    `,
  });
};

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender, bloodGroup, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists with this email' });

    // Build user data - only include optional enum fields if they have valid values
    const userData = {
      name,
      email,
      password,
      role: role || 'patient',
    };

    if (phone && phone.trim()) userData.phone = phone.trim();
    if (age && !isNaN(age)) userData.age = parseInt(age);
    if (gender && gender.trim()) userData.gender = gender.trim();
    if (bloodGroup && bloodGroup.trim()) userData.bloodGroup = bloodGroup.trim();

    // Doctor specific fields
    if (role === 'doctor') {
      const { licenseNumber, specialization, qualifications, experience, hospital, consultationFee } = req.body;
      if (licenseNumber) userData.licenseNumber = licenseNumber.trim();
      if (specialization) userData.specialization = specialization.trim();
      if (qualifications) userData.qualifications = qualifications.trim();
      if (experience) userData.experience = parseInt(experience);
      if (hospital) userData.hospital = hospital.trim();
      if (consultationFee) userData.consultationFee = parseInt(consultationFee);
    }

    const user = await User.create(userData);

    // Pharmacy specific creation
    if (role === 'pharmacy') {
      const { pharmacyName, licenseNumber, ownerName, address, city, landline, operatingHours } = req.body;
      
      await Pharmacy.create({
        owner: user._id,
        pharmacyName: pharmacyName || 'Unnamed Pharmacy',
        address: address || 'Address not provided',
        city: city || 'City not provided',
        location: {
          type: 'Point',
          coordinates: [74.3587, 31.5204] // Default to Lahore
        },
        phoneNumber: landline || phone || 'Phone not provided',
        email: email,
        licenseNumber: licenseNumber,
        workingHours: operatingHours || '9AM-10PM'
      });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log(`✅ New user registered: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to ShifaMart+',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    // Handle Mongoose validation errors nicely
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated' });

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        role: user.role,
        sessionId: user.sessionId,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token is required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({ success: true, token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+passwordResetToken +passwordResetExpires');

    // Always respond the same way to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate a secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    // Store hashed version in DB
    user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      console.log(`📧 Password reset email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message);
      // Clear the token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Failed to send reset email. Please try again.' });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Hash the incoming raw token to compare with the stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires +password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    console.log(`✅ Password reset successful for ${user.email}`);

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
