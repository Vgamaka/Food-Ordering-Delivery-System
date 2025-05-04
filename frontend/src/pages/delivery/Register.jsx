import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerDriver } from '../../services/driverService'; // 📢 New import at top

export default function DriverRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleNumber: '',
    password: '',
    confirmPassword: '',
    licensePhoto: null
  });
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    if (e.target.name === 'licensePhoto') {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error('Image size should be less than 5MB');
          return;
        }
        setForm({ ...form, licensePhoto: file });
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
    setError('');
  };

  const validateForm = () => {
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (form.password.length < 3) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!form.licensePhoto) {
      setError('Please upload your license photo');
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (key !== 'confirmPassword') {
        formData.append(key, form[key]);
      }
    });
  
    try {
      await registerDriver(formData);
      toast.success('Registration successful! Please log in.');
      navigate('/driver/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            Join Our Delivery Team
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Start earning by delivering happiness to customers
          </p>
          <div className="mt-4">
            <span className="text-gray-600">Already registered? </span>
            <Link to="/driver/login" className="font-medium text-red-600 hover:text-red-500 transition-colors">
              Sign in to your account
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 md:px-10">
            <h3 className="text-xl font-medium text-white">Driver Registration</h3>
            <p className="mt-1 text-red-100">Please fill in your details below</p>
          </div>

          <div className="px-6 py-8 md:px-10">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    required
                    value={form.vehicleNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="Enter vehicle number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="Create a strong password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver License Photo
                </label>
                <div className="mt-1 flex justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-lg hover:border-red-500 transition-colors">
                  <div className="space-y-2 text-center">
                    {preview ? (
                      <div className="relative inline-block">
                        <img
                          src={preview}
                          alt="License preview"
                          className="max-h-48 w-auto rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ ...form, licensePhoto: null });
                            setPreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-16 w-16 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              name="licensePhoto"
                              accept="image/*"
                              onChange={handleChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg text-white transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    loading
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating your account...
                    </>
                  ) : (
                    'Join as Delivery Partner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          By registering, you agree to our{' '}
          <a href="#" className="font-medium text-red-600 hover:text-red-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium text-red-600 hover:text-red-500">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
