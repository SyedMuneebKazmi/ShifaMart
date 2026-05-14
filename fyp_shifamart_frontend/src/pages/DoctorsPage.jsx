import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Star, Award, MapPin, Clock, ChevronDown, X, Stethoscope,
  Wallet, Scale, Check, SlidersHorizontal, RotateCcw
} from 'lucide-react';
import PublicNav from '@components/layout/PublicNav';
import doctorService from '@services/doctor';
import { mockDoctors } from '@mocks/mockDoctors';

// Must match the specialist `name` values the AI agent returns in
// recommended_specialist.name (see specialist_mapper.py SPECIALISTS map)
// so that AI-chat deep-links via ?specialty=... resolve to a real filter.
const SPECIALTIES = [
  'All',
  'General Physician',
  'Pediatrician',
  'Cardiologist',
  'Dermatologist',
  'Gastroenterologist',
  'Neurologist',
  'Orthopedic Surgeon',
  'Pulmonologist',
  'Endocrinologist',
  'Gynecologist',
  'Urologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Psychiatrist',
  'Hepatologist',
  'Nephrologist',
  'Oncologist',
  'Rheumatologist',
  'Infectious Disease Specialist',
  'Allergist/Immunologist',
  'Hematologist',
];

// Pakistani cities commonly available; "All" means no filter.
const CITIES = [
  'All', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Hyderabad', 'Sialkot'
];

// Fee presets (PKR). Inclusive ranges; null = open-ended.
const FEE_PRESETS = [
  { label: 'Any Fee', min: 0, max: null },
  { label: 'Under 2K', min: 0, max: 2000 },
  { label: '2K - 3K', min: 2000, max: 3000 },
  { label: '3K - 5K', min: 3000, max: 5000 },
  { label: '5K+', min: 5000, max: null },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'fee_asc', label: 'Fee: Low → High' },
  { value: 'fee_desc', label: 'Fee: High → Low' },
  { value: 'experience', label: 'Most Experienced' },
];

const MAX_COMPARE = 4;

// Resolve a query-param specialty value (which may come from the AI chat,
// e.g. "general_physician", "General Physician", "orthopedic") to a label
// present in the SPECIALTIES list above. Returns 'All' if not resolvable.
const resolveSpecialtyParam = (raw) => {
  if (!raw) return 'All';
  const q = String(raw).trim().toLowerCase().replace(/[_-]/g, ' ');
  // Exact (case-insensitive) match first
  const exact = SPECIALTIES.find(s => s.toLowerCase() === q);
  if (exact) return exact;
  // Key-style aliases from AI specialist_mapper.SPECIALISTS keys
  const aliases = {
    'cardiologist': 'Cardiologist',
    'dermatologist': 'Dermatologist',
    'gastroenterologist': 'Gastroenterologist',
    'neurologist': 'Neurologist',
    'orthopedic': 'Orthopedic Surgeon',
    'orthopedic surgeon': 'Orthopedic Surgeon',
    'orthopaedic': 'Orthopedic Surgeon',
    'orthopaedic surgeon': 'Orthopedic Surgeon',
    'pulmonologist': 'Pulmonologist',
    'endocrinologist': 'Endocrinologist',
    'gynecologist': 'Gynecologist',
    'gynaecologist': 'Gynecologist',
    'urologist': 'Urologist',
    'ophthalmologist': 'Ophthalmologist',
    'ent': 'ENT Specialist',
    'ent specialist': 'ENT Specialist',
    'psychiatrist': 'Psychiatrist',
    'hepatologist': 'Hepatologist',
    'nephrologist': 'Nephrologist',
    'oncologist': 'Oncologist',
    'rheumatologist': 'Rheumatologist',
    'infectious disease': 'Infectious Disease Specialist',
    'infectious disease specialist': 'Infectious Disease Specialist',
    'general physician': 'General Physician',
    'gp': 'General Physician',
    'allergist': 'Allergist/Immunologist',
    'immunologist': 'Allergist/Immunologist',
    'allergist immunologist': 'Allergist/Immunologist',
    'hematologist': 'Hematologist',
    'haematologist': 'Hematologist',
    'pediatrician': 'Pediatrician',
    'paediatrician': 'Pediatrician',
    'pediatrics': 'Pediatrician',
  };
  if (aliases[q]) return aliases[q];
  // Fuzzy contains
  const contains = SPECIALTIES.find(s => s.toLowerCase().includes(q) || q.includes(s.toLowerCase()));
  return contains || 'All';
};

const DoctorsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters — initial specialty can come from ?specialty= (AI chat deep-link)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    () => resolveSpecialtyParam(searchParams.get('specialty'))
  );
  const [selectedCity, setSelectedCity] = useState(
    () => searchParams.get('city') || 'All'
  );
  const [feeMin, setFeeMin] = useState(0);
  const [feeMax, setFeeMax] = useState(null); // null = no upper limit
  const [activeFeePreset, setActiveFeePreset] = useState(0); // index in FEE_PRESETS
  const [sortBy, setSortBy] = useState('rating');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]); // doctor ids
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Track whether the current specialty came from a ?specialty= deep link
  // (e.g. the AI chat recommendation). Used to show an info banner.
  const [fromAiRecommendation, setFromAiRecommendation] = useState(
    () => !!searchParams.get('specialty')
  );

  // React to URL changes (e.g. user navigates here again from AI chat with a
  // different specialty while this page is already mounted).
  useEffect(() => {
    const specParam = searchParams.get('specialty');
    if (specParam) {
      setSelectedSpecialty(resolveSpecialtyParam(specParam));
      setFromAiRecommendation(true);
    }
    const cityParam = searchParams.get('city');
    if (cityParam) setSelectedCity(cityParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const data = await doctorService.getAllDoctors();
        const arr = Array.isArray(data) ? data : (data?.data ?? []);
        setDoctors(arr.length > 0 ? arr : mockDoctors);
      } catch {
        setDoctors(mockDoctors);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const getId = (d) => d._id || d.id;
  const getSpec = (d) => d.specialization || d.specialty || '';
  const getCity = (d) => d.city || '';
  const getFee = (d) => Number(d.consultationFee) || 0;
  const getExpYears = (d) => {
    if (typeof d.experience === 'number') return d.experience;
    return parseInt(d.experience) || 0;
  };

  const applyFeePreset = (idx) => {
    const preset = FEE_PRESETS[idx];
    setActiveFeePreset(idx);
    setFeeMin(preset.min);
    setFeeMax(preset.max);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('All');
    setSelectedCity('All');
    applyFeePreset(0);
    setSortBy('rating');
    setFromAiRecommendation(false);
    // Drop the ?specialty= / ?city= deep-link params so the URL stays clean
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (searchQuery) n++;
    if (selectedSpecialty !== 'All') n++;
    if (selectedCity !== 'All') n++;
    if (activeFeePreset !== 0) n++;
    return n;
  }, [searchQuery, selectedSpecialty, selectedCity, activeFeePreset]);

  const filtered = useMemo(() => {
    return doctors
      .filter(d => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
          (d.name || '').toLowerCase().includes(q) ||
          getSpec(d).toLowerCase().includes(q) ||
          (d.hospital || '').toLowerCase().includes(q) ||
          getCity(d).toLowerCase().includes(q);

        const matchesSpec = selectedSpecialty === 'All' || getSpec(d) === selectedSpecialty;
        const matchesCity = selectedCity === 'All' ||
          getCity(d).toLowerCase() === selectedCity.toLowerCase();

        const fee = getFee(d);
        const matchesMin = fee >= (feeMin || 0);
        const matchesMax = feeMax == null || fee <= feeMax;

        return matchesSearch && matchesSpec && matchesCity && matchesMin && matchesMax;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'experience') return getExpYears(b) - getExpYears(a);
        if (sortBy === 'fee_asc') return getFee(a) - getFee(b);
        if (sortBy === 'fee_desc') return getFee(b) - getFee(a);
        return 0;
      });
  }, [doctors, searchQuery, selectedSpecialty, selectedCity, feeMin, feeMax, sortBy]);

  // --- Compare helpers ---
  const toggleCompare = (doctor, e) => {
    if (e) e.stopPropagation();
    const id = getId(doctor);
    setSelectedForCompare(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const clearCompare = () => setSelectedForCompare([]);

  const compareDoctors = useMemo(
    () => selectedForCompare
      .map(id => doctors.find(d => getId(d) === id))
      .filter(Boolean),
    [selectedForCompare, doctors]
  );

  const cheapestFee = compareDoctors.length > 0
    ? Math.min(...compareDoctors.map(getFee).filter(f => f > 0))
    : 0;
  const bestRating = compareDoctors.length > 0
    ? Math.max(...compareDoctors.map(d => d.rating || 0))
    : 0;
  const mostExperience = compareDoctors.length > 0
    ? Math.max(...compareDoctors.map(getExpYears))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <PublicNav />

      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-accent-600 py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm text-sm font-medium">
            <Stethoscope className="w-4 h-4" />
            <span>Verified Healthcare Professionals</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">Find & Compare Doctors</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Filter by specialty, city and consultation fee. Select up to {MAX_COMPARE} doctors to compare side-by-side.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-primary-100">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Top Rated</span>
            <span>•</span>
            <span>{doctors.length}+ Doctors</span>
            <span>•</span>
            <span>Compare Fees & Locations</span>
          </div>
        </div>
      </section>

      {/* Search & Top Filter Bar */}
      <section className="sticky top-20 z-40 bg-white/95 backdrop-blur-md shadow-md border-b border-neutral-100">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, specialty, hospital, or city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-neutral-400 hover:text-neutral-700" />
                </button>
              )}
            </div>

            {/* Specialty Filter (desktop) */}
            <div className="relative hidden md:block">
              <select
                value={selectedSpecialty}
                onChange={e => {
                  setSelectedSpecialty(e.target.value);
                  setFromAiRecommendation(false);
                }}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none bg-white font-medium cursor-pointer"
              >
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>

            {/* City Filter (desktop) */}
            <div className="relative hidden md:block">
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="appearance-none pl-10 pr-10 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none bg-white font-medium cursor-pointer"
                aria-label="Filter by city"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                ))}
              </select>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative hidden md:block">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none bg-white font-medium cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>Sort: {o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
            </div>

            {/* Compare Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                setCompareMode(v => !v);
                if (compareMode) clearCompare();
              }}
              className={`px-4 py-3 rounded-xl border-2 font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                compareMode
                  ? 'bg-primary-600 text-white border-primary-600 shadow'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
              }`}
              aria-pressed={compareMode}
            >
              <Scale className="w-4 h-4" />
              {compareMode ? 'Comparing…' : 'Compare'}
            </button>

            {/* Mobile filter trigger */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(v => !v)}
              className="md:hidden px-4 py-3 rounded-xl border-2 border-neutral-200 font-medium flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary-600 text-white text-xs px-1.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Fee preset chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-neutral-500 flex items-center gap-1 mr-1">
              <Wallet className="w-3.5 h-3.5" /> Fee:
            </span>
            {FEE_PRESETS.map((p, idx) => (
              <button
                type="button"
                key={p.label}
                onClick={() => applyFeePreset(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  activeFeePreset === idx
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
                }`}
              >
                {p.label}
              </button>
            ))}

            {/* Custom fee range */}
            <div className="flex items-center gap-1 ml-2">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={feeMin || ''}
                onChange={e => {
                  const v = e.target.value === '' ? 0 : Number(e.target.value);
                  setFeeMin(v);
                  setActiveFeePreset(-1);
                }}
                className="w-20 px-2 py-1.5 rounded-lg border border-neutral-200 text-xs focus:border-primary-500 outline-none"
                aria-label="Minimum fee"
              />
              <span className="text-neutral-400 text-xs">—</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={feeMax ?? ''}
                onChange={e => {
                  const v = e.target.value === '' ? null : Number(e.target.value);
                  setFeeMax(v);
                  setActiveFeePreset(-1);
                }}
                className="w-20 px-2 py-1.5 rounded-lg border border-neutral-200 text-xs focus:border-primary-500 outline-none"
                aria-label="Maximum fee"
              />
              <span className="text-xs text-neutral-500 ml-1">PKR</span>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-auto px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}

            <div className="ml-auto text-sm text-neutral-500 whitespace-nowrap md:hidden">
              <span className="font-semibold text-neutral-800">{filtered.length}</span> found
            </div>
            <div className="text-sm text-neutral-500 whitespace-nowrap hidden md:block">
              <span className="font-semibold text-neutral-800">{filtered.length}</span> doctors found
            </div>
          </div>

          {/* Mobile inline filters */}
          {showMobileFilters && (
            <div className="md:hidden mt-3 grid grid-cols-1 gap-3 p-3 bg-neutral-50 rounded-xl">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Specialty</label>
                <select
                  value={selectedSpecialty}
                  onChange={e => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 bg-white"
                >
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">City</label>
                <select
                  value={selectedCity}
                  onChange={e => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 bg-white"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 bg-white"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-12 pb-32">
        <div className="container-custom">
          {/* AI recommendation banner */}
          {fromAiRecommendation && selectedSpecialty !== 'All' && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg flex-shrink-0 shadow-sm">
                <Stethoscope className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900">
                  Showing <span className="text-primary-700">{selectedSpecialty}s</span> recommended by AI
                </p>
                <p className="text-sm text-neutral-600 mt-0.5">
                  Based on your symptoms, these specialists can help. Use filters below to narrow by fee or city.
                </p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-800 flex items-center gap-1 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-neutral-200 rounded-lg mb-4" />
                  <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-neutral-100 rounded w-1/2 mb-4" />
                  <div className="h-9 bg-neutral-200 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Stethoscope className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">No doctors match your filters</h3>
              <p className="text-neutral-500">Try widening your fee range or changing the city.</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((doctor, index) => {
                const id = getId(doctor);
                const isSelected = selectedForCompare.includes(id);
                const selectDisabled =
                  !isSelected && selectedForCompare.length >= MAX_COMPARE;

                return (
                  <div
                    key={id}
                    className={`card card-hover cursor-pointer transform transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up relative ${
                      isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''
                    }`}
                    style={{ animationDelay: `${(index % 8) * 60}ms` }}
                    onClick={() => {
                      if (compareMode) {
                        toggleCompare(doctor);
                      } else {
                        navigate(`/doctors/${id}`);
                      }
                    }}
                  >
                    {/* Compare checkbox overlay (visible in compare mode) */}
                    {compareMode && (
                      <button
                        type="button"
                        onClick={(e) => toggleCompare(doctor, e)}
                        disabled={selectDisabled}
                        className={`absolute top-3 left-3 z-10 w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : selectDisabled
                              ? 'bg-neutral-100 border-neutral-300 cursor-not-allowed'
                              : 'bg-white/95 border-neutral-300 hover:border-primary-500'
                        }`}
                        aria-label={isSelected ? 'Remove from compare' : 'Add to compare'}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    )}

                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <img
                        src={doctor.avatar || doctor.photo}
                        alt={doctor.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold">{doctor.rating}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-primary-600/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {getSpec(doctor)}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-1">{doctor.name}</h3>
                    <p className="text-xs text-neutral-500 mb-3">{doctor.qualifications}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Award className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        <span>{doctor.experience} {typeof doctor.experience === 'number' ? 'years experience' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">
                          {[doctor.hospital, getCity(doctor)].filter(Boolean).join(' • ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-600">
                        <Clock className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                        <span className="truncate">{doctor.availability}</span>
                      </div>
                    </div>

                    {getFee(doctor) > 0 && (
                      <div className="mb-4 px-3 py-2 bg-primary-50 rounded-lg flex items-center justify-between">
                        <span className="text-xs text-neutral-600">Consultation Fee</span>
                        <span className="text-sm font-bold text-primary-700">PKR {getFee(doctor)}</span>
                      </div>
                    )}

                    {compareMode ? (
                      <button
                        type="button"
                        onClick={(e) => toggleCompare(doctor, e)}
                        disabled={selectDisabled}
                        className={`w-full btn-base py-2.5 text-sm transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : selectDisabled
                              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                              : 'bg-white border-2 border-primary-200 text-primary-700 hover:bg-primary-50'
                        }`}
                      >
                        {isSelected ? 'Selected for compare' : selectDisabled ? 'Max selected' : 'Add to Compare'}
                      </button>
                    ) : (
                      <button className="w-full btn-base py-2.5 text-sm bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                        View Profile
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Sticky Compare Bar */}
      {compareMode && selectedForCompare.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="container-custom py-3 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <Scale className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <span className="font-semibold text-neutral-800">
                {selectedForCompare.length}/{MAX_COMPARE} selected
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {compareDoctors.map(d => (
                  <span
                    key={getId(d)}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                  >
                    {d.name}
                    <button
                      type="button"
                      onClick={() => toggleCompare(d)}
                      className="hover:text-red-600"
                      aria-label={`Remove ${d.name} from compare`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                disabled={selectedForCompare.length < 2}
                className="px-5 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-sm"
              >
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && compareDoctors.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCompareModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary-600" /> Doctor Comparison
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Best values highlighted in green • {compareDoctors.length} doctors
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center"
                aria-label="Close comparison"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-neutral-700 border-b w-32">
                      Attribute
                    </th>
                    {compareDoctors.map(d => (
                      <th key={getId(d)} className="px-4 py-3 text-left font-semibold text-neutral-900 border-b border-l min-w-[200px]">
                        <div className="flex items-start gap-3">
                          <img
                            src={d.avatar || d.photo}
                            alt={d.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="truncate">{d.name}</div>
                            <div className="text-xs text-neutral-500 font-normal truncate">
                              {getSpec(d)}
                            </div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium text-neutral-600 bg-neutral-50/50">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4" /> Consultation Fee
                      </div>
                    </td>
                    {compareDoctors.map(d => {
                      const fee = getFee(d);
                      const isBest = fee > 0 && fee === cheapestFee;
                      return (
                        <td key={getId(d)} className={`px-4 py-3 border-l ${isBest ? 'bg-emerald-50' : ''}`}>
                          <span className={`font-bold ${isBest ? 'text-emerald-700' : 'text-neutral-900'}`}>
                            PKR {fee}
                          </span>
                          {isBest && (
                            <span className="ml-2 text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                              Cheapest
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium text-neutral-600 bg-neutral-50/50">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4" /> Rating
                      </div>
                    </td>
                    {compareDoctors.map(d => {
                      const isBest = (d.rating || 0) === bestRating && bestRating > 0;
                      return (
                        <td key={getId(d)} className={`px-4 py-3 border-l ${isBest ? 'bg-emerald-50' : ''}`}>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className={`font-semibold ${isBest ? 'text-emerald-700' : ''}`}>
                              {d.rating || '—'}
                            </span>
                            {d.reviews > 0 && (
                              <span className="text-xs text-neutral-500">({d.reviews})</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium text-neutral-600 bg-neutral-50/50">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4" /> Experience
                      </div>
                    </td>
                    {compareDoctors.map(d => {
                      const yrs = getExpYears(d);
                      const isBest = yrs === mostExperience && yrs > 0;
                      return (
                        <td key={getId(d)} className={`px-4 py-3 border-l ${isBest ? 'bg-emerald-50' : ''}`}>
                          <span className={`font-semibold ${isBest ? 'text-emerald-700' : ''}`}>
                            {yrs || '—'} {yrs ? 'years' : ''}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium text-neutral-600 bg-neutral-50/50">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" /> Location
                      </div>
                    </td>
                    {compareDoctors.map(d => (
                      <td key={getId(d)} className="px-4 py-3 border-l">
                        <div className="text-neutral-900">{d.hospital || '—'}</div>
                        {getCity(d) && (
                          <div className="text-xs text-neutral-500">{getCity(d)}</div>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium text-neutral-600 bg-neutral-50/50">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Availability
                      </div>
                    </td>
                    {compareDoctors.map(d => (
                      <td key={getId(d)} className="px-4 py-3 border-l text-neutral-700">
                        {d.availability || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-medium text-neutral-600 bg-neutral-50/50">
                      Qualifications
                    </td>
                    {compareDoctors.map(d => (
                      <td key={getId(d)} className="px-4 py-3 border-l text-neutral-700">
                        {d.qualifications || '—'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-neutral-600 bg-neutral-50/50"></td>
                    {compareDoctors.map(d => (
                      <td key={getId(d)} className="px-4 py-3 border-l">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCompareModal(false);
                            navigate(`/doctors/${getId(d)}`);
                          }}
                          className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                        >
                          View Profile
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-700 to-accent-600 text-white text-center">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect with a Doctor?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">Create an account to book appointments, track medical history, and more.</p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default DoctorsPage;
