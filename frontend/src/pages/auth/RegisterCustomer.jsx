import { registerCustomer } from "../../services/authService";
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

export default function RegisterCustomer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: {
      type: "Point",
      coordinates: [defaultCenter.lng, defaultCenter.lat],
    },
  });

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarkerPosition({ lat, lng });
    setForm((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
    }));
  };

  const onMarkerDragEnd = (e) => {
    handleMapClick(e);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

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
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
  
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    setLoading(true);
  
    try {
      await registerCustomer({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        location: form.location,
      });
  
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-lg">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          Create Customer Account
        </h2>

        {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <input
            name="name"
            placeholder="Name"
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

          {/* Location Search */}
          {isLoaded && (
            <Autocomplete
              onLoad={(auto) => setAutocomplete(auto)}
              onPlaceChanged={onPlaceChanged}
            >
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
              zoom={8}
              center={markerPosition}
              onClick={handleMapClick}
              onLoad={(map) => (mapRef.current = map)}
            >
              <Marker position={markerPosition} draggable onDragEnd={onMarkerDragEnd} />
            </GoogleMap>
          ) : (
            <div className="text-sm text-gray-500">Loading map...</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-red-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
