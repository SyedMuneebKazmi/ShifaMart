// Server entry point - ShifaMart+ Backend
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { connectMongoose } = require('./config/mongoConnection');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ShifaMart+ Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Import and use routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const startServer = () => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
    console.log(`Python AI API: ${process.env.PYTHON_API_URL || 'http://localhost:8000'}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Database connection
connectMongoose()
  .then(() => {
    console.log('MongoDB Connected Successfully');
    startServer();
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
    console.error('If you use Atlas and see SRV DNS errors, set DNS_SERVERS or MONGODB_URI_FALLBACK in .env');
    process.exit(1);
  });
