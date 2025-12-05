import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Activity, Pill, Stethoscope, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { registerSchema } from '@utils/validators';
import useAuthStore from '@stores/authStore';
import authService from '@services/auth';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import Alert from '@components/ui/Alert';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Basic Info, 3: Role-Specific Info
  const [selectedRole, setSelectedRole] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: '',
    },
  });

  const roleData = [
    {
      value: 'patient',
      icon: Activity,
      title: 'Patient',
      description: 'Access symptom checker, upload prescriptions, and compare medicine prices',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'doctor',
      icon: Stethoscope,
      title: 'Doctor',
      description: 'Manage patient queues, issue digital prescriptions, and access medical records',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      value: 'pharmacy',
      icon: Pill,
      title: 'Pharmacy',
      description: 'Manage inventory, process orders, and track sales analytics',
      gradient: 'from-emerald-500 to-teal-500'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    
    try {
      // Remove confirmPassword and acceptTerms before sending to API
      const { confirmPassword, acceptTerms, ...userData } = data;
      userData.role = selectedRole;
      
      const response = await authService.register(userData);
      login(response.user, response.token);
      
      // Redirect based on role
      const dashboardMap = {
        patient: '/patient/dashboard',
        pharmacy: '/pharmacy/dashboard',
        doctor: '/doctor/dashboard',
      };
      navigate(dashboardMap[response.user.role], { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentRole = watch('role') || selectedRole;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
            S+
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">
            Create your ShifaMart+ account
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step > s ? 'bg-primary-600 text-white' : step === s ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-primary-600' : 'bg-neutral-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl">
            <h3 className="text-2xl font-bold text-center mb-6 text-neutral-900">Choose Your Role</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {roleData.map((role) => (
                <button
                  key={role.value}
                  onClick={() => handleRoleSelect(role.value)}
                  className="group p-6 rounded-xl border-2 border-neutral-200 hover:border-primary-500 transition-all hover:shadow-lg text-left"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                    <role.icon className="w-full h-full text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900 mb-2">{role.title}</h4>
                  <p className="text-sm text-neutral-600">{role.description}</p>
                  <div className="mt-4 flex items-center text-primary-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Select <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 & 3: Registration Form */}
        {step >= 2 && (
          <div className="bg-white py-8 px-6 shadow-xl sm:rounded-2xl">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <Alert variant="danger" title="Registration Failed">
                  {error}
                </Alert>
              )}

              {/* Step 2: Basic Information */}
              {step === 2 && (
                <>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-6">Basic Information</h3>
                  
                  <Input
                    label="Full Name"
                    type="text"
                    autoComplete="name"
                    {...register('name')}
                    error={errors.name?.message}
                  />

                  <Input
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    error={errors.email?.message}
                  />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Input
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                      {...register('password')}
                      error={errors.password?.message}
                    />

                    <Input
                      label="Confirm Password"
                      type="password"
                      autoComplete="new-password"
                      {...register('confirmPassword')}
                      error={errors.confirmPassword?.message}
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+92-300-1234567"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 btn-base px-6 py-3 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 btn-base px-6 py-3 bg-primary-600 text-white hover:bg-primary-700"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Role-Specific Information */}
              {step === 3 && (
                <>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                    {selectedRole === 'patient' && 'Patient Details'}
                    {selectedRole === 'doctor' && 'Doctor Details'}
                    {selectedRole === 'pharmacy' && 'Pharmacy Details'}
                  </h3>

                  {/* Patient-Specific Fields */}
                  {selectedRole === 'patient' && (
                    <>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                          label="Date of Birth"
                          type="date"
                          {...register('dateOfBirth')}
                          error={errors.dateOfBirth?.message}
                        />
                        <div>
                          <label className="label-base">Gender</label>
                          <select {...register('gender')} className="input-base">
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.gender && <p className="mt-1 text-sm text-danger">{errors.gender.message}</p>}
                        </div>
                      </div>

                      <Input
                        label="Address"
                        type="text"
                        {...register('address')}
                        error={errors.address?.message}
                      />
                    </>
                  )}

                  {/* Doctor-Specific Fields */}
                  {selectedRole === 'doctor' && (
                    <>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                          label="Medical License Number"
                          type="text"
                          {...register('licenseNumber')}
                          error={errors.licenseNumber?.message}
                        />
                        <div>
                          <label className="label-base">Specialization</label>
                          <select {...register('specialization')} className="input-base">
                            <option value="">Select Specialization</option>
                            <option value="cardiologist">Cardiologist</option>
                            <option value="pediatrician">Pediatrician</option>
                            <option value="dermatologist">Dermatologist</option>
                            <option value="neurologist">Neurologist</option>
                            <option value="orthopedic">Orthopedic Surgeon</option>
                            <option value="gynecologist">Gynecologist</option>
                            <option value="general_physician">General Physician</option>
                            <option value="psychiatrist">Psychiatrist</option>
                          </select>
                          {errors.specialization && <p className="mt-1 text-sm text-danger">{errors.specialization.message}</p>}
                        </div>
                      </div>

                      <Input
                        label="Qualifications (e.g., MBBS, MD)"
                        type="text"
                        placeholder="MBBS, MD (Cardiology)"
                        {...register('qualifications')}
                        error={errors.qualifications?.message}
                      />

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                          label="Years of Experience"
                          type="number"
                          placeholder="5"
                          {...register('experience')}
                          error={errors.experience?.message}
                        />
                        <Input
                          label="Hospital/Clinic Affiliation"
                          type="text"
                          {...register('hospital')}
                          error={errors.hospital?.message}
                        />
                      </div>

                      <Input
                        label="Consultation Fee (PKR)"
                        type="number"
                        placeholder="2000"
                        {...register('consultationFee')}
                        error={errors.consultationFee?.message}
                      />
                    </>
                  )}

                  {/* Pharmacy-Specific Fields */}
                  {selectedRole === 'pharmacy' && (
                    <>
                      <Input
                        label="Pharmacy Name"
                        type="text"
                        {...register('pharmacyName')}
                        error={errors.pharmacyName?.message}
                      />

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                          label="License/Registration Number"
                          type="text"
                          {...register('licenseNumber')}
                          error={errors.licenseNumber?.message}
                        />
                        <Input
                          label="Owner Name"
                          type="text"
                          {...register('ownerName')}
                          error={errors.ownerName?.message}
                        />
                      </div>

                      <Input
                        label="Complete Address"
                        type="text"
                        {...register('address')}
                        error={errors.address?.message}
                      />

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                          label="City"
                          type="text"
                          {...register('city')}
                          error={errors.city?.message}
                        />
                        <Input
                          label="Landline Phone"
                          type="tel"
                          placeholder="042-12345678"
                          {...register('landline')}
                          error={errors.landline?.message}
                        />
                      </div>

                      <Input
                        label="Operating Hours"
                        type="text"
                        placeholder="9:00 AM - 10:00 PM"
                        {...register('operatingHours')}
                        error={errors.operatingHours?.message}
                      />
                    </>
                  )}

                  <div className="flex items-center">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="accept-terms" className="ml-2 block text-sm text-neutral-900">
                      I agree to the{' '}
                      <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                        Terms
                      </a>{' '}
                      and{' '}
                      <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-danger">{errors.acceptTerms.message}</p>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 btn-base px-6 py-3 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                    <Button
                      type="submit"
                      className="flex-1"
                      loading={loading}
                      leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                      Create Account
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
