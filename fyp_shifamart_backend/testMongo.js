const mongoose = require('mongoose');
require('dotenv').config();
const { connectMongoose } = require('./config/mongoConnection');

console.log('Attempting to connect to MongoDB...');
console.log('URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'NOT SET');

connectMongoose()
  .then(() => {
    console.log('MongoDB Connected!');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB Connection Failed:');
    console.error(err.message);
    process.exit(1);
  });

// Timeout after 10 seconds
setTimeout(() => {
  console.error('Connection timeout');
  process.exit(1);
}, 10000);
