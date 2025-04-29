import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileDetails from "./components/ProfileDetails";
import ActiveOrders from "./components/ActiveOrders";
import CancelledOrders from "./components/CancelledOrders";
import { User } from "lucide-react";
import Navbar from "../../Components/NavBar";
import Footer from "../../Components/Footer";

export default function CusProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 container mx-auto px-4 pt-20 pb-10 gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white rounded-xl shadow-md p-6 space-y-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-red-600 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold">
              {getInitials()}
            </div>
            <p className="text-lg font-semibold">{getUser()?.name}</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-4">
            <button
              className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                activeTab === "profile"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-red-100"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>
            <button
              className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                activeTab === "active"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-red-100"
              }`}
              onClick={() => setActiveTab("active")}
            >
              Active Orders
            </button>
            <button
              className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                activeTab === "cancelled"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-red-100"
              }`}
              onClick={() => setActiveTab("cancelled")}
            >
              Cancelled & Rejected
            </button>
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-100 hover:bg-red-600 hover:text-white text-red-600 py-2 rounded-full transition-colors duration-300"
          >
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-xl shadow-md p-6">
          {activeTab === "profile" && <ProfileDetails />}
          {activeTab === "active" && <ActiveOrders />}
          {activeTab === "cancelled" && <CancelledOrders />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

// Helper: Get logged in user from localStorage
function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// Helper: Create initials from name
function getInitials() {
  const user = getUser();
  if (!user || !user.name) return "U"; // fallback
  const names = user.name.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[1][0]).toUpperCase();
}

// Helper: Logout with confirmation
function handleLogout() {
  const confirmLogout = window.confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}
