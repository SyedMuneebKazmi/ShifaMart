// Fix script: drop the old broken 2dsphere index, then test registration
require('dotenv').config();
const mongoose = require('mongoose');
const { connectMongoose } = require('./config/mongoConnection');
const User = require('./models/User');

async function fixAndTest() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoose();
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Drop the old problematic 2dsphere index
    console.log('\n--- Step 1: Dropping old location index ---');
    try {
      const indexes = await User.collection.indexes();
      console.log('Current indexes:', indexes.map(i => i.name + ' (' + JSON.stringify(i.key) + ')'));
      
      // Find and drop any location_2dsphere index
      const geoIndex = indexes.find(i => i.key && i.key['location'] === '2dsphere');
      if (geoIndex) {
        console.log('Dropping index:', geoIndex.name);
        await User.collection.dropIndex(geoIndex.name);
        console.log('✅ Old index dropped');
      } else {
        console.log('No 2dsphere index found to drop');
      }
    } catch (e) {
      console.log('Index drop note:', e.message);
    }

    // Step 2: Ensure the new sparse index is created
    console.log('\n--- Step 2: Ensuring new sparse index ---');
    await User.ensureIndexes();
    console.log('✅ Indexes rebuilt');

    // Step 3: Test registration
    console.log('\n--- Step 3: Testing user creation ---');
    const testEmail = 'test_fix_' + Date.now() + '@example.com';
    const userData = {
      name: 'Test Fix User',
      email: testEmail,
      password: 'Test1234',
      role: 'patient',
      age: 26,
      gender: 'male',
      bloodGroup: 'B-',
    };
    
    console.log('Creating user:', testEmail);
    const user = await User.create(userData);
    console.log('✅ USER CREATED SUCCESSFULLY!');
    console.log('User ID:', user._id);
    console.log('User name:', user.name);
    console.log('User role:', user.role);
    
    // Clean up test user
    await User.deleteOne({ _id: user._id });
    console.log('✅ Test user cleaned up');
    
    console.log('\n🎉 FIX CONFIRMED — Registration will now work!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

fixAndTest();
