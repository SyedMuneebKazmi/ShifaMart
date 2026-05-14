import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Activity, Pill, Stethoscope, ArrowRight, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Basic Info, 3: Role-Specific Info
  const [selectedRole, setSelectedRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: '',
    },
    mode: 'onTouched',
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
    console.log('✅ Role selected:', role);
    setSelectedRole(role);
    setStep(2);
  };

  const onSubmit = async (data) => {
    console.log('📝 Form submitted with data:', data);
    console.log('🎯 Selected role:', selectedRole);
    
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
      if (!selectedRole) {
        throw new Error('Please select a role');
      }

      // Build registration data - only include optional enum fields if they have actual values
      const registrationData = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: selectedRole,
      };

      // Only add optional fields if they're not empty
      if (data.phone && data.phone.trim()) registrationData.phone = data.phone.trim();
      if (data.age) registrationData.age = parseInt(data.age);
      if (data.gender && data.gender !== '') registrationData.gender = data.gender;
      if (data.bloodGroup && data.bloodGroup !== '') registrationData.bloodGroup = data.bloodGroup;

      // Add doctor-specific fields
      if (selectedRole === 'doctor') {
        if (data.licenseNumber?.trim()) registrationData.licenseNumber = data.licenseNumber.trim();
        if (data.specialization?.trim()) registrationData.specialization = data.specialization.trim();
        if (data.qualifications?.trim()) registrationData.qualifications = data.qualifications.trim();
        if (data.experience) registrationData.experience = parseInt(data.experience);
        if (data.hospital?.trim()) registrationData.hospital = data.hospital.trim();
        if (data.consultationFee) registrationData.consultationFee = parseInt(data.consultationFee);
      }

      // Add pharmacy-specific fields
      if (selectedRole === 'pharmacy') {
        if (data.pharmacyName?.trim()) registrationData.pharmacyName = data.pharmacyName.trim();
        if (data.licenseNumber?.trim()) registrationData.licenseNumber = data.licenseNumber.trim();
        if (data.ownerName?.trim()) registrationData.ownerName = data.ownerName.trim();
        if (data.address?.trim()) registrationData.address = data.address.trim();
        if (data.city?.trim()) registrationData.city = data.city.trim();
        if (data.landline?.trim()) registrationData.landline = data.landline.trim();
        if (data.operatingHours?.trim()) registrationData.operatingHours = data.operatingHours.trim();
      }
      
      console.log('📤 Sending registration data:', registrationData);
      const response = await authService.register(registrationData);
      console.log('✅ Registration response:', response);
      
      if (response.token && response.user) {
        // Show success message first
        const dashboardMap = {
          patient: '/patient/dashboard',
          pharmacy: '/pharmacy/dashboard',
          doctor: '/doctor/dashboard',
        };
        const destination = dashboardMap[response.user.role];

        setSuccessMessage(`🎉 Account created successfully! Welcome, ${response.user.name}! Redirecting to your dashboard...`);
        
        // Log user in, then redirect after a short delay
        login(response.user, response.token);
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 2000);
      } else {
        throw new Error('Unexpected response from server. Please try again.');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMessage
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentRole = watch('role') || selectedRole;

  const dateOfBirth = watch('dateOfBirth');
  useEffect(() => {
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0) {
        setValue('age', calculatedAge, { shouldValidate: true });
      }
    }
  }, [dateOfBirth, setValue]);

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

            {/* Social Sign-Up Buttons */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => alert('Google Sign-Up coming soon! Currently under integration.')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all font-medium text-neutral-700 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => alert('Apple Sign-Up coming soon! Currently under integration.')}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-neutral-800 rounded-xl bg-neutral-900 hover:bg-neutral-800 transition-all font-medium text-white shadow-sm"
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-500 font-medium">Or sign up with email</span>
              </div>
            </div>

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
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit, (validationErrors) => {
                console.error('❌ Zod validation failed:', validationErrors);
                const firstError = Object.values(validationErrors)[0];
                setError(firstError?.message || 'Please check all fields and try again.');
              })}>

              {successMessage && (
                <div className="rounded-xl border border-green-300 bg-green-50 p-4 flex items-start gap-3">
                  <div className="text-2xl">🎉</div>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Account Created Successfully!</p>
                    <p className="text-green-700 text-sm mt-1">{successMessage.replace('🎉 ', '')}</p>
                  </div>
                </div>
              )}
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
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          {...register('password')}
                          className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                      <p className="mt-1 text-xs text-neutral-400">Min 8 chars, 1 uppercase, 1 lowercase, 1 number</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          {...register('confirmPassword')}
                          className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>
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
                      onClick={() => {
                        console.log('⬅️ Going back to step 1');
                        setStep(1);
                      }}
                      className="flex-1 btn-base px-6 py-3 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const isValid = await trigger(['name', 'email', 'password', 'confirmPassword', 'phone']);
                        if (isValid) {
                          setStep(3);
                        } else {
                          console.log('Form errors in step 2:', errors);
                        }
                      }}
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
                        <Input
                          label="Age"
                          type="number"
                          min="1"
                          max="150"
                          {...register('age')}
                          error={errors.age?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                        <div>
                          <label className="label-base">Blood Group</label>
                          <select {...register('bloodGroup')} className="input-base">
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                          </select>
                          {errors.bloodGroup && <p className="mt-1 text-sm text-danger">{errors.bloodGroup.message}</p>}
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
                      onClick={() => {
                        console.log('⬅️ Going back to step 2');
                        setStep(2);
                      }}
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
                      onClick={() => console.log('🔘 Create Account clicked, validating form...')}
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
