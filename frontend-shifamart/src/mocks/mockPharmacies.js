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
    deliveryTime: '30-45 minutes'
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
    deliveryTime: '45-60 minutes'
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
    deliveryTime: '20-30 minutes'
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
    deliveryTime: '40-50 minutes'
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
    deliveryTime: '25-35 minutes'
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
    deliveryTime: '35-45 minutes'
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
    deliveryTime: '50-60 minutes'
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
    deliveryTime: '30-40 minutes'
  }
];
