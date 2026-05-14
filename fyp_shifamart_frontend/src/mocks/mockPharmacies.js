// Common medicine catalog pharmacies pull from (with per-pharmacy price & stock variation)
const MED_POOL = [
  { name: 'Panadol Extra',      generic: 'Paracetamol + Caffeine', dosage: '500mg',        category: 'Pain Relief' },
  { name: 'Brufen',             generic: 'Ibuprofen',              dosage: '400mg',        category: 'Pain Relief' },
  { name: 'Augmentin 625mg',    generic: 'Amoxicillin + Clavulanate', dosage: '625mg',     category: 'Antibiotic' },
  { name: 'Calpol',             generic: 'Paracetamol',            dosage: '120mg/5ml Syrup', category: 'Pediatric' },
  { name: 'Risek',              generic: 'Omeprazole',             dosage: '20mg',         category: 'Gastric' },
  { name: 'Glucophage',         generic: 'Metformin',              dosage: '500mg',        category: 'Diabetes' },
  { name: 'Loprin',             generic: 'Aspirin',                dosage: '75mg',         category: 'Cardiovascular' },
  { name: 'Ventolin Inhaler',   generic: 'Salbutamol',             dosage: '100mcg',       category: 'Respiratory' },
  { name: 'Cac-1000 Plus',      generic: 'Calcium + Vitamin D3',   dosage: '1000mg',       category: 'Supplement' },
  { name: 'Arinac Forte',       generic: 'Ibuprofen + Pseudoephedrine', dosage: '400mg/60mg', category: 'Flu & Cold' },
  { name: 'Flagyl',             generic: 'Metronidazole',          dosage: '400mg',        category: 'Antibiotic' },
  { name: 'Nexum',              generic: 'Esomeprazole',           dosage: '40mg',         category: 'Gastric' },
  { name: 'Disprin',            generic: 'Aspirin',                dosage: '325mg',        category: 'Pain Relief' },
  { name: 'Zyrtec',             generic: 'Cetirizine',             dosage: '10mg',         category: 'Allergy' },
  { name: 'Hydryllin Syrup',    generic: 'Diphenhydramine',        dosage: '120ml',        category: 'Cough' },
];

// Builds a pharmacy-specific medicines list: picks N from the pool with price/stock variance
const buildMedicines = (seed, count = 10) => {
  const rnd = (n) => Math.floor((Math.abs(Math.sin(seed * 9301 + n * 49297)) * 233280) % 1000);
  return MED_POOL.slice(0, count).map((m, i) => {
    const basePrice = 60 + ((rnd(i + 1) % 650));
    const stock = rnd(i + 7) % 200;
    return {
      id: `${seed}-med-${i + 1}`,
      name: m.name,
      generic: m.generic,
      dosage: m.dosage,
      category: m.category,
      price: basePrice,
      stock,
      inStock: stock > 0,
      prescriptionRequired: ['Antibiotic', 'Diabetes', 'Cardiovascular', 'Respiratory'].includes(m.category),
    };
  });
};

export const mockPharmacies = [
  {
    id: 'pharm-1',
    name: 'HealthPlus Pharmacy',
    location: 'Gulberg, Lahore',
    address: 'Plot 45, Main Boulevard, Gulberg III, Lahore',
    rating: 4.8,
    reviewCount: 342,
    logo: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=200&fit=crop',
    phone: '+92-42-35714321',
    services: ['Prescription Medicines', 'OTC Drugs', 'Medical Devices', 'Home Delivery', 'Online Ordering'],
    hours: {
      weekdays: '8:00 AM - 11:00 PM',
      weekend: '9:00 AM - 10:00 PM',
      emergency: '24/7 Emergency Service Available'
    },
    verified: true,
    stockAvailability: 'Excellent',
    deliveryTime: '30-45 minutes',
    medicines: buildMedicines(1, 12)
  },
  {
    id: 'pharm-2',
    name: 'MediCare Chemist',
    location: 'DHA Phase 5, Karachi',
    address: 'Shop 12, Zamzama Commercial, DHA Phase 5, Karachi',
    rating: 4.7,
    reviewCount: 289,
    logo: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop',
    phone: '+92-21-35829456',
    services: ['Prescription Medicines', 'Health Supplements', 'Baby Care', 'Free Consultation', 'Insurance Claims'],
    hours: {
      weekdays: '9:00 AM - 10:00 PM',
      weekend: '10:00 AM - 9:00 PM',
      emergency: 'Emergency contact: +92-21-35829999'
    },
    verified: true,
    stockAvailability: 'Very Good',
    deliveryTime: '45-60 minutes',
    medicines: buildMedicines(2, 10)
  },
  {
    id: 'pharm-3',
    name: 'Sehat Pharmacy',
    location: 'F-7 Markaz, Islamabad',
    address: 'Shop 34, Super Market, F-7 Markaz, Islamabad',
    rating: 4.9,
    reviewCount: 412,
    logo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop',
    phone: '+92-51-2651234',
    services: ['Prescription Medicines', 'Diabetic Care', 'Surgical Equipment', 'Lab Tests', 'Vaccination'],
    hours: {
      weekdays: '8:00 AM - 12:00 AM',
      weekend: '24 Hours',
      emergency: 'Open 24/7 on Weekends'
    },
    verified: true,
    stockAvailability: 'Excellent',
    deliveryTime: '20-30 minutes',
    medicines: buildMedicines(3, 15)
  },
  {
    id: 'pharm-4',
    name: 'CureWell Drugstore',
    location: 'Johar Town, Lahore',
    address: 'Block H-2, Commercial Area, Johar Town, Lahore',
    rating: 4.6,
    reviewCount: 256,
    logo: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=200&h=200&fit=crop',
    phone: '+92-42-35311789',
    services: ['Prescription Medicines', 'Generic Medicines', 'Herbal Products', 'Cosmetics', 'Home Delivery'],
    hours: {
      weekdays: '9:00 AM - 11:00 PM',
      weekend: '10:00 AM - 10:00 PM',
      emergency: 'Call for emergency service'
    },
    verified: true,
    stockAvailability: 'Good',
    deliveryTime: '40-50 minutes',
    medicines: buildMedicines(4, 9)
  },
  {
    id: 'pharm-5',
    name: 'Life Care Pharmacy',
    location: 'Clifton, Karachi',
    address: 'Block 5, Main Clifton Road, Karachi',
    rating: 4.8,
    reviewCount: 378,
    logo: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&h=200&fit=crop',
    phone: '+92-21-35873214',
    services: ['Prescription Medicines', 'Compounding', 'Medical Equipment', 'Respiratory Care', 'Insurance'],
    hours: {
      weekdays: '24 Hours',
      weekend: '24 Hours',
      emergency: 'Always Open - 24/7 Service'
    },
    verified: true,
    stockAvailability: 'Excellent',
    deliveryTime: '25-35 minutes',
    medicines: buildMedicines(5, 14)
  },
  {
    id: 'pharm-6',
    name: 'Wellness Pharmacy',
    location: 'Bahria Town, Rawalpindi',
    address: 'Phase 4, Civic Centre, Bahria Town, Rawalpindi',
    rating: 4.7,
    reviewCount: 298,
    logo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop',
    phone: '+92-51-5748921',
    services: ['Prescription Medicines', 'Health Screening', 'Nutrition Counseling', 'Chronic Disease Management'],
    hours: {
      weekdays: '8:00 AM - 10:00 PM',
      weekend: '9:00 AM - 9:00 PM',
      emergency: 'Emergency hotline: +92-51-5748900'
    },
    verified: true,
    stockAvailability: 'Very Good',
    deliveryTime: '35-45 minutes',
    medicines: buildMedicines(6, 11)
  },
  {
    id: 'pharm-7',
    name: 'Quick Meds Pharmacy',
    location: 'Saddar, Karachi',
    address: 'Shop 89, Empress Market, Saddar, Karachi',
    rating: 4.5,
    reviewCount: 201,
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&h=200&fit=crop',
    phone: '+92-21-32278654',
    services: ['Prescription Medicines', 'OTC Products', 'First Aid Supplies', 'Quick Delivery'],
    hours: {
      weekdays: '9:00 AM - 11:00 PM',
      weekend: '10:00 AM - 10:00 PM',
      emergency: 'Call for after-hours service'
    },
    verified: true,
    stockAvailability: 'Good',
    deliveryTime: '50-60 minutes',
    medicines: buildMedicines(7, 8)
  },
  {
    id: 'pharm-8',
    name: 'Family Health Pharmacy',
    location: 'Model Town, Lahore',
    address: 'Link Road, Block B, Model Town, Lahore',
    rating: 4.8,
    reviewCount: 325,
    logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=200&h=200&fit=crop',
    phone: '+92-42-35872341',
    services: ['Prescription Medicines', 'Family Planning', 'Elder Care', 'Pediatric Medicines', 'Free Home Delivery'],
    hours: {
      weekdays: '8:30 AM - 11:30 PM',
      weekend: '9:00 AM - 11:00 PM',
      emergency: '24/7 WhatsApp orders: +92-300-1234567'
    },
    verified: true,
    stockAvailability: 'Excellent',
    deliveryTime: '30-40 minutes',
    medicines: buildMedicines(8, 13)
  }
];
