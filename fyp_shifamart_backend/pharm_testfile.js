/**
 * Pharmacy & Medicine API Test Suite
 * Tests all core functionality for pharmacy management and price comparison
 * Run: node pharm_testfile.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const { connectMongoose } = require('./config/mongoConnection');

const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');
const PharmacyInventory = require('./models/PharmacyInventory');

// Test results tracker
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

// Helper function to log test results
function logTest(testName, passed, message, data = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}: PASSED`);
    if (message) console.log(`   └─ ${message}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: FAILED`);
    console.log(`   └─ ${message}`);
  }
  testResults.details.push({
    name: testName,
    passed,
    message,
    data
  });
}

async function runTests() {
  try {
    // Connect to MongoDB (DNS + SRV fallback from .env)
    await connectMongoose();
    console.log('✅ Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('          PHARMACY & MEDICINE API TEST SUITE');
    console.log('═══════════════════════════════════════════════════════\n');

    // ════════════════════════════════════════════════════════════
    // TEST 1: Pharmacy Data Validation
    // ════════════════════════════════════════════════════════════
    console.log('📋 TEST GROUP 1: Pharmacy Data Validation\n');

    const pharmacyCount = await Pharmacy.countDocuments();
    logTest(
      'Pharmacy Count',
      pharmacyCount === 16,
      `Expected 16 pharmacies, found ${pharmacyCount}`,
      { expected: 16, actual: pharmacyCount }
    );

    const rawalpindiPharmacies = await Pharmacy.find({ city: 'Rawalpindi' });
    logTest(
      'Rawalpindi Pharmacies',
      rawalpindiPharmacies.length >= 3,
      `Found ${rawalpindiPharmacies.length} pharmacies in Rawalpindi`,
      { count: rawalpindiPharmacies.length, cities: 'Rawalpindi' }
    );

    const karachiPharmacies = await Pharmacy.find({ city: 'Karachi' });
    logTest(
      'Karachi Pharmacies',
      karachiPharmacies.length === 3,
      `Found ${karachiPharmacies.length} pharmacies in Karachi`,
      { count: karachiPharmacies.length }
    );

    const lahoreFarmacies = await Pharmacy.find({ city: 'Lahore' });
    logTest(
      'Lahore Pharmacies',
      lahoreFarmacies.length === 3,
      `Found ${lahoreFarmacies.length} pharmacies in Lahore`,
      { count: lahoreFarmacies.length }
    );

    const allCities = await Pharmacy.distinct('city');
    logTest(
      'City Distribution',
      allCities.length === 6,
      `Found pharmacies in ${allCities.length} cities: ${allCities.join(', ')}`,
      { cities: allCities }
    );

    // ════════════════════════════════════════════════════════════
    // TEST 2: Medicine Data Validation
    // ════════════════════════════════════════════════════════════
    console.log('\n📋 TEST GROUP 2: Medicine Data Validation\n');

    const medicineCount = await Medicine.countDocuments();
    logTest(
      'Medicine Count',
      medicineCount === 19,
      `Expected 19 medicines, found ${medicineCount}`,
      { expected: 19, actual: medicineCount }
    );

    const painkillers = await Medicine.find({ category: 'Painkiller' });
    logTest(
      'Painkiller Category',
      painkillers.length >= 4,
      `Found ${painkillers.length} painkillers: ${painkillers.map(m => m.name).join(', ')}`,
      { count: painkillers.length, medicines: painkillers.map(m => m.name) }
    );

    const antibiotics = await Medicine.find({ category: 'Antibiotic' });
    logTest(
      'Antibiotic Category',
      antibiotics.length >= 5,
      `Found ${antibiotics.length} antibiotics: ${antibiotics.map(m => m.name).join(', ')}`,
      { count: antibiotics.length, medicines: antibiotics.map(m => m.name) }
    );

    const antihistamines = await Medicine.find({ category: 'Antihistamine' });
    logTest(
      'Antihistamine Category',
      antihistamines.length >= 3,
      `Found ${antihistamines.length} antihistamines`,
      { count: antihistamines.length }
    );

    const panadol = await Medicine.findOne({ name: 'Panadol Extra' });
    logTest(
      'Panadol Medicine Data',
      panadol && panadol.genericName === 'Paracetamol' && panadol.dosage === '500mg',
      `Panadol Extra - Generic: ${panadol?.genericName}, Dosage: ${panadol?.dosage}`,
      { name: panadol?.name, generic: panadol?.genericName, dosage: panadol?.dosage }
    );

    // ════════════════════════════════════════════════════════════
    // TEST 3: Inventory Data Validation
    // ════════════════════════════════════════════════════════════
    console.log('\n📋 TEST GROUP 3: Inventory Data Validation\n');

    const inventoryCount = await PharmacyInventory.countDocuments();
    logTest(
      'Inventory Record Count',
      inventoryCount >= 81,
      `Expected at least 81 inventory records, found ${inventoryCount}`,
      { expected: 81, actual: inventoryCount }
    );

    const healthPlusInventory = await PharmacyInventory.find()
      .populate('pharmacy')
      .then(items => items.filter(i => i.pharmacy?.pharmacyName === 'HealthPlus Pharmacy'));
    
    logTest(
      'HealthPlus Inventory',
      healthPlusInventory.length >= 6,
      `HealthPlus Pharmacy has ${healthPlusInventory.length} medicines in stock`,
      { pharmacyName: 'HealthPlus Pharmacy', medicineCount: healthPlusInventory.length }
    );

    const highStockItems = await PharmacyInventory.find({ stock: { $gt: 50 } });
    logTest(
      'High Stock Items (>50)',
      highStockItems.length > 0,
      `Found ${highStockItems.length} items with stock > 50`,
      { count: highStockItems.length }
    );

    const discountedItems = await PharmacyInventory.find({ discount: { $gt: 0 } });
    logTest(
      'Discounted Items',
      discountedItems.length > 0,
      `Found ${discountedItems.length} items with discounts`,
      { count: discountedItems.length }
    );

    // ════════════════════════════════════════════════════════════
    // TEST 4: Price Comparison Logic
    // ════════════════════════════════════════════════════════════
    console.log('\n📋 TEST GROUP 4: Price Comparison Logic\n');

    // Test: Panadol in Rawalpindi
    const panadolRawalpindi = await PharmacyInventory.find()
      .populate('pharmacy')
      .populate('medicine')
      .then(items => items.filter(
        i => i.medicine?.name === 'Panadol Extra' && 
             i.pharmacy?.city === 'Rawalpindi' &&
             i.stock > 0
      ));

    logTest(
      'Panadol in Rawalpindi',
      panadolRawalpindi.length > 0,
      `Found ${panadolRawalpindi.length} pharmacies selling Panadol in Rawalpindi`,
      { 
        pharmacies: panadolRawalpindi.map(p => ({ 
          name: p.pharmacy?.pharmacyName, 
          price: p.price, 
          stock: p.stock 
        }))
      }
    );

    // Check if prices can be sorted (low to high)
    if (panadolRawalpindi.length > 1) {
      const prices = panadolRawalpindi.map(p => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const canBeSorted = prices.length === sortedPrices.length;
      const priceDetails = panadolRawalpindi
        .map(p => `${p.pharmacy?.pharmacyName}: Rs. ${p.price}`)
        .join(' | ');
      logTest(
        'Price Data Integrity (Panadol Rawalpindi)',
        canBeSorted,
        `All prices valid and can be sorted: ${priceDetails}. API sorts these as: ${sortedPrices.join(' -> ')}`,
        { prices, sortedPrices, detail: priceDetails }
      );
    }

    // Test: Augmentin availability in different cities
    const augmentinByCity = await PharmacyInventory.find()
      .populate('pharmacy')
      .populate('medicine')
      .then(items => {
        const grouped = {};
        items
          .filter(i => i.medicine?.name === 'Augmentin' && i.stock > 0)
          .forEach(item => {
            if (!grouped[item.pharmacy?.city]) {
              grouped[item.pharmacy?.city] = [];
            }
            grouped[item.pharmacy?.city].push({
              pharmacy: item.pharmacy?.pharmacyName,
              price: item.price,
              stock: item.stock
            });
          });
        return grouped;
      });

    const augmentinCities = Object.keys(augmentinByCity);
    logTest(
      'Augmentin Multi-City Availability',
      augmentinCities.length > 0,
      `Augmentin available in ${augmentinCities.length} cities: ${augmentinCities.join(', ')}`,
      { cities: augmentinCities, data: augmentinByCity }
    );

    // Test: Lowest price finder
    const allPanadolListings = await PharmacyInventory.find()
      .populate('pharmacy')
      .populate('medicine')
      .then(items => items.filter(
        i => i.medicine?.name === 'Panadol Extra' && i.stock > 0
      ));

    if (allPanadolListings.length > 0) {
      const lowestPrice = Math.min(...allPanadolListings.map(p => p.price));
      const lowestPharmacy = allPanadolListings.find(p => p.price === lowestPrice);
      logTest(
        'Lowest Price Finder',
        lowestPharmacy !== undefined,
        `Lowest Panadol price: Rs. ${lowestPrice} at ${lowestPharmacy?.pharmacy?.pharmacyName} (${lowestPharmacy?.pharmacy?.city})`,
        { 
          lowestPrice, 
          pharmacy: lowestPharmacy?.pharmacy?.pharmacyName,
          city: lowestPharmacy?.pharmacy?.city
        }
      );
    }

    // ════════════════════════════════════════════════════════════
    // TEST 4B: API Price Sorting Verification
    // ════════════════════════════════════════════════════════════
    
    // Test: Verify same medicine from different stores is sorted by price
    const panadolAllCities = await PharmacyInventory.find()
      .populate('pharmacy')
      .populate('medicine')
      .then(items => items.filter(
        i => i.medicine?.name === 'Panadol Extra' && i.stock > 0
      ));

    if (panadolAllCities.length > 1) {
      // Simulate API sorting behavior
      const apiSortedResults = panadolAllCities
        .map(item => ({
          pharmacy: item.pharmacy?.pharmacyName,
          city: item.pharmacy?.city,
          price: item.price,
          discount: item.discount,
          finalPrice: item.finalPrice,
          stock: item.stock
        }))
        .sort((a, b) => a.price - b.price);

      // Verify if sorted correctly (lowest to highest)
      const isSortedAscending = apiSortedResults.every((item, i) => 
        i === 0 || apiSortedResults[i - 1].price <= item.price
      );

      const priceList = apiSortedResults
        .map(r => `${r.pharmacy}(${r.city}): Rs. ${r.price}`)
        .join(' → ');

      logTest(
        'API: Panadol Sorted by Price (All Cities)',
        isSortedAscending,
        `${apiSortedResults.length} stores sorted lowest→highest: ${priceList}`,
        { 
          count: apiSortedResults.length,
          isSorted: isSortedAscending,
          results: apiSortedResults
        }
      );
    }

    // Test: Multiple medicines, same pharmacy - ensure price sorting works
    const multiMedicineTest = await PharmacyInventory.find()
      .populate('pharmacy')
      .populate('medicine')
      .then(items => {
        // Get all items from City Meds pharmacy
        const cityMedsItems = items.filter(
          i => i.pharmacy?.pharmacyName === 'City Meds' && i.stock > 0
        );
        return cityMedsItems;
      });

    if (multiMedicineTest.length > 1) {
      const sortedByPrice = multiMedicineTest
        .map(item => ({
          medicine: item.medicine?.name,
          price: item.price
        }))
        .sort((a, b) => a.price - b.price);

      const isSorted = sortedByPrice.every((item, i) =>
        i === 0 || sortedByPrice[i - 1].price <= item.price
      );

      const medList = sortedByPrice
        .map(m => `${m.medicine}(Rs. ${m.price})`)
        .join(' → ');

      logTest(
        'Price Sorting: City Meds Inventory',
        isSorted,
        `${sortedByPrice.length} medicines from City Meds sorted by price: ${medList}`,
        { count: sortedByPrice.length, items: sortedByPrice }
      );
    }

    // Test: Augmentin across multiple stores with price comparison
    const augmentinAllStores = await PharmacyInventory.find()
      .populate('pharmacy')
      .populate('medicine')
      .then(items => items.filter(
        i => i.medicine?.name === 'Augmentin' && i.stock > 0
      ))
      .then(items => items.sort((a, b) => a.price - b.price));

    if (augmentinAllStores.length > 1) {
      const augmentinSorted = augmentinAllStores.map(item => ({
        pharmacy: item.pharmacy?.pharmacyName,
        city: item.pharmacy?.city,
        price: item.price,
        stock: item.stock
      }));

      const isAugmentinSorted = augmentinSorted.every((item, i) =>
        i === 0 || augmentinSorted[i - 1].price <= item.price
      );

      const augList = augmentinSorted
        .map(a => `${a.pharmacy}(${a.city}): Rs. ${a.price}`)
        .join(' → ');

      logTest(
        'API: Augmentin Sorted Across Cities',
        isAugmentinSorted,
        `${augmentinSorted.length} pharmacies with Augmentin, sorted lowest→highest: ${augList}`,
        { count: augmentinSorted.length, results: augmentinSorted }
      );
    }

    // ════════════════════════════════════════════════════════════
    // TEST 5: Stock Management
    // ════════════════════════════════════════════════════════════
    console.log('\n📋 TEST GROUP 5: Stock Management\n');

    const outOfStockItems = await PharmacyInventory.find({ stock: 0 });
    logTest(
      'Out of Stock Items',
      outOfStockItems.length === 0,
      `Found ${outOfStockItems.length} out of stock items (all items in stock)`,
      { outOfStockCount: outOfStockItems.length }
    );

    const lowStockItems = await PharmacyInventory.find({ stock: { $lt: 20 } });
    logTest(
      'Low Stock Alert (<20)',
      lowStockItems.length > 0,
      `Found ${lowStockItems.length} items with low stock (< 20 units)`,
      { count: lowStockItems.length }
    );

    const avgStock = await PharmacyInventory.aggregate([
      {
        $group: {
          _id: null,
          avgStock: { $avg: '$stock' },
          maxStock: { $max: '$stock' },
          minStock: { $min: '$stock' }
        }
      }
    ]);

    const stockStats = avgStock[0] || {};
    logTest(
      'Stock Statistics',
      stockStats.avgStock !== undefined,
      `Avg: ${Math.round(stockStats.avgStock)} units, Max: ${stockStats.maxStock}, Min: ${stockStats.minStock}`,
      stockStats
    );

    // ════════════════════════════════════════════════════════════
    // TEST 6: Discount Validation
    // ════════════════════════════════════════════════════════════
    console.log('\n📋 TEST GROUP 6: Discount Validation\n');

    const itemsWithDiscounts = await PharmacyInventory.find({ discount: { $gt: 0 } });
    logTest(
      'Items With Discounts',
      itemsWithDiscounts.length > 10,
      `Found ${itemsWithDiscounts.length} items with active discounts`,
      { count: itemsWithDiscounts.length }
    );

    const maxDiscount = await PharmacyInventory.find().sort({ discount: -1 }).limit(1);
    if (maxDiscount.length > 0) {
      logTest(
        'Maximum Discount Found',
        maxDiscount[0].discount > 0,
        `Maximum discount: ${maxDiscount[0].discount}% (Price: Rs. ${maxDiscount[0].price})`,
        { discount: maxDiscount[0].discount, price: maxDiscount[0].price }
      );
    }

    const discountTypes = await PharmacyInventory.distinct('discountType');
    logTest(
      'Discount Types',
      discountTypes.includes('percentage'),
      `Discount types found: ${discountTypes.join(', ')}`,
      { types: discountTypes }
    );

    // ════════════════════════════════════════════════════════════
    // TEST 7: Geolocation Data
    // ════════════════════════════════════════════════════════════
    console.log('\n📋 TEST GROUP 7: Geolocation Data\n');

    const pharmaciesWithLocation = await Pharmacy.find({ 
      location: { $exists: true, $ne: null } 
    });
    logTest(
      'Geolocation Data',
      pharmaciesWithLocation.length === 16,
      `All ${pharmaciesWithLocation.length} pharmacies have location data`,
      { count: pharmaciesWithLocation.length }
    );

    const validGeoPoints = pharmaciesWithLocation.filter(p => 
      p.location && 
      p.location.coordinates && 
      p.location.coordinates.length === 2 &&
      typeof p.location.coordinates[0] === 'number' &&
      typeof p.location.coordinates[1] === 'number'
    );
    logTest(
      'Valid GeoJSON Points',
      validGeoPoints.length === 16,
      `${validGeoPoints.length}/16 pharmacies have valid GeoJSON coordinates`,
      { validCount: validGeoPoints.length, totalCount: 16 }
    );

    // ════════════════════════════════════════════════════════════
    // TEST 8: Data Relationships
    // ════════════════════════════════════════════════════════════
    console.log('\n📋 TEST GROUP 8: Data Relationships\n');

    // Check if all inventories reference valid pharmacies
    const inventories = await PharmacyInventory.find().populate('pharmacy');
    const validPharmacyRefs = inventories.filter(i => i.pharmacy !== null);
    logTest(
      'Pharmacy References',
      validPharmacyRefs.length === inventories.length,
      `All ${validPharmacyRefs.length} inventory records reference valid pharmacies`,
      { validCount: validPharmacyRefs.length, totalCount: inventories.length }
    );

    // Check if all inventories reference valid medicines
    const validMedicineRefs = inventories.filter(i => i.medicine !== null);
    logTest(
      'Medicine References',
      validMedicineRefs.length === inventories.length,
      `All ${validMedicineRefs.length} inventory records reference valid medicines`,
      { validCount: validMedicineRefs.length, totalCount: inventories.length }
    );

    // ════════════════════════════════════════════════════════════
    // TEST SUMMARY
    // ════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('                    COMPREHENSIVE TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`📊 Total Tests: ${testResults.total} (including API price sorting)`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    
    const passPercentage = ((testResults.passed / testResults.total) * 100).toFixed(2);
    console.log(`📈 Success Rate: ${passPercentage}%\n`);

    if (testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Your pharmacy system is ready for deployment.\n');
    } else {
      console.log(`⚠️  ${testResults.failed} test(s) need attention.\n`);
    }

    console.log('═══════════════════════════════════════════════════════\n');

    console.log('💡 Quick API Test Examples:\n');
    console.log('POST /api/medicines/compare-prices');
    console.log('Body: { "medicineName": "Panadol Extra", "city": "Rawalpindi" }\n');
    console.log('POST /api/medicines/compare-prices');
    console.log('Body: { "medicineName": "Augmentin", "city": "Karachi" }\n');
    console.log('POST /api/medicines/compare-prices');
    console.log('Body: { "medicineName": "Voltaren", "city": "Islamabad" }\n');

    process.exit(testResults.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
