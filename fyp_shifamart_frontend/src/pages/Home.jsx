import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope,
  Pill,
  Activity, 
  Shield, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Star,
  MapPin,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';
import PublicNav from '@components/layout/PublicNav';
import doctorService from '@services/doctor';
import { mockPharmacies } from '@mocks/mockPharmacies';
import heroImage from '../assets/hero_healthcare_illustration_1764865100225.png';

const Home = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'doctors', 'pharmacies'
  
  const doctorsScrollRef = useRef(null);
  const pharmaciesScrollRef = useRef(null);
  const searchRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const data = await doctorService.getAllDoctors();
        // Ensure data is an array
        const doctorsArray = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        setDoctors(doctorsArray);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        // Fallback to empty array if API fails
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    
    fetchDoctors();
  }, []);

  // Filter functions
  const getFilteredDoctors = () => {
    const doctorsList = Array.isArray(doctors) ? doctors : [];
    if (!searchQuery) return doctorsList;
    const query = searchQuery.toLowerCase();
    return doctorsList.filter(doc => 
      doc.name.toLowerCase().includes(query) ||
      doc.specialization.toLowerCase().includes(query) ||
      doc.hospital.toLowerCase().includes(query)
    );
  };

  const getFilteredPharmacies = () => {
    if (!searchQuery) return mockPharmacies;
    const query = searchQuery.toLowerCase();
    return mockPharmacies.filter(pharm => 
      pharm.name.toLowerCase().includes(query) ||
      pharm.location.toLowerCase().includes(query) ||
      pharm.services.some(service => service.toLowerCase().includes(query))
    );
  };

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const features = [
    {
      icon: Activity,
      title: 'For Patients',
      description: 'AI-powered symptom checker, prescription upload, and medicine price comparison across pharmacies.',
      gradient: 'from-blue-500 to-cyan-500',
      highlights: ['AI Symptom Checker', 'OCR Prescription Upload', 'Price Comparison']
    },
    {
      icon: Pill,
      title: 'For Pharmacies',
      description: 'Streamline inventory management, process orders efficiently, and track analytics in real-time.',
      gradient: 'from-emerald-500 to-teal-500',
      highlights: ['Inventory Management', 'Order Processing', 'Sales Analytics']
    },
    {
      icon: Stethoscope,
      title: 'For Doctors',
      description: 'Manage patient queues, issue digital prescriptions, and access comprehensive medical histories.',
      gradient: 'from-purple-500 to-pink-500',
      highlights: ['Patient Queue', 'Digital Prescriptions', 'Medical Records']
    },
    {
      icon: Shield,
      title: 'For Admins',
      description: 'Monitor platform health, approve pharmacy registrations, and manage users across the ecosystem.',
      gradient: 'from-orange-500 to-red-500',
      highlights: ['Platform Analytics', 'Pharmacy Approvals', 'User Management']
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Active Users' },
    { value: '500+', label: 'Registered Pharmacies'},
    { value: '50,000+', label: 'Prescriptions Processed' },
    { value: '24/7', label: 'First Aid Support' }
  ];

  const steps = [
    {
      number: '01',
      title: 'Sign Up',
      description: 'Create your account as a patient, pharmacy, doctor, or admin in seconds.'
    },
    {
      number: '02',
      title: 'Access Features',
      description: 'Use AI diagnostics, upload prescriptions, manage inventory, or oversee the platform.'
    },
    {
      number: '03',
      title: 'Get Results',
      description: 'Receive instant insights, find best prices, process orders, and improve healthcare delivery.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Public Navigation */}
      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 -left-40 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container-custom relative z-10 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Healthcare Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                Your Complete
                <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mt-2">
                  Healthcare Solution
                </span>
              </h1>
              
              <p className="text-xl text-neutral-600 leading-relaxed max-w-xl">
                ShifaMart+ connects patients, pharmacies, and doctors through cutting-edge technology. 
                Get AI-powered diagnoses, compare medicine prices, and access healthcare services instantly.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="group btn-base px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => navigate('/first-aid')}
                  className="btn-base px-8 py-4 bg-white text-primary-700 border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 shadow-md hover:shadow-lg"
                >
                  First Aid Guide
                </button>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 pt-4">
                {stats.slice(0, 3).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary-700">{stat.value}</div>
                    <div className="text-sm text-neutral-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image - Animated */}
            <div className="relative lg:pl-8 animate-slide-in-right">
              <div className="relative">
                {/* Animated glow effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-400/30 to-accent-400/30 rounded-3xl blur-2xl animate-pulse"></div>
                
                {/* Image container */}
                <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                  <img 
                    src={heroImage} 
                    alt="ShifaMart Healthcare Platform" 
                    className="w-full h-auto object-contain animate-float"
                  />
                </div>

                {/* Floating badges */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-lg px-4 py-3 animate-bounce-slow">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-semibold text-neutral-900">AI Powered</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl shadow-lg px-4 py-3 animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-semibold">100% Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-neutral-900 text-center mb-6">
                Find Doctors &amp; Pharmacies Near You
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search input with live suggestions */}
                <div className="flex-1 relative" ref={searchRef}>
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search by name, specialty, location..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  />

                  {/* Live Suggestions Dropdown */}
                  {showSuggestions && searchQuery.length > 0 && (() => {
                    const suggestDoctors = (searchType === 'all' || searchType === 'doctors')
                      ? getFilteredDoctors().slice(0, 4)
                      : [];
                    const suggestPharmacies = (searchType === 'all' || searchType === 'pharmacies')
                      ? getFilteredPharmacies().slice(0, 4)
                      : [];
                    const total = suggestDoctors.length + suggestPharmacies.length;

                    return total > 0 ? (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-50">
                        {/* Doctors group */}
                        {suggestDoctors.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-primary-50 border-b border-neutral-100">
                              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Doctors</span>
                            </div>
                            {suggestDoctors.map((doctor) => (
                              <button
                                key={doctor._id || doctor.id}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-50 transition-colors text-left border-b border-neutral-50 last:border-0"
                                onMouseDown={() => {
                                  setShowSuggestions(false);
                                  setSearchQuery('');
                                  navigate(`/doctors/${doctor._id || doctor.id}`);
                                }}
                              >
                                <img
                                  src={doctor.avatar || doctor.photo}
                                  alt={doctor.name}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-primary-100"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-neutral-900 text-sm truncate">{doctor.name}</p>
                                  <p className="text-xs text-primary-600 truncate">{doctor.specialization || doctor.specialty}</p>
                                </div>
                                <span className="text-xs text-neutral-400 flex-shrink-0">{doctor.hospital}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Pharmacies group */}
                        {suggestPharmacies.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-emerald-50 border-b border-neutral-100">
                              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Pharmacies</span>
                            </div>
                            {suggestPharmacies.map((pharmacy) => (
                              <button
                                key={pharmacy.id}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left border-b border-neutral-50 last:border-0"
                                onMouseDown={() => {
                                  setShowSuggestions(false);
                                  setSearchQuery('');
                                  navigate(`/pharmacies/${pharmacy.id}`);
                                }}
                              >
                                <img
                                  src={pharmacy.logo}
                                  alt={pharmacy.name}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-emerald-100"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-neutral-900 text-sm truncate">{pharmacy.name}</p>
                                  <p className="text-xs text-emerald-600 truncate">{pharmacy.location}</p>
                                </div>
                                <span className="text-xs text-neutral-400 flex-shrink-0">{pharmacy.deliveryTime}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* View all results footer */}
                        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100">
                          <button
                            onMouseDown={() => {
                              setShowSuggestions(false);
                              if (searchType === 'doctors') navigate('/doctors');
                              else if (searchType === 'pharmacies') navigate('/pharmacies');
                              else navigate('/doctors');
                            }}
                            className="text-xs text-primary-600 font-semibold hover:underline"
                          >
                            View all results →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-100 px-4 py-6 text-center z-50">
                        <p className="text-sm text-neutral-500">No results found for <strong>"{ searchQuery }"</strong></p>
                      </div>
                    );
                  })()}
                </div>

                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-primary-500 outline-none bg-white font-medium"
                >
                  <option value="all">All</option>
                  <option value="doctors">Doctors</option>
                  <option value="pharmacies">Pharmacies</option>
                </select>

                <button
                  onClick={() => {
                    if (!searchQuery.trim()) return; // do nothing if empty
                    if (searchType === 'doctors') navigate('/doctors');
                    else if (searchType === 'pharmacies') navigate('/pharmacies');
                    else navigate('/doctors');
                  }}
                  className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm scroll-mt-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-neutral-900">
              Built for Everyone in Healthcare
            </h2>
            <p className="text-lg text-neutral-600">
              Whether you're a patient seeking care, a pharmacy managing inventory, 
              or a doctor treating patients, ShifaMart+ has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group card card-hover transform transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-neutral-600 mb-4">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="py-20 scroll-mt-20">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                {searchQuery ? 'Search Results - Doctors' : 'Meet Our Doctors'}
              </h2>
              <p className="text-lg text-neutral-600">
                Connect with experienced healthcare professionals across various specialties
              </p>
            </div>

            {!searchQuery && (
              <button
                onClick={() => navigate('/doctors')}
                className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
              >
                View All {doctors.length > 0 ? `(${doctors.length})` : ''}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {(searchType === 'all' || searchType === 'doctors') && (
            <div className="relative">
              {!searchQuery && (
                <>
                  <button
                    onClick={() => scroll(doctorsScrollRef, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-neutral-50 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-neutral-700" />
                  </button>
                  <button
                    onClick={() => scroll(doctorsScrollRef, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-neutral-50 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-neutral-700" />
                  </button>
                </>
              )}

              <div
                ref={doctorsScrollRef}
                className={`${
                  searchQuery
                    ? 'grid md:grid-cols-2 lg:grid-cols-4 gap-6'
                    : 'flex overflow-x-auto gap-6 pb-4 hide-scrollbar scroll-smooth'
                }`}
                style={!searchQuery ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
              >
                {(searchQuery ? getFilteredDoctors() : getFilteredDoctors().slice(0, 6)).map((doctor, index) => (
                  <div
                    key={doctor._id || doctor.id}
                    className={`card card-hover cursor-pointer transform transition-all hover:-translate-y-1 ${
                      !searchQuery ? 'flex-shrink-0 w-80' : ''
                    }`}
                    onClick={() => navigate(`/doctors/${doctor._id || doctor.id || doctor.id}`)}

                  >
                    <div className="relative mb-4">
                      <img
                        src={doctor.avatar || doctor.photo}
                        alt={doctor.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{doctor.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-1">{doctor.name}</h3>
                    <p className="text-sm text-primary-600 font-medium mb-2">{doctor.specialization}</p>
                    <p className="text-xs text-neutral-500 mb-3">{doctor.qualifications}</p>

                    <div className="flex items-center gap-2 text-xs text-neutral-600 mb-3">
                      <Award className="w-4 h-4" />
                      <span>{doctor.experience} years experience</span>
                    </div>

                    <button className="w-full btn-base py-2 text-sm bg-primary-100 text-primary-700 hover:bg-primary-200">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pharmacies Section */}
      <section id="pharmacies" className="py-20 bg-white/50 backdrop-blur-sm scroll-mt-20">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">
                {searchQuery ? 'Search Results - Pharmacies' : 'Verified Pharmacies'}
              </h2>
              <p className="text-lg text-neutral-600">
                Find trusted pharmacies near you with competitive prices and quick delivery
              </p>
            </div>
            {!searchQuery && mockPharmacies.length > 6 && (
              <button
                onClick={() => navigate('/pharmacies')}
                className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2"
              >
                View All ({mockPharmacies.length})
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {(searchType === 'all' || searchType === 'pharmacies') && (
            <div className="relative">
              {!searchQuery && (
                <>
                  <button
                    onClick={() => scroll(pharmaciesScrollRef, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-neutral-50 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-neutral-700" />
                  </button>
                  <button
                    onClick={() => scroll(pharmaciesScrollRef, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-neutral-50 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-neutral-700" />
                  </button>
                </>
              )}

              <div
                ref={pharmaciesScrollRef}
                className={`${
                  searchQuery
                    ? 'grid md:grid-cols-2 lg:grid-cols-4 gap-6'
                    : 'flex overflow-x-auto gap-6 pb-4 hide-scrollbar scroll-smooth'
                }`}
                style={!searchQuery ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
              >
                {(searchQuery ? getFilteredPharmacies() : getFilteredPharmacies().slice(0, 6)).map((pharmacy, index) => (
                  <div
                    key={pharmacy.id}
                    className={`card card-hover cursor-pointer transform transition-all hover:-translate-y-1 ${
                      !searchQuery ? 'flex-shrink-0 w-80' : ''
                    }`}
                    onClick={() => navigate(`/pharmacies/${pharmacy.id}`)}
                  >
                    <div className="relative mb-4">
                      <img
                        src={pharmacy.logo}
                        alt={pharmacy.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {pharmacy.verified && (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
                          <CheckCircle className="w-3 h-3" />
                          <span className="text-xs font-semibold">Verified</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-md">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{pharmacy.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-1">{pharmacy.name}</h3>

                    <div className="flex items-start gap-2 text-sm text-neutral-600 mb-3">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{pharmacy.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                      <Clock className="w-4 h-4" />
                      <span>Delivery: {pharmacy.deliveryTime}</span>
                    </div>

                    <button className="w-full btn-base py-2 text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-bold text-neutral-900">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600">
              Get started with ShifaMart+ in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="relative text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-300 to-accent-300"></div>
                )}

                {/* Step number */}
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full opacity-10 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-primary-600 to-accent-600 text-white text-3xl font-bold w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {step.title}
                </h3>
                
                <p className="text-neutral-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators / Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-primary-100">
              Join the growing community transforming healthcare delivery
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl lg:text-5xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Healthcare?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join ShifaMart+ today and experience the future of healthcare management
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="btn-base px-8 py-4 bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Free Account
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="btn-base px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 shadow-lg"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-900 text-neutral-400">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">ShifaMart+</h3>
              <p className="text-sm">
                Your complete healthcare solution powered by AI and modern technology.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/first-aid')} className="hover:text-white transition-colors">First Aid Guide</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Register</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <p className="text-sm">
                24/7 Support Available<br />
                Emergency: First Aid Guide
              </p>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-sm">
            <p>&copy; 2024 ShifaMart+. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
