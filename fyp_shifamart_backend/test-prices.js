require('dotenv').config();
const mongoose = require('mongoose');
const { connectMongoose } = require('./config/mongoConnection');
const Pharmacy = require('./models/Pharmacy');
const PharmacyInventory = require('./models/PharmacyInventory');
const { getPakistaniCityCoordinates, geoJSONToCoordinates } = require('./utils/geolocation');

(async () => {
  try {
    await connectMongoose();
    console.log('✓ Connected to MongoDB');

    const city = 'Rawalpindi';
    const medicineName = 'Panadol Extra';

    // Test 1: Get city coordinates
    const userCoords = getPakistaniCityCoordinates(city);
    console.log('✓ User coords:', userCoords);

    // Test 2: Find pharmacies
    const pharmacies = await Pharmacy.find({
      city: { $regex: city, $options: 'i' },
      status: 'active'
    });
    console.log('✓ Pharmacies found:', pharmacies.length);
    pharmacies.forEach(p => {
      console.log(`  - ${p.pharmacyName}`);
      console.log(`    Location:`, p.location);
      if (p.location) {
        const coords = geoJSONToCoordinates(p.location);
        console.log(`    Coords:`, coords);
      }
    });

    // Test 3: Find inventory
    const pharmacyIds = pharmacies.map(p => p._id);
    const inventory = await PharmacyInventory.find({
      pharmacy: { $in: pharmacyIds },
      medicineName: { $regex: medicineName, $options: 'i' },
      stock: { $gt: 0 },
      isAvailable: true
    }).populate('pharmacy', 'pharmacyName location');

    console.log('✓ Inventory records found:', inventory.length);
    inventory.forEach(inv => {
      console.log(`  - ${inv.medicine}: ${inv.price} PKR (pharmacy: ${inv.pharmacy?.pharmacyName})`);
      console.log(`    Pharmacy location:`, inv.pharmacy?.location);
    });

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
})();
