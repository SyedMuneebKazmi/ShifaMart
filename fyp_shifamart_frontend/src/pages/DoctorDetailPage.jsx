import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Award, MapPin, Clock, DollarSign,
  CheckCircle, Phone, Languages, Calendar, Stethoscope, ChevronRight
} from 'lucide-react';
import PublicNav from '@components/layout/PublicNav';
import useAuthStore from '@stores/authStore';
import doctorService from '@services/doctor';
import { mockDoctors } from '@mocks/mockDoctors';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        // Try to get from API first
        const data = await doctorService.getAllDoctors();
        const arr = Array.isArray(data) ? data : (data?.data ?? []);
        const found = arr.find(d => (d._id || d.id) === id);
        if (found) { setDoctor(found); setLoading(false); return; }
      } catch { /* fall through to mock */ }
      // Fallback to mock data
      const mock = mockDoctors.find(d => d.id === id);
      setDoctor(mock || null);
      setLoading(false);
    };
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <PublicNav />
        <div className="container-custom py-20 text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neutral-600">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <PublicNav />
        <div className="container-custom py-20 text-center">
          <Stethoscope className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Doctor Not Found</h2>
          <p className="text-neutral-600 mb-6">The doctor profile you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/doctors')} className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  const specialty = doctor.specialization || doctor.specialty;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <PublicNav />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-custom py-3 flex items-center gap-2 text-sm text-neutral-500">
          <button onClick={() => navigate('/')} className="hover:text-primary-600 transition-colors">Home</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate('/doctors')} className="hover:text-primary-600 transition-colors">Doctors</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-neutral-800 font-medium truncate">{doctor.name}</span>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/doctors')}
          className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Doctors</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero Profile */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary-600 to-accent-600" />
              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row gap-6 -mt-16 mb-6">
                  <div className="relative">
                    <img
                      src={doctor.avatar || doctor.photo}
                      alt={doctor.name}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="pt-4 sm:pt-16 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h1 className="text-2xl font-bold text-neutral-900">{doctor.name}</h1>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium">{specialty}</span>
                    </div>
                    <p className="text-neutral-500 text-sm mb-3">{doctor.qualifications}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-neutral-800">{doctor.rating}</span>
                        {doctor.reviewCount && (
                          <span className="text-sm text-neutral-500">({doctor.reviewCount} reviews)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-neutral-600">
                        <Award className="w-4 h-4 text-primary-500" />
                        <span>{doctor.experience} {typeof doctor.experience === 'number' ? 'yrs' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            {doctor.about && (
              <div className="bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary-600" />
                  About
                </h2>
                <p className="text-neutral-600 leading-relaxed">{doctor.about}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Details</h2>
              <div className="grid sm:grid-cols-2 gap-6">

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Experience</p>
                    <p className="font-semibold text-neutral-800">{doctor.experience} {typeof doctor.experience === 'number' ? 'Years' : ''}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Hospital</p>
                    <p className="font-semibold text-neutral-800">{doctor.hospital}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Availability</p>
                    <p className="font-semibold text-neutral-800">{doctor.availability}</p>
                  </div>
                </div>

                {doctor.consultationFee && (
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Consultation Fee</p>
                      <p className="font-semibold text-neutral-800">PKR {doctor.consultationFee.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Languages */}
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-8">
                <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary-600" />
                  Languages Spoken
                </h2>
                <div className="flex flex-wrap gap-3">
                  {doctor.languages.map((lang, idx) => (
                    <span key={idx} className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full border border-primary-100 font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

            <div className="sticky top-28 space-y-6 self-start">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Book an Appointment</h3>
                <p className="text-sm text-neutral-500 mb-6">
                  {isAuthenticated
                    ? `Welcome, ${user?.name?.split(' ')[0]}! Book your appointment below.`
                    : `Create an account to book appointments with ${doctor.name}.`}
                </p>

                {doctor.consultationFee && (
                  <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
                    <span className="text-sm text-neutral-600">Consultation Fee</span>
                    <span className="text-xl font-bold text-primary-700">PKR {doctor.consultationFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Verified professional</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Digital prescriptions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Medical history tracking</span>
                  </div>
                </div>

                <button
                  onClick={() => isAuthenticated
                    ? navigate('/patient/dashboard')
                    : navigate('/register')}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-accent-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  {isAuthenticated ? 'Book Appointment' : 'Get Started'}
                </button>

                {!isAuthenticated && (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full mt-3 py-3 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:border-primary-400 hover:text-primary-600 transition-colors"
                  >
                    Sign In to Book
                  </button>
                )}
              </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-primary-700 to-accent-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-3">Quick Info</h3>
              <div className="space-y-3 text-sm text-primary-100">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>Rated {doctor.rating}/5 by patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-200" />
                  <span>{doctor.hospital}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-200" />
                  <span>{doctor.availability}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
