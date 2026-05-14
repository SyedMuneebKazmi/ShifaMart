/**
 * Complete System Test Suite
 * Tests all major API endpoints and features
 * Run: node test-complete-system.js
 */

require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const { connectMongoose } = require('./config/mongoConnection');

const API_URL = 'http://localhost:5000/api';

let testsPassed = 0;
let testsFailed = 0;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(title) {
  log(`\n▶ ${title}`, 'cyan');
}

function logSuccess(message) {
  testsPassed++;
  log(`  ✅ ${message}`, 'green');
}

function logError(message) {
  testsFailed++;
  log(`  ❌ ${message}`, 'red');
}

async function testDatabaseConnection() {
  logTest('1. Database Connection');
  try {
    await connectMongoose({ serverSelectionTimeoutMS: 5000 });
    logSuccess('Connected to MongoDB');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    logError(`Failed: ${error.message}`);
    return false;
  }
}

async function testHealthEndpoint() {
  logTest('2. Health Check Endpoint');
  try {
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status === 'ok') {
      logSuccess(`Health check passed: ${response.data.message}`);
      return true;
    }
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function testGetMedicines() {
  logTest('3. Get All Medicines');
  try {
    const response = await axios.get(`${API_URL}/medicines?limit=10`);
    
    if (response.data.success && response.data.data.length > 0) {
      logSuccess(`Retrieved ${response.data.total} medicines (showing ${response.data.data.length})`);
      
      const medicines = response.data.data.slice(0, 3);
      medicines.forEach(med => {
        log(`    • ${med.name} (${med.dosage}) - ${med.category}`, 'yellow');
      });
      return true;
    }
  } catch (error) {
    logError(`Failed to get medicines: ${error.message}`);
    return false;
  }
}

async function testGetPharmacies() {
  logTest('4. Get All Pharmacies');
  try {
    const response = await axios.get(`${API_URL}/pharmacies/all`);
    
    if (response.data.success && response.data.data.length > 0) {
      logSuccess(`Retrieved ${response.data.data.length} pharmacies`);
      
      response.data.data.forEach(pharm => {
        log(`    • ${pharm.pharmacyName} (${pharm.city}) - Rating: ${pharm.rating}⭐`, 'yellow');
      });
      return true;
    }
  } catch (error) {
    logError(`Failed to get pharmacies: ${error.message}`);
    return false;
  }
}

async function testPriceComparison() {
  logTest('5. Price Comparison - Panadol in Rawalpindi');
  try {
    const response = await axios.post(`${API_URL}/medicines/compare-prices`, {
      medicineName: 'Panadol Extra',
      city: 'Rawalpindi'
    });

    if (response.data.success) {
      logSuccess(`Found ${response.data.count} pharmacies selling ${response.data.medicineName}`);
      
      // Display results sorted by price
      response.data.data.forEach((item, index) => {
        log(`\n    ${index + 1}. ${item.pharmacyName}`, 'yellow');
        log(`       Price: Rs. ${item.price} ${item.discount > 0 ? `(-${item.discount}%)` : ''}`, 'yellow');
        log(`       Address: ${item.address}`, 'yellow');
        log(`       Distance: ${item.distance} | Stock: ${item.stock}`, 'yellow');
        log(`       Rating: ${item.rating}⭐ | Hours: ${item.workingHours}`, 'yellow');
      });
      
      return true;
    }
  } catch (error) {
    logError(`Price comparison failed: ${error.message}`);
    return false;
  }
}

async function testPriceComparisonIslamabad() {
  logTest('6. Price Comparison - Brufen in Islamabad');
  try {
    const response = await axios.post(`${API_URL}/medicines/compare-prices`, {
      medicineName: 'Brufen',
      city: 'Islamabad'
    });

    if (response.data.success) {
      logSuccess(`Found ${response.data.count} pharmacies selling Brufen in Islamabad`);
      
      response.data.data.slice(0, 2).forEach((item, index) => {
        log(`\n    ${index + 1}. ${item.pharmacyName} - Rs. ${item.price}`, 'yellow');
      });
      
      return true;
    }
  } catch (error) {
    logError(`Price comparison failed: ${error.message}`);
    return false;
  }
}

async function testDatabaseData() {
  logTest('7. Database Data Verification');
  try {
    await connectMongoose({ serverSelectionTimeoutMS: 5000 });
    
    const Pharmacy = require('./models/Pharmacy');
    const Medicine = require('./models/Medicine');
    const PharmacyInventory = require('./models/PharmacyInventory');
    
    const pharmacyCount = await Pharmacy.countDocuments();
    const medicineCount = await Medicine.countDocuments();
    const inventoryCount = await PharmacyInventory.countDocuments();
    
    logSuccess(`Pharmacies: ${pharmacyCount}`);
    logSuccess(`Medicines: ${medicineCount}`);
    logSuccess(`Inventory Records: ${inventoryCount}`);
    
    // Check inventory details
    const sampleInventory = await PharmacyInventory.find().limit(1).populate('pharmacy', 'pharmacyName').populate('medicine', 'name');
    if (sampleInventory.length > 0) {
      const inv = sampleInventory[0];
      logSuccess(`Sample Inventory: ${inv.medicine?.name} at ${inv.pharmacy?.pharmacyName} - Rs. ${inv.price}`);
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    logError(`Database verification failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log('║     ShifaMart+ Complete System Test Suite          ║', 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');
  
  // Wait for backend to be ready
  log('\n⏳ Waiting for backend to be ready...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Run tests
  await testDatabaseConnection();
  await testHealthEndpoint();
  await testGetMedicines();
  await testGetPharmacies();
  await testPriceComparison();
  await testPriceComparisonIslamabad();
  await testDatabaseData();

  // Summary
  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log(`║  Test Results: ${testsPassed} Passed | ${testsFailed} Failed  ${'                    '.substring(0, Math.max(0, 20 - String(testsPassed + testsFailed).length))}║`, 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');

  if (testsFailed === 0) {
    log('\n✨ All tests passed! System is working perfectly! ✨\n', 'green');
    process.exit(0);
  } else {
    log(`\n⚠️  ${testsFailed} test(s) failed. Please check the errors above.\n`, 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  logError(`Unexpected error: ${err.message}`);
  process.exit(1);
});
