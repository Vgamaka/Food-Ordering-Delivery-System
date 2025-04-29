import { registerRestaurant } from "../../services/authService";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: 7.8731,
  lng: 80.7718,
};

export default function RegisterRestaurant() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [autocomplete, setAutocomplete] = useState(null);

  const [form, setForm] = useState({
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    description: "",
    location: {
      type: "Point",
      coordinates: [defaultCenter.lng, defaultCenter.lat],
    },
    proofImage: null,
  });

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const updateLocation = (lat, lng) => {
    setMarkerPosition({ lat, lng });
    setForm((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    }));
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    updateLocation(lat, lng);
  };

  const handleMarkerDragEnd = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    updateLocation(lat, lng);
  };

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      updateLocation(lat, lng);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, proofImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
  
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    const formData = new FormData();
    formData.append("name", form.ownerName);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("password", form.password);
    formData.append("role", "restaurant");
    formData.append("restaurantName", form.restaurantName);
    formData.append("description", form.description);
    formData.append("location", JSON.stringify(form.location));
    if (form.proofImage) {
      formData.append("proofImage", form.proofImage);
    }
  
    setLoading(true);
  
    try {
      await registerRestaurant(formData); // ✅ use service
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-2xl">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          Register Your Restaurant
        </h2>

        {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Basic Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              name="ownerName"
              placeholder="Owner Name"
              value={form.ownerName}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              required
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              required
            />
            <input
              name="restaurantName"
              placeholder="Restaurant Name"
              value={form.restaurantName}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <textarea
            name="description"
            placeholder="Restaurant Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
            rows="3"
            required
          />

          {/* Passwords */}
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              required
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              required
            />
          </div>

          {/* Proof Upload */}
          <div>
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
                alt="Selected Proof"
                className="mt-3 w-full max-h-64 object-contain border rounded-lg"
              />
            )}
          </div>

          {/* Location Search */}
          {isLoaded && (
            <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceChanged}>
              <input
                type="text"
                placeholder="Search location"
                className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
              />
            </Autocomplete>
          )}

          {/* Google Map */}
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={markerPosition}
              zoom={10}
              onClick={handleMapClick}
              onLoad={(map) => (mapRef.current = map)}
            >
              <Marker position={markerPosition} draggable onDragEnd={handleMarkerDragEnd} />
            </GoogleMap>
          ) : (
            <div className="text-gray-500 text-sm">Loading map...</div>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Registering..." : "Register Restaurant"}
          </button>
        </form>

        {/* Already have an account */}
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
