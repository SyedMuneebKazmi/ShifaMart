import api from './api';

const DEFAULT_LOGO =
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=200&fit=crop';

// Normalize a backend Pharmacy document into the shape the UI expects.
export const normalizePharmacy = (p) => {
  if (!p) return null;
  const id = p._id || p.id;
  return {
    id,
    _id: p._id,
    name: p.pharmacyName || p.name || 'Unnamed Pharmacy',
    location: p.city ? `${p.city}${p.province ? ', ' + p.province : ''}` : (p.location || ''),
    address: p.address || '',
    city: p.city || '',
    rating: typeof p.rating === 'number' ? p.rating : 4.5,
    reviewCount: p.reviews ?? p.reviewCount ?? 0,
    logo: p.storeImage || p.logo || DEFAULT_LOGO,
    phone: p.phoneNumber || p.phone || '',
    services: Array.isArray(p.services) && p.services.length
      ? p.services
      : ['Prescription Medicines', 'OTC Drugs', 'Home Delivery'],
    hours: p.hours || {
      weekdays: p.workingHours || '9:00 AM - 10:00 PM',
      weekend: p.workingHours || '10:00 AM - 9:00 PM',
      emergency: p.isOpen ? 'Open now - call for details' : 'Call for emergency service',
    },
    verified: p.isVerified ?? p.verified ?? false,
    stockAvailability: p.stockAvailability || (p.isOpen ? 'Very Good' : 'Good'),
    deliveryTime: p.deliveryTime || '30-45 minutes',
    isBackend: true,
  };
};

// Normalize inventory records into medicine cards used in the UI.
export const normalizeInventoryItem = (inv) => {
  if (!inv) return null;
  const med = inv.medicine || {};
  const stock = typeof inv.stock === 'number' ? inv.stock : 0;
  return {
    id: inv._id || `${inv.pharmacy}-${inv.medicine}`,
    name: inv.medicineName || med.name || 'Medicine',
    generic: inv.genericName || med.genericName || '',
    dosage: inv.dosage || med.dosage || '',
    category: med.category || 'Other',
    price: typeof inv.finalPrice === 'number' ? inv.finalPrice : (inv.price || 0),
    originalPrice: inv.price || 0,
    discount: inv.discount || 0,
    stock,
    inStock: stock > 0 && inv.isAvailable !== false,
    prescriptionRequired: ['Antibiotic', 'Antiviral', 'Antifungal'].includes(med.category),
  };
};

const pharmacyService = {
  getAll: async ({ city } = {}) => {
    const response = await api.get('/pharmacies/all', {
      params: city && city !== 'All Cities' ? { city } : {},
    });
    const list = response.data?.data || [];
    return list.map(normalizePharmacy);
  },

  getById: async (id) => {
    const response = await api.get(`/pharmacies/${id}`);
    return normalizePharmacy(response.data?.data);
  },

  getInventory: async (id, { search, inStockOnly, category } = {}) => {
    const response = await api.get(`/pharmacies/${id}/inventory`, {
      params: {
        ...(search ? { search } : {}),
        ...(inStockOnly ? { inStockOnly: 'true' } : {}),
        ...(category && category !== 'All' ? { category } : {}),
      },
    });
    const items = response.data?.data || [];
    return items.map(normalizeInventoryItem);
  },
};

export default pharmacyService;
