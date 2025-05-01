import { useEffect, useState, useRef } from "react";
import { fetchProfile, updateProfile, deleteAccount } from '../../services/restaurantService';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "flowbite-react";
import { motion } from "framer-motion";
import * as restaurantService from "../../services/restaurantService";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    restaurantName: "",
    description: "",
    isOpen: false,
    location: { lat: "", lng: "" },
  });

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const restaurantId = JSON.parse(localStorage.getItem("user"))?.id;
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await restaurantService.fetchProfile(restaurantId);
        console.log("🐛 Received profile data:", data);
        if (!data) throw new Error("Profile not found or API returned nothing");
        setForm({
          name: data.name,
          email: data.email,
          password: "",
          phone: data.phone,
          restaurantName: data.restaurantDetails?.name || "",
          description: data.restaurantDetails?.description || "",
          isOpen: data.restaurantDetails?.isOpen || false,
          location: {
            lat: data.location?.coordinates?.[1] ?? 6.9271,
            lng: data.location?.coordinates?.[0] ?? 79.8612,
          },
        });
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    loadProfile();
  }, [restaurantId]);

  useEffect(() => {
    if (!window.google || !form.location.lat || !form.location.lng) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: parseFloat(form.location.lat), lng: parseFloat(form.location.lng) },
      zoom: 15,
    });

    const marker = new window.google.maps.Marker({
      position: map.getCenter(),
      map,
      draggable: true,
    });

    marker.addListener("dragend", (e) => {
      const newPos = e.latLng.toJSON();
      setForm((prev) => ({ ...prev, location: { lat: newPos.lat, lng: newPos.lng } }));
    });

    map.addListener("click", (e) => {
      const newPos = e.latLng.toJSON();
      marker.setPosition(newPos);
      setForm((prev) => ({ ...prev, location: { lat: newPos.lat, lng: newPos.lng } }));
    });

    markerRef.current = marker;
  }, [form.location.lat, form.location.lng]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await updateProfile(user.id, {
        ...form,
        location: JSON.stringify(form.location), // ✅ send as string
      });
      console.log("📍 Sending updated form data:", form);
      toast.success("Profile updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await deleteAccount(user.id);
      toast.success("Account deleted");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    }
  };
  // ─── Logout ───────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");   // or "/" if your login route is the home page
  };
  if (loading) {
    return (
      <div className="text-center py-20 text-lg font-medium text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="max-w-3xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-yellow-600">
          Restaurant Profile
        </h2>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg mb-6 shadow-inner">
          <span className="text-lg font-semibold text-yellow-700">Availability:</span>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.isOpen}
              onChange={(e) => setForm((prev) => ({ ...prev, isOpen: e.target.checked }))}
            />
            <div className="w-14 h-8 bg-gray-300 peer-checked:bg-green-500 rounded-full transition-colors duration-300 relative">
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-6"></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {form.isOpen ? "Open" : "Closed"}
            </span>
          </label>
        </div>

        {/* Profile Form */}
        <form className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">New Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Restaurant Name</label>
            <input
              name="restaurantName"
              value={form.restaurantName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          {/* Google Map */}
          <div className="mt-6">
            <label className="block mb-2 text-sm text-gray-700">
              Select Location on Map
            </label>
            <div ref={mapRef} style={{ width: "100%", height: "300px" }} className="rounded-lg shadow border"></div>
            <p className="text-sm text-gray-500 mt-1">
              Click or drag marker to change restaurant location.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button
              size="xl"
              onClick={handleUpdate}
              className="w-full md:w-auto rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Save Changes
            </Button>

            <Button
              size="xl"
              onClick={handleDelete}
              className="w-full md:w-auto rounded-xl bg-gradient-to-r from-red-400 to-red-600 text-black font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Delete Account
            </Button>
            <Button
              size="xl"
              onClick={handleLogout}
              className="w-full md:w-auto rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 text-black font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Logout
            </Button>
          </div>

        </form>
      </Card>
    </motion.div>
  );
}
