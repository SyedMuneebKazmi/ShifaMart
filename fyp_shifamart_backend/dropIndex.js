const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectMongoose } = require('./config/mongoConnection');

dotenv.config();

connectMongoose()
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Drop the users collection to remove old indexes
      await mongoose.connection.collection('users').drop();
      console.log('Dropped users collection (removed old indexes)');
      
      // Close connection
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
      process.exit(0);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });
