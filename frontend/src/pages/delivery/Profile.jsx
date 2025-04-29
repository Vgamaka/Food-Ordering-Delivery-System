import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDriverProfile, toggleDriverAvailability, updateDriverProfile } from '../../services/driverService';
import { toast } from 'react-toastify';

export default function DriverProfile() {
  const navigate = useNavigate();
  const driverId = localStorage.getItem('driverId');
  const [driver, setDriver] = useState(null);
  const [availability, setAvailability] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleNumber: ''
  });

  useEffect(() => {
    if (!driverId) {
      navigate('/login');
      return;
    }
    fetchDriver();
  }, [driverId, navigate]);

  const fetchDriver = async () => {
    try {
      const res = await fetchDriverProfile(driverId);
      setDriver(res);
      setAvailability(res.availability);
      setForm({
        name: res.name,
        email: res.email,
        phone: res.phone,
        vehicleNumber: res.vehicleNumber
      });      
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    localStorage.removeItem('licensePhoto');
    navigate('/driver/login');
    toast.success('Logged out successfully');
  };

  const handleToggleAvailability = async () => {
    try {
      const newStatus = !availability;
      await toggleDriverAvailability(driverId, newStatus);
      setAvailability(newStatus);
      setDriver(prev => ({
        ...prev,
        availability: newStatus,
      }));
      toast.success(`You are now ${newStatus ? 'available' : 'unavailable'} for deliveries`);
    } catch (err) {
      console.error('Error updating availability:', err);
      toast.error('Failed to update availability');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDriverProfile(driverId, form);
      setDriver(prev => ({ ...prev, ...form }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    }
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex justify-between items-start">
              <div className="text-white">
                <h1 className="text-3xl font-bold">Driver Profile</h1>
                <p className="mt-1 text-blue-100">Manage your delivery profile and settings</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/delivery/orders')}
                  className="px-4 py-2 text-sm font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          
          {/* Availability Toggle */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Delivery Status</h2>
                <p className="text-sm text-gray-500 mt-0.5">Toggle your availability for new orders</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={availability}
                    onChange={handleToggleAvailability}
                  />
                  <div className={`block w-16 h-9 rounded-full transition-colors ${
                    availability ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-7 h-7 rounded-full transition transform ${
                    availability ? 'translate-x-7' : ''
                  } shadow-sm`}></div>
                </div>
                <span className={`ml-3 text-sm font-medium ${
                  availability ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {availability ? 'Available' : 'Unavailable'}
                </span>
              </label>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      value={form.vehicleNumber}
                      onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium text-gray-900">{driver.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium text-gray-900">{driver.phone}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Vehicle Number</p>
                    <p className="font-medium text-gray-900">{driver.vehicleNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* License Photo Card */}
        {driver.licensePhoto && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">License Photo</h3>
            <div className="bg-gray-50 rounded-lg p-2">
              <img
                src={`http://localhost:3009/uploads/${driver.licensePhoto}`}
                alt="Driver License"
                className="w-full max-w-2xl mx-auto rounded-lg shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
