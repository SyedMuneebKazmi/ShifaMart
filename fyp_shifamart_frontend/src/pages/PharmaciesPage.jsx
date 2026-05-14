import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Star, MapPin, Clock, CheckCircle, ChevronDown, X, Pill, Phone
} from 'lucide-react';
import PublicNav from '@components/layout/PublicNav';
import { mockPharmacies } from '@mocks/mockPharmacies';
import pharmacyService from '@services/pharmacy';

const CITIES = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan', 'Peshawar'];

const PharmaciesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [sortBy, setSortBy] = useState('rating');
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await pharmacyService.getAll();
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          setPharmacies(data);
          setUsingFallback(false);
        } else {
          setPharmacies(mockPharmacies);
          setUsingFallback(true);
        }
      } catch (err) {
        console.error('Failed to load pharmacies from backend, using mock data:', err?.message);
        if (!cancelled) {
          setPharmacies(mockPharmacies);
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return pharmacies
      .filter(p => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
          (p.name || '').toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q) ||
          (p.city || '').toLowerCase().includes(q) ||
          (p.services || []).some(s => s.toLowerCase().includes(q));
        const matchCity = selectedCity === 'All Cities' ||
          (p.location || '').includes(selectedCity) ||
          (p.city || '').toLowerCase() === selectedCity.toLowerCase();
        return matchSearch && matchCity;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
        if (sortBy === 'delivery') return (a.deliveryTime || '').localeCompare(b.deliveryTime || '');
        return 0;
      });
  }, [pharmacies, searchQuery, selectedCity, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <PublicNav />

      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm text-sm font-medium">
            <Pill className="w-4 h-4" />
            <span>Verified & Trusted Pharmacies</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Find a Pharmacy</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Discover verified pharmacies near you with competitive prices, fast delivery, and quality service you can trust.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-emerald-100">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-300" /> All Verified</span>
            <span>•</span>
            <span>{pharmacies.length}+ Pharmacies</span>
            <span>•</span>
            <span>Fast Delivery</span>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-md shadow-md border-b border-neutral-100">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, location, or service..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-neutral-400 hover:text-neutral-700" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-neutral-200 focus:border-emerald-500 outline-none bg-white font-medium cursor-pointer"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-neutral-200 focus:border-emerald-500 outline-none bg-white font-medium cursor-pointer"
              >
                <option value="rating">Sort: Top Rated</option>
                <option value="reviews">Sort: Most Reviews</option>
                <option value="delivery">Sort: Delivery Time</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>

            <div className="text-sm text-neutral-500 whitespace-nowrap">
              <span className="font-semibold text-neutral-800">{filtered.length}</span> pharmacies found
            </div>
          </div>
        </div>
      </section>

      {/* Pharmacies Grid */}
      <section className="py-12">
        <div className="container-custom">
          {usingFallback && !loading && (
            <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
              Showing sample pharmacies (live data unavailable). Please make sure the backend is running.
            </div>
          )}
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-neutral-600">Loading pharmacies...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Pill className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No pharmacies found</h3>
              <p className="text-neutral-500">Try adjusting your search or location filter</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCity('All Cities'); }}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((pharmacy, index) => (
                <div
                  key={pharmacy.id}
                  className="card card-hover cursor-pointer transform transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up"
                  style={{ animationDelay: `${(index % 8) * 60}ms` }}
                  onClick={() => navigate(`/pharmacies/${pharmacy.id}`)}
                >
                  {/* Image */}
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={pharmacy.logo}
                      alt={pharmacy.name}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {pharmacy.verified && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs font-semibold">Verified</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">{pharmacy.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 mb-1">{pharmacy.name}</h3>
                  <p className="text-xs text-neutral-500 mb-3">({pharmacy.reviewCount} reviews)</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-xs text-neutral-600">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{pharmacy.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <Clock className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                      <span>Delivery: {pharmacy.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <Phone className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                      <span>{pharmacy.phone}</span>
                    </div>
                  </div>

                  {/* Services Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pharmacy.services.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">{s}</span>
                    ))}
                    {pharmacy.services.length > 2 && (
                      <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">+{pharmacy.services.length - 2}</span>
                    )}
                  </div>

                  <div className="mb-4 px-3 py-2 bg-emerald-50 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-neutral-600">Stock</span>
                    <span className="text-xs font-semibold text-emerald-700">{pharmacy.stockAvailability}</span>
                  </div>

                  <button className="w-full btn-base py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-br from-emerald-700 to-teal-600 text-white text-center">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-4">Order Medicines Online</h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">Register to upload prescriptions, compare prices, and get medicines delivered to your door.</p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default PharmaciesPage;
