import { registerDelivery } from "../../services/authService";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterDelivery() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    licenseImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, licenseImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("address", form.address);
    formData.append("password", form.password);
    formData.append("role", "delivery");
    formData.append("licenseImage", form.licenseImage);
  
    setLoading(true);
    setError("");
  
    try {
      await registerDelivery(formData);
      navigate("/login"); // ✅ Redirect after success
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-xl">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          Register as Delivery Personnel
        </h2>

        {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <input
            name="name"
            placeholder="Full Name"
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            value={form.name}
            onChange={handleChange}
            required
          />
          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            value={form.email}
            onChange={handleChange}
            required
          />
          {/* Phone */}
          <input
            name="phone"
            placeholder="Phone"
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            value={form.phone}
            onChange={handleChange}
            required
          />
          {/* Address */}
          <input
            name="address"
            placeholder="Address"
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            value={form.address}
            onChange={handleChange}
            required
          />
          {/* Password */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            value={form.password}
            onChange={handleChange}
            required
          />
          {/* Confirm Password */}
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* License Image Upload */}
          <div>
            <label className="text-sm font-medium block mb-1">Upload Driver License</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              required
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="License Preview"
                className="mt-3 w-full max-h-64 object-contain border rounded-lg"
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Registering..." : "Register as Delivery Personnel"}
          </button>
        </form>

        {/* Already have account */}
        <p className="text-sm text-center text-gray-500 mt-6">
          Already registered?{" "}
          <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
