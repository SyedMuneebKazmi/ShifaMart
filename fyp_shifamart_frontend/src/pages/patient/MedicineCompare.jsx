import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Pill, Search, ShoppingCart, Bell, MapPin, AlertCircle, Star, Phone, CheckCircle, XCircle
} from 'lucide-react';
import medicineService from '@services/medicine';
import Card, { CardHeader, CardBody } from '@components/ui/Card';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';

const SORT_OPTIONS = [
  { value: 'price_desc', label: 'Price: High → Low, Nearest first' },
  { value: 'price_asc', label: 'Price: Low → High, Nearest first' },
  { value: 'distance', label: 'Distance: Nearest first' },
];

const MedicineCompare = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState(location.state?.medicines || []);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('price_desc');
  const [userCoords, setUserCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | requesting | ok | denied | unavailable
  const fetchedOnceRef = useRef(false);

  // Ask for patient geolocation once on mount (non-blocking).
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('unavailable');
      return;
    }
    setGeoStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoStatus('ok');
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  const fetchComparisons = useCallback(async () => {
    if (medicines.length === 0) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const names = medicines.map(m => m.name).filter(Boolean);
      const response = await medicineService.compareMulti(names, {
        ...(userCoords || {}),
        inStockOnly,
        sortBy,
      });
      const data = Array.isArray(response?.data) ? response.data : [];
      setResults(data);
      if (data.length === 0) {
        setError(`No pharmacy in the database stocks ${names.length > 1 ? 'any of these medicines' : `"${names[0]}"`}.`);
      }
    } catch (err) {
      console.error('Comparison failed:', err);
      setError(err?.response?.data?.message || 'Failed to fetch price comparisons. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [medicines, userCoords, inStockOnly, sortBy]);

  // Refetch whenever key inputs change
  useEffect(() => {
    // Only auto-fetch when we have medicines; debounced-ish by React batching
    if (medicines.length === 0) {
      setResults([]);
      return;
    }
    fetchedOnceRef.current = true;
    fetchComparisons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicines, inStockOnly, sortBy, userCoords]);

  const handleAddMedicine = (e) => {
    e.preventDefault();
    const name = searchQuery.trim();
    if (!name) return;
    if (!medicines.find(m => m.name.toLowerCase() === name.toLowerCase())) {
      setMedicines([...medicines, { id: Date.now(), name, dosage: 'N/A', quantity: 1 }]);
    }
    setSearchQuery('');
  };

  const removeMedicine = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const totalRequested = medicines.length;

  const availabilityVariant = (a) => {
    if (a === 'In Stock') return 'success';
    if (a === 'Partial') return 'warning';
    return 'danger';
  };

  const locationHint = useMemo(() => {
    if (geoStatus === 'requesting') return 'Getting your location…';
    if (geoStatus === 'ok') return 'Using your location to sort by distance';
    if (geoStatus === 'denied') return 'Location permission denied — distances unavailable';
    if (geoStatus === 'unavailable') return 'Geolocation not supported in this browser';
    return null;
  }, [geoStatus]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <Pill className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Compare Medicine Prices</h1>
          <p className="text-neutral-500">Search across every pharmacy in our database.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Medicine List + Filters */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Your Medicine List" />
            <CardBody>
              <form onSubmit={handleAddMedicine} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add medicine name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                  <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                    Add
                  </Button>
                </div>
              </form>

              {medicines.length > 0 ? (
                <div className="space-y-2">
                  {medicines.map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div>
                        <p className="font-medium text-neutral-900">{med.name}</p>
                        <p className="text-xs text-neutral-500">
                          {med.dosage && med.dosage !== 'N/A' ? `${med.dosage} • ` : ''}
                          Qty: {med.quantity || 1}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMedicine(med.id)}
                        className="text-neutral-400 hover:text-red-500 transition-colors text-xl leading-none"
                        aria-label={`Remove ${med.name}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  No medicines added yet. Add one above, or come from an uploaded prescription.
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Filters & Sort" />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="label-base">Sort by</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 focus:border-emerald-500 outline-none bg-white text-sm font-medium"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="stock-only"
                    type="checkbox"
                    className="rounded text-primary-500 focus:ring-primary-500"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <label htmlFor="stock-only" className="text-sm text-neutral-700">
                    Only pharmacies with all items in stock
                  </label>
                </div>

                {locationHint && (
                  <div className={`text-xs flex items-start gap-2 p-2 rounded-lg ${
                    geoStatus === 'ok'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-neutral-50 text-neutral-600'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{locationHint}</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Comparison Results */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-white rounded-xl shadow-sm animate-pulse" />
              ))}
            </div>
          ) : error && results.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">No results</h3>
              <p className="text-neutral-500 max-w-md mx-auto">{error}</p>
              {medicines.length > 0 && (
                <Button size="sm" variant="outline" className="mt-4" onClick={fetchComparisons}>
                  Try again
                </Button>
              )}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold text-neutral-900">{results.length}</span> pharmacies found
                </p>
                <p className="text-xs text-neutral-500">
                  Searching for {totalRequested} medicine{totalRequested !== 1 ? 's' : ''}
                </p>
              </div>

              {results.map((result) => {
                const items = Array.isArray(result.items) ? result.items : [];
                const matched = result.matchedCount ?? items.filter(i => i.matched).length;
                return (
                  <Card key={result.id || result.pharmacyId} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-neutral-900 truncate">
                              {result.pharmacyName || result.pharmacy}
                            </h3>
                            {result.isVerified && (
                              <Badge variant="success" size="sm">Verified</Badge>
                            )}
                            {typeof result.rating === 'number' && (
                              <span className="flex items-center gap-1 text-xs text-neutral-600">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                {result.rating}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-neutral-500 space-y-0.5">
                            {(result.address || result.city) && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                <span className="truncate">
                                  {[result.address, result.city].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-xs">
                              {result.distance && result.distance !== 'N/A' && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {result.distance}
                                </span>
                              )}
                              {result.phoneNumber && (
                                <a href={`tel:${result.phoneNumber}`} className="flex items-center gap-1 hover:text-emerald-600">
                                  <Phone className="w-3 h-3" /> {result.phoneNumber}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">
                            Rs. {Number(result.totalPrice ?? 0).toFixed(0)}
                          </div>
                          <p className="text-xs text-neutral-500">Total (in-stock items)</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {items.length === 0 ? (
                          <p className="text-sm text-neutral-500">No matching medicines at this pharmacy.</p>
                        ) : items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 p-2 rounded-lg bg-neutral-50 text-sm"
                          >
                            <div className="min-w-0 flex-1">
                              <p className={`font-medium truncate ${item.inStock ? 'text-neutral-800' : 'text-neutral-500'}`}>
                                {item.medicineName || item.requestedName}
                              </p>
                              {item.matched && (item.genericName || item.dosage) && (
                                <p className="text-xs text-neutral-500 truncate">
                                  {[item.genericName, item.dosage].filter(Boolean).join(' • ')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className={`font-semibold ${item.inStock ? 'text-neutral-900' : 'text-neutral-400'}`}>
                                {item.matched ? `Rs. ${Number(item.price || 0).toFixed(0)}` : '—'}
                              </span>
                              {item.matched && item.inStock ? (
                                <Badge variant="success" size="sm" dot className="w-24 justify-center">
                                  In Stock
                                </Badge>
                              ) : item.matched ? (
                                <Badge variant="danger" size="sm" dot className="w-24 justify-center">
                                  Out of Stock
                                </Badge>
                              ) : (
                                <Badge variant="neutral" size="sm" className="w-24 justify-center">
                                  Not Listed
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-100 gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={availabilityVariant(result.availability)}>
                            {result.availability === 'In Stock' ? (
                              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> All available</span>
                            ) : result.availability === 'Partial' ? (
                              <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Partial</span>
                            ) : (
                              <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Out of stock</span>
                            )}
                          </Badge>
                          <span className="text-xs text-neutral-500">
                            {matched}/{totalRequested} medicine{totalRequested !== 1 ? 's' : ''} available
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" leftIcon={<Bell className="w-4 h-4" />}>
                            Notify
                          </Button>
                          <Button size="sm" leftIcon={<ShoppingCart className="w-4 h-4" />}>
                            Order Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-neutral-200">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900">No comparisons yet</h3>
              <p className="text-neutral-500 max-w-sm mt-2">
                Add medicines to your list to see availability and prices from every pharmacy in our database.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicineCompare;
