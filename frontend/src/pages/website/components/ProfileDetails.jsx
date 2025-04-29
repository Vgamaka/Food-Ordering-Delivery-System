import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { updateUserProfile  } from "../../../services/customerService";

export default function ProfileDetails() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(user.id, form);
      toast.success("Profile updated successfully!");

      // Update local storage if name or email changed
      const updatedUser = { ...user, name: form.name, email: form.email, phone: form.phone };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        My Profile
      </h2>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Name
          </label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Phone
          </label>
          <input
            name="phone"
            type="text"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            New Password (optional)
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave empty if not changing"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Update Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full transition duration-300"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
