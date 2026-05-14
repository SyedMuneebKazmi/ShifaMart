/**
 * Seed Script for Pharmacies, Medicines, and Inventory
 * Run: node seedPharmacies.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const { connectMongoose } = require('./config/mongoConnection');

const User = require('./models/User');
const Pharmacy = require('./models/Pharmacy');
const Medicine = require('./models/Medicine');
const PharmacyInventory = require('./models/PharmacyInventory');

const pharmacyData = [
  // Rawalpindi (3)
  {
    name: 'HealthPlus Pharmacy',
    email: 'healthplus@pharmacy.com',
    city: 'Rawalpindi',
    address: 'G-10 Markaz, Rawalpindi',
    latitude: 33.5751,
    longitude: 74.3391
  },
  {
    name: 'City Meds',
    email: 'citymeds@pharmacy.com',
    city: 'Rawalpindi',
    address: 'Adiala Road, Rawalpindi',
    latitude: 33.5850,
    longitude: 74.3250
  },
  {
    name: 'MediCare Chemist',
    email: 'medicare@pharmacy.com',
    city: 'Rawalpindi',
    address: 'Chaklala, Rawalpindi',
    latitude: 33.5650,
    longitude: 74.3450
  },
  // Islamabad (3)
  {
    name: 'Islamabad Pharmacy',
    email: 'islamabad@pharmacy.com',
    city: 'Islamabad',
    address: 'F-10 Markaz, Islamabad',
    latitude: 33.7294,
    longitude: 73.1883
  },
  {
    name: 'Prime Care Medical',
    email: 'primecare@pharmacy.com',
    city: 'Islamabad',
    address: 'Blue Area, Islamabad',
    latitude: 33.7371,
    longitude: 73.1956
  },
  {
    name: 'Express Pharmacy Islamabad',
    email: 'express.islamabad@pharmacy.com',
    city: 'Islamabad',
    address: 'G-8/4, Islamabad',
    latitude: 33.7243,
    longitude: 73.2066
  },
  // Lahore (3)
  {
    name: 'Wellness Chemist',
    email: 'wellness@pharmacy.com',
    city: 'Lahore',
    address: 'Defense, Lahore',
    latitude: 31.5204,
    longitude: 74.3587
  },
  {
    name: 'ProHealth Pharmacy Lahore',
    email: 'prohealth.lahore@pharmacy.com',
    city: 'Lahore',
    address: 'Mall Road, Lahore',
    latitude: 31.5208,
    longitude: 74.3288
  },
  {
    name: 'United Pharmacy Lahore',
    email: 'united.lahore@pharmacy.com',
    city: 'Lahore',
    address: 'DHA Phase 5, Lahore',
    latitude: 31.4936,
    longitude: 74.4205
  },
  // Karachi (3)
  {
    name: 'Karachi Medical Store',
    email: 'karachi.medical@pharmacy.com',
    city: 'Karachi',
    address: 'Clifton, Karachi',
    latitude: 24.7898,
    longitude: 67.0270
  },
  {
    name: 'SafeRx Pharmacy Karachi',
    email: 'saferx.karachi@pharmacy.com',
    city: 'Karachi',
    address: 'Gulshan-e-Iqbal, Karachi',
    latitude: 24.8601,
    longitude: 67.1347
  },
  {
    name: 'Healing Touch Pharmacy',
    email: 'healingtouch@pharmacy.com',
    city: 'Karachi',
    address: 'Tariq Road, Karachi',
    latitude: 24.8433,
    longitude: 67.0372
  },
  // Peshawar (2)
  {
    name: 'Peshawar Health Center',
    email: 'peshawar.health@pharmacy.com',
    city: 'Peshawar',
    address: 'Hayatabad, Peshawar',
    latitude: 34.0205,
    longitude: 71.5788
  },
  {
    name: 'Pure Medicine Pharmacy',
    email: 'pure.medicine@pharmacy.com',
    city: 'Peshawar',
    address: 'Saddar Bazaar, Peshawar',
    latitude: 34.0165,
    longitude: 71.5683
  },
  // Multan (2)
  {
    name: 'Multan Pharmacy Plus',
    email: 'multan.plus@pharmacy.com',
    city: 'Multan',
    address: 'Chuna Mandi, Multan',
    latitude: 30.1948,
    longitude: 71.4246
  },
  {
    name: 'Quality Medicines Multan',
    email: 'quality.multan@pharmacy.com',
    city: 'Multan',
    address: 'Nishtar Road, Multan',
    latitude: 30.1842,
    longitude: 71.4297
  }
];

const medicineData = [
  // Painkillers
  {
    name: 'Panadol Extra',
    genericName: 'Paracetamol',
    dosage: '500mg',
    category: 'Painkiller',
    description: 'For relief from mild to moderate pain and fever',
    manufacturer: 'GlaxoSmithKline',
    sideEffects: ['Nausea', 'Allergic reactions']
  },
  {
    name: 'Brufen',
    genericName: 'Ibuprofen',
    dosage: '400mg',
    category: 'Painkiller',
    description: 'Anti-inflammatory pain reliever',
    manufacturer: 'Abbott',
    sideEffects: ['Stomach upset', 'Heartburn']
  },
  {
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    dosage: '75mg',
    category: 'Painkiller',
    description: 'Antiplatelet and pain relief',
    manufacturer: 'Bayer',
    sideEffects: ['Bleeding risk']
  },
  {
    name: 'Voltaren',
    genericName: 'Diclofenac',
    dosage: '50mg',
    category: 'Painkiller',
    description: 'Anti-inflammatory pain reliever',
    manufacturer: 'Novartis',
    sideEffects: ['Stomach upset', 'Dizziness']
  },
  // Antibiotics
  {
    name: 'Augmentin',
    genericName: 'Amoxicillin + Clavulanic Acid',
    dosage: '625mg',
    category: 'Antibiotic',
    description: 'Antibiotic for bacterial infections',
    manufacturer: 'Pfizer',
    sideEffects: ['Diarrhea', 'Rash']
  },
  {
    name: 'Amoxil',
    genericName: 'Amoxicillin',
    dosage: '500mg',
    category: 'Antibiotic',
    description: 'Broad-spectrum antibiotic',
    manufacturer: 'GSK',
    sideEffects: ['Allergic reactions']
  },
  {
    name: 'Flagyl',
    genericName: 'Metronidazole',
    dosage: '400mg',
    category: 'Antibiotic',
    description: 'For bacterial and protozoal infections',
    manufacturer: 'J&P',
    sideEffects: ['Metallic taste', 'Nausea']
  },
  {
    name: 'Cephalexin',
    genericName: 'Cephalexin',
    dosage: '500mg',
    category: 'Antibiotic',
    description: 'Cephalosporin antibiotic',
    manufacturer: 'Pfizer',
    sideEffects: ['Nausea', 'Diarrhea']
  },
  {
    name: 'Levofloxacin',
    genericName: 'Levofloxacin',
    dosage: '500mg',
    category: 'Antibiotic',
    description: 'Broad-spectrum fluoroquinolone antibiotic',
    manufacturer: 'Cipla',
    sideEffects: ['Nausea', 'Tendon pain']
  },
  // Antihistamines & Allergy Relief
  {
    name: 'Rigix',
    genericName: 'Cetirizine',
    dosage: '10mg',
    category: 'Antihistamine',
    description: 'Allergy relief. Non-drowsy formula',
    manufacturer: 'Sanofi',
    sideEffects: ['Mild drowsiness']
  },
  {
    name: 'Allegra',
    genericName: 'Fexofenadine',
    dosage: '180mg',
    category: 'Antihistamine',
    description: 'Fast-acting allergy relief',
    manufacturer: 'Sanofi',
    sideEffects: ['Headache', 'Drowsiness']
  },
  {
    name: 'Telfast',
    genericName: 'Fexofenadine',
    dosage: '120mg',
    category: 'Antihistamine',
    description: 'Non-drowsy antihistamine',
    manufacturer: 'Sanofi',
    sideEffects: ['Headache']
  },
  // Cough & Cold
  {
    name: 'Cough Syrup',
    genericName: 'Dextromethorphan',
    dosage: '10mg/5ml',
    category: 'Other',
    description: 'Cough suppressant',
    manufacturer: 'Reckitt',
    sideEffects: ['Drowsiness']
  },
  {
    name: 'Strepsils',
    genericName: 'Amylmetacresol + Dichlorobenzyl Alcohol',
    dosage: '1.2mg',
    category: 'Other',
    description: 'Throat lozenge for sore throat',
    manufacturer: 'Reckitt',
    sideEffects: ['None reported']
  },
  // Digestive & Anti-Diarrhea
  {
    name: 'Imodium',
    genericName: 'Loperamide',
    dosage: '2mg',
    category: 'Other',
    description: 'For diarrhea relief',
    manufacturer: 'Janssen',
    sideEffects: ['Constipation', 'Abdominal cramps']
  },
  {
    name: 'Gavison',
    genericName: 'Alginate',
    dosage: '500mg',
    category: 'Other',
    description: 'For heartburn and indigestion',
    manufacturer: 'Reckitt',
    sideEffects: ['Mild constipation']
  },
  // Vitamins & Supplements
  {
    name: 'Vitamin C 1000',
    genericName: 'Ascorbic Acid',
    dosage: '1000mg',
    category: 'Other',
    description: 'Immune system support',
    manufacturer: 'Various',
    sideEffects: ['None at normal doses']
  },
  {
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    dosage: '1000 IU',
    category: 'Other',
    description: 'Bone health and calcium absorption',
    manufacturer: 'Various',
    sideEffects: ['None at normal doses']
  },
  {
    name: 'Multivitamin Plus',
    genericName: 'Multivitamin & Mineral',
    dosage: 'Daily',
    category: 'Other',
    description: 'Complete daily nutrition',
    manufacturer: 'Wyeth',
    sideEffects: ['None reported']
  }
];

const inventoryData = [
  // Pharmacy 0: HealthPlus (Rawalpindi)
  { pharmacyIndex: 0, medicineIndex: 0, price: 150, stock: 50, discount: 5 },
  { pharmacyIndex: 0, medicineIndex: 1, price: 80, stock: 60, discount: 0 },
  { pharmacyIndex: 0, medicineIndex: 4, price: 90, stock: 25, discount: 5 },
  { pharmacyIndex: 0, medicineIndex: 9, price: 120, stock: 40, discount: 10 },
  { pharmacyIndex: 0, medicineIndex: 15, price: 250, stock: 20, discount: 0 },
  { pharmacyIndex: 0, medicineIndex: 17, price: 180, stock: 35, discount: 5 },
  
  // Pharmacy 1: City Meds (Rawalpindi)
  { pharmacyIndex: 1, medicineIndex: 0, price: 140, stock: 70, discount: 0 },
  { pharmacyIndex: 1, medicineIndex: 2, price: 110, stock: 45, discount: 15 },
  { pharmacyIndex: 1, medicineIndex: 5, price: 320, stock: 20, discount: 5 },
  { pharmacyIndex: 1, medicineIndex: 10, price: 150, stock: 35, discount: 0 },
  { pharmacyIndex: 1, medicineIndex: 13, price: 75, stock: 50, discount: 10 },
  
  // Pharmacy 2: MediCare (Rawalpindi)
  { pharmacyIndex: 2, medicineIndex: 0, price: 160, stock: 35, discount: 0 },
  { pharmacyIndex: 2, medicineIndex: 1, price: 85, stock: 50, discount: 0 },
  { pharmacyIndex: 2, medicineIndex: 4, price: 310, stock: 15, discount: 0 },
  { pharmacyIndex: 2, medicineIndex: 7, price: 280, stock: 25, discount: 5 },
  { pharmacyIndex: 2, medicineIndex: 14, price: 95, stock: 40, discount: 0 },
  
  // Pharmacy 3: Islamabad Pharmacy
  { pharmacyIndex: 3, medicineIndex: 0, price: 155, stock: 40, discount: 5 },
  { pharmacyIndex: 3, medicineIndex: 2, price: 125, stock: 35, discount: 0 },
  { pharmacyIndex: 3, medicineIndex: 9, price: 140, stock: 30, discount: 10 },
  { pharmacyIndex: 3, medicineIndex: 11, price: 200, stock: 22, discount: 0 },
  { pharmacyIndex: 3, medicineIndex: 16, price: 300, stock: 18, discount: 5 },
  
  // Pharmacy 4: Prime Care (Islamabad)
  { pharmacyIndex: 4, medicineIndex: 0, price: 145, stock: 55, discount: 0 },
  { pharmacyIndex: 4, medicineIndex: 3, price: 90, stock: 40, discount: 0 },
  { pharmacyIndex: 4, medicineIndex: 6, price: 200, stock: 30, discount: 5 },
  { pharmacyIndex: 4, medicineIndex: 10, price: 160, stock: 28, discount: 0 },
  { pharmacyIndex: 4, medicineIndex: 13, price: 85, stock: 45, discount: 5 },
  
  // Pharmacy 5: Express Pharmacy (Islamabad)
  { pharmacyIndex: 5, medicineIndex: 1, price: 82, stock: 55, discount: 0 },
  { pharmacyIndex: 5, medicineIndex: 4, price: 305, stock: 20, discount: 10 },
  { pharmacyIndex: 5, medicineIndex: 8, price: 290, stock: 25, discount: 0 },
  { pharmacyIndex: 5, medicineIndex: 12, price: 65, stock: 60, discount: 15 },
  { pharmacyIndex: 5, medicineIndex: 17, price: 190, stock: 32, discount: 0 },
  
  // Pharmacy 6: Wellness Chemist (Lahore)
  { pharmacyIndex: 6, medicineIndex: 0, price: 145, stock: 55, discount: 0 },
  { pharmacyIndex: 6, medicineIndex: 3, price: 90, stock: 40, discount: 0 },
  { pharmacyIndex: 6, medicineIndex: 6, price: 200, stock: 30, discount: 5 },
  { pharmacyIndex: 6, medicineIndex: 15, price: 260, stock: 19, discount: 0 },
  { pharmacyIndex: 6, medicineIndex: 18, price: 280, stock: 26, discount: 5 },
  
  // Pharmacy 7: ProHealth (Lahore)
  { pharmacyIndex: 7, medicineIndex: 0, price: 148, stock: 48, discount: 5 },
  { pharmacyIndex: 7, medicineIndex: 2, price: 115, stock: 42, discount: 0 },
  { pharmacyIndex: 7, medicineIndex: 5, price: 330, stock: 18, discount: 0 },
  { pharmacyIndex: 7, medicineIndex: 9, price: 130, stock: 38, discount: 5 },
  { pharmacyIndex: 7, medicineIndex: 14, price: 100, stock: 35, discount: 10 },
  
  // Pharmacy 8: United Pharmacy (Lahore)
  { pharmacyIndex: 8, medicineIndex: 1, price: 78, stock: 65, discount: 0 },
  { pharmacyIndex: 8, medicineIndex: 3, price: 88, stock: 45, discount: 5 },
  { pharmacyIndex: 8, medicineIndex: 7, price: 285, stock: 22, discount: 0 },
  { pharmacyIndex: 8, medicineIndex: 11, price: 210, stock: 20, discount: 5 },
  { pharmacyIndex: 8, medicineIndex: 16, price: 310, stock: 16, discount: 0 },
  
  // Pharmacy 9: Karachi Medical Store
  { pharmacyIndex: 9, medicineIndex: 0, price: 152, stock: 45, discount: 0 },
  { pharmacyIndex: 9, medicineIndex: 4, price: 315, stock: 18, discount: 5 },
  { pharmacyIndex: 9, medicineIndex: 6, price: 210, stock: 28, discount: 0 },
  { pharmacyIndex: 9, medicineIndex: 13, price: 80, stock: 48, discount: 5 },
  { pharmacyIndex: 9, medicineIndex: 17, price: 185, stock: 38, discount: 0 },
  
  // Pharmacy 10: SafeRx Pharmacy (Karachi)
  { pharmacyIndex: 10, medicineIndex: 1, price: 84, stock: 52, discount: 0 },
  { pharmacyIndex: 10, medicineIndex: 2, price: 120, stock: 40, discount: 10 },
  { pharmacyIndex: 10, medicineIndex: 5, price: 325, stock: 21, discount: 0 },
  { pharmacyIndex: 10, medicineIndex: 10, price: 155, stock: 32, discount: 5 },
  { pharmacyIndex: 10, medicineIndex: 15, price: 255, stock: 24, discount: 0 },
  
  // Pharmacy 11: Healing Touch (Karachi)
  { pharmacyIndex: 11, medicineIndex: 0, price: 158, stock: 38, discount: 5 },
  { pharmacyIndex: 11, medicineIndex: 3, price: 92, stock: 42, discount: 0 },
  { pharmacyIndex: 11, medicineIndex: 8, price: 295, stock: 23, discount: 0 },
  { pharmacyIndex: 11, medicineIndex: 12, price: 70, stock: 55, discount: 10 },
  { pharmacyIndex: 11, medicineIndex: 18, price: 290, stock: 20, discount: 5 },
  
  // Pharmacy 12: Peshawar Health Center
  { pharmacyIndex: 12, medicineIndex: 0, price: 150, stock: 50, discount: 5 },
  { pharmacyIndex: 12, medicineIndex: 2, price: 118, stock: 43, discount: 0 },
  { pharmacyIndex: 12, medicineIndex: 4, price: 320, stock: 19, discount: 0 },
  { pharmacyIndex: 12, medicineIndex: 9, price: 135, stock: 36, discount: 5 },
  { pharmacyIndex: 12, medicineIndex: 14, price: 98, stock: 42, discount: 0 },
  
  // Pharmacy 13: Pure Medicine (Peshawar)
  { pharmacyIndex: 13, medicineIndex: 1, price: 80, stock: 58, discount: 0 },
  { pharmacyIndex: 13, medicineIndex: 3, price: 87, stock: 48, discount: 5 },
  { pharmacyIndex: 13, medicineIndex: 7, price: 282, stock: 26, discount: 5 },
  { pharmacyIndex: 13, medicineIndex: 11, price: 205, stock: 24, discount: 0 },
  { pharmacyIndex: 13, medicineIndex: 16, price: 305, stock: 19, discount: 5 },
  
  // Pharmacy 14: Multan Pharmacy Plus
  { pharmacyIndex: 14, medicineIndex: 0, price: 154, stock: 42, discount: 0 },
  { pharmacyIndex: 14, medicineIndex: 5, price: 330, stock: 17, discount: 5 },
  { pharmacyIndex: 14, medicineIndex: 6, price: 205, stock: 32, discount: 0 },
  { pharmacyIndex: 14, medicineIndex: 13, price: 82, stock: 46, discount: 5 },
  { pharmacyIndex: 14, medicineIndex: 17, price: 188, stock: 36, discount: 0 },
  
  // Pharmacy 15: Quality Medicines (Multan)
  { pharmacyIndex: 15, medicineIndex: 1, price: 81, stock: 60, discount: 0 },
  { pharmacyIndex: 15, medicineIndex: 2, price: 122, stock: 38, discount: 5 },
  { pharmacyIndex: 15, medicineIndex: 8, price: 298, stock: 21, discount: 0 },
  { pharmacyIndex: 15, medicineIndex: 10, price: 165, stock: 29, discount: 0 },
  { pharmacyIndex: 15, medicineIndex: 15, price: 265, stock: 22, discount: 10 }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB (DNS + SRV fallback from .env)
    await connectMongoose();
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - remove if you want to preserve data)
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    await PharmacyInventory.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Check if pharmacies already exist
    const existingPharmacies = await Pharmacy.countDocuments();
    if (existingPharmacies > 0) {
      console.log(`⚠️  Database already has ${existingPharmacies} pharmacies. Skipping seed.`);
      process.exit(0);
    }

    // Create pharmacy users and pharmacies
    console.log('📝 Creating pharmacies...');
    const createdPharmacies = [];

    for (const pharmData of pharmacyData) {
      // Create user account for pharmacy
      let pharmacyUser = await User.findOne({ email: pharmData.email });

      if (!pharmacyUser) {
        pharmacyUser = await User.create({
          name: pharmData.name,
          email: pharmData.email,
          password: 'Pharmacy@123',
          phone: '03001234567',
          role: 'pharmacy',
          isActive: true,
          city: pharmData.city,
          location: {
            type: 'Point',
            coordinates: [parseFloat(pharmData.longitude), parseFloat(pharmData.latitude)]
          }
        });
        console.log(`  ✓ Created user: ${pharmData.name}`);
      }

      // Create pharmacy profile
      const pharmacy = await Pharmacy.create({
        owner: pharmacyUser._id,
        pharmacyName: pharmData.name,
        address: pharmData.address,
        city: pharmData.city,
        province: 'Punjab',
        phoneNumber: '03001234567',
        email: pharmData.email,
        workingHours: '8AM-11PM',
        location: {
          type: 'Point',
          coordinates: [parseFloat(pharmData.longitude), parseFloat(pharmData.latitude)]
        },
        licenseNumber: `LIC${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        isVerified: true,
        status: 'active',
        rating: 4.5,
        reviews: 10
      });

      createdPharmacies.push(pharmacy);
      console.log(`  ✓ Created pharmacy: ${pharmacy.pharmacyName}`);
    }

    // Create medicines
    console.log('💊 Creating medicines...');
    const createdMedicines = [];

    for (const medData of medicineData) {
      const medicine = await Medicine.create(medData);
      createdMedicines.push(medicine);
      console.log(`  ✓ Created medicine: ${medicine.name}`);
    }

    // Create inventory records
    console.log('📦 Creating inventory records...');
    const inventoryRecords = [];

    for (const invData of inventoryData) {
      try {
        const pharmacy = createdPharmacies[invData.pharmacyIndex];
        const medicine = createdMedicines[invData.medicineIndex];

        inventoryRecords.push({
          pharmacy: pharmacy._id,
          medicine: medicine._id,
          medicineName: medicine.name,
          genericName: medicine.genericName,
          dosage: medicine.dosage,
          price: invData.price,
          stock: invData.stock,
          discount: invData.discount || 0,
          discountType: 'percentage',
          batchNumber: `BATCH${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isAvailable: invData.stock > 0
        });
      } catch (invError) {
        console.error(`  ⚠️ Error preparing inventory record:`, invError.message);
      }
    }

    // Insert all inventory records at once
    if (inventoryRecords.length > 0) {
      await PharmacyInventory.insertMany(inventoryRecords, { ordered: false });
      console.log(`  ✓ Created ${inventoryRecords.length} inventory records`);
    }

    console.log('\n✅ ✅ ✅  Database seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   • Pharmacies created: ${createdPharmacies.length}`);
    console.log(`   • Medicines created: ${createdMedicines.length}`);
    console.log(`   • Inventory records: ${inventoryData.length}`);
    console.log(`\n💡 Test the API with:`);
    console.log(`   GET  /api/pharmacies/all`);
    console.log(`   GET  /api/medicines`);
    console.log(`   POST /api/medicines/compare-prices`);
    console.log(`   Body: { "medicineName": "Panadol", "city": "Rawalpindi" }`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
