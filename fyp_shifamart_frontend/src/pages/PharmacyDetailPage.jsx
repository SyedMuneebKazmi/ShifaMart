import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, MapPin, Clock, CheckCircle, Phone,
  ChevronRight, Pill, ShoppingCart, Package, Search, FileText
} from 'lucide-react';
import PublicNav from '@components/layout/PublicNav';
import useAuthStore from '@stores/authStore';
import { mockPharmacies } from '@mocks/mockPharmacies';
import pharmacyService from '@services/pharmacy';

const isObjectId = (s) => typeof s === 'string' && /^[a-f0-9]{24}$/i.test(s);

const PharmacyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medSearch, setMedSearch] = useState('');
  const [medCategory, setMedCategory] = useState('All');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      // If id looks like a real Mongo _id, try to fetch live data
      if (isObjectId(id)) {
        try {
          const [pharm, inv] = await Promise.all([
            pharmacyService.getById(id),
            pharmacyService.getInventory(id).catch(() => []),
          ]);
          if (cancelled) return;
          if (pharm) {
            setPharmacy(pharm);
            setMedicines(Array.isArray(inv) ? inv : []);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Failed to load pharmacy from backend:', err?.message);
        }
      }

      // Fallback: look up in mock data
      const found = mockPharmacies.find(p => p.id === id);
      if (!cancelled) {
        setPharmacy(found || null);
        setMedicines(found?.medicines || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const categories = useMemo(() => {
    const set = new Set(medicines.map(m => m.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const q = medSearch.trim().toLowerCase();
    return medicines.filter(m => {
      const matchQ = !q ||
        (m.name || '').toLowerCase().includes(q) ||
        (m.generic || '').toLowerCase().includes(q);
      const matchCat = medCategory === 'All' || m.category === medCategory;
      return matchQ && matchCat;
    });
  }, [medicines, medSearch, medCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <PublicNav />
        <div className="container-custom py-20 text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neutral-600">Loading pharmacy details...</p>
        </div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
        <PublicNav />
        <div className="container-custom py-20 text-center">
          <Pill className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Pharmacy Not Found</h2>
          <p className="text-neutral-600 mb-6">The pharmacy you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/pharmacies')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
            Browse Pharmacies
          </button>
        </div>
      </div>
    );
  }

  const isOpen = () => {
    const now = new Date();
    const hour = now.getHours();
    if (pharmacy.hours?.weekdays?.includes('24')) return true;
    return hour >= 8 && hour < 22;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <PublicNav />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-custom py-3 flex items-center gap-2 text-sm text-neutral-500">
          <button onClick={() => navigate('/')} className="hover:text-emerald-600 transition-colors">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate('/pharmacies')} className="hover:text-emerald-600 transition-colors">Pharmacies</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-800 font-medium truncate">{pharmacy.name}</span>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/pharmacies')}
          className="flex items-center gap-2 text-neutral-600 hover:text-emerald-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Pharmacies</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left: Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero Card */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="h-40 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
                <img
                  src={pharmacy.logo}
                  alt={pharmacy.name}
                  className="w-full h-full object-cover opacity-30 mix-blend-overlay"
                />
              </div>
              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row gap-6 -mt-16 mb-6">
                  <div className="relative">
                    <img
                      src={pharmacy.logo}
                      alt={pharmacy.name}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                    />
                    {pharmacy.verified && (
                      <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="pt-4 sm:pt-16 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-neutral-900">{pharmacy.name}</h1>
                      {pharmacy.verified && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full font-medium">Verified</span>
                      )}
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${isOpen() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isOpen() ? '● Open Now' : '● Closed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-neutral-800">{pharmacy.rating}</span>
                      <span className="text-sm text-neutral-500">({pharmacy.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Location & Contact</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Address</p>
                    <p className="font-semibold text-neutral-800">{pharmacy.address}</p>
                    <p className="text-sm text-neutral-500 mt-1">{pharmacy.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Contact</p>
                    <p className="font-semibold text-neutral-800">{pharmacy.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Operating Hours
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-neutral-800">Weekdays</p>
                    <p className="text-sm text-neutral-500">{pharmacy.hours.weekdays}</p>
                  </div>
                  <Clock className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-neutral-800">Weekend</p>
                    <p className="text-sm text-neutral-500">{pharmacy.hours.weekend}</p>
                  </div>
                  <Clock className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-emerald-800">Emergency</p>
                    <p className="text-sm text-emerald-600">{pharmacy.hours.emergency}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                Services Offered
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {pharmacy.services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-neutral-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Medicines */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Available Medicines
                  <span className="text-sm font-normal text-neutral-500">
                    ({filteredMedicines.length}{medicines.length !== filteredMedicines.length ? ` of ${medicines.length}` : ''})
                  </span>
                </h2>
              </div>

              {/* Search + Category */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search medicine by name or generic..."
                    value={medSearch}
                    onChange={(e) => setMedSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border-2 border-neutral-200 focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
                <select
                  value={medCategory}
                  onChange={(e) => setMedCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border-2 border-neutral-200 focus:border-emerald-500 outline-none bg-white text-sm font-medium cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {filteredMedicines.length === 0 ? (
                <div className="text-center py-10 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                  <Pill className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500 text-sm">
                    {medicines.length === 0
                      ? 'This pharmacy has not listed any medicines yet.'
                      : 'No medicines match your search.'}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredMedicines.map((med) => (
                    <div
                      key={med.id}
                      className="p-4 border border-neutral-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all bg-white"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-neutral-900 truncate">{med.name}</h4>
                          <p className="text-xs text-neutral-500 truncate">{med.generic}</p>
                        </div>
                        <span className="text-base font-bold text-emerald-700 whitespace-nowrap">
                          Rs. {med.price}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full font-medium">
                          {med.dosage}
                        </span>
                        {med.category && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                            {med.category}
                          </span>
                        )}
                        {med.prescriptionRequired && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Rx
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium ml-auto ${
                            med.inStock
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {med.inStock ? `In Stock (${med.stock})` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="sticky top-28 space-y-6 self-start">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Order Medicines</h3>
              <p className="text-sm text-neutral-500 mb-6">
                {isAuthenticated
                  ? `Welcome, ${user?.name?.split(' ')[0]}! Order medicines from ${pharmacy.name}.`
                  : `Register to order medicines and upload prescriptions at ${pharmacy.name}.`}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-neutral-500 mb-1">Stock</p>
                  <p className="font-bold text-blue-700 text-sm">{pharmacy.stockAvailability}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl text-center">
                  <p className="text-xs text-neutral-500 mb-1">Delivery</p>
                  <p className="font-bold text-purple-700 text-sm">{pharmacy.deliveryTime}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Fast home delivery</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Prescription upload support</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Verified &amp; licensed pharmacy</span>
                </div>
              </div>

              <button
                onClick={() => isAuthenticated
                  ? navigate('/patient/dashboard')
                  : navigate('/register')}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {isAuthenticated ? 'Order Medicines' : 'Get Started'}
              </button>

              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full mt-3 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                >
                  Sign In to Order
                </button>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-emerald-700 to-teal-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-3">Quick Info</h3>
              <div className="space-y-3 text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>Rated {pharmacy.rating}/5 by customers</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-200" />
                  <span>{pharmacy.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-200" />
                  <span>Stock: {pharmacy.stockAvailability}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-200" />
                  <span>Delivery in {pharmacy.deliveryTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetailPage;
