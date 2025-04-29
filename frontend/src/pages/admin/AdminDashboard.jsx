import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  UserCheck,
  LogOut,
  Clock,
  Search,
  Trash2,
  Filter,
  UserCircle,
  Utensils,
  Truck,
  LayoutDashboard
} from "lucide-react";
import { fetchUsers, fetchCounts, deleteUser } from '../../services/adminService';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [overview, setOverview] = useState({ customer: 0, restaurant: 0, delivery: 0 });
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUsersData = async () => {
    try {
      const res = await fetchUsers(roleFilter, searchTerm, page);
      setUsers(res.data.users);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const fetchOverviewCounts = async () => {
    try {
      const counts = await fetchCounts();
      setOverview(counts);
    } catch (err) {
      console.error("Failed to load counts", err);
    }
  };

  const handleDelete = async (userId) => {
    try {
      // Confirm before proceeding with delete action
      const confirmed = window.confirm("Are you sure you want to delete this user?");
      if (!confirmed) return;

      // Proceed with the delete action
      await deleteUser(userId);
      toast.success("User deleted successfully!");
      fetchUsersData(); // Refresh user list
    } catch (err) {
      toast.error("Failed to delete user");
      console.error("Delete error:", err);
    }
  };


  const handleRowClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  useEffect(() => {
    fetchUsersData();
  }, [roleFilter, searchTerm, page]);

  useEffect(() => {
    fetchOverviewCounts();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  // Get card icon
  const getCardIcon = (title) => {
    switch (title) {
      case "Customers":
        return <UserCircle className="text-red-500" size={24} />;
      case "Restaurants":
        return <Utensils className="text-red-500" size={24} />;
      case "Delivery Personnel":
        return <Truck className="text-red-500" size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Admin Hero Section */}
      <section className="relative pt-16 pb-10 bg-red-600 text-white">
        <div className="absolute inset-0 "></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-xl">Manage users, restaurants, and delivery personnel</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <LayoutDashboard className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admin Control Panel</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Dashboard Navigation Button */}
            <Link
              to="/admin/dashboard"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${isActive('/admin/dashboard')
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>

            {/* Approvals Navigation Button */}
            <Link
              to="/admin/approval"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${isActive('/admin/approval')
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Approvals
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <Card title="Customers" value={overview.customer} icon={getCardIcon("Customers")} />
          <Card title="Restaurants" value={overview.restaurant} icon={getCardIcon("Restaurants")} />
          <Card title="Delivery Personnel" value={overview.delivery} icon={getCardIcon("Delivery Personnel")} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center w-full sm:w-auto">
              <Filter className="text-gray-500 mr-2" size={20} />
              <select
                value={roleFilter}
                onChange={(e) => { setPage(1); setRoleFilter(e.target.value); }}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="restaurant">Restaurant</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }}
                className="border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            </div>

            <CSVLink
              data={users}
              filename={`users_${roleFilter || "all"}_page${page}.csv`}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition duration-200 w-full sm:w-auto text-center"
            >
              Export CSV
            </CSVLink>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => handleRowClick(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(user.status)}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent opening modal
                            handleDelete(user._id);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-md text-sm transition-colors duration-200 ${page === i + 1
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="User Details"
        className="bg-white p-0 max-w-2xl mx-auto rounded-xl shadow-2xl overflow-hidden animate-fadeIn"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300"
      >
        {selectedUser && (
          <div>
            <div className="relative bg-gradient-to-r from-red-600 to-red-800 text-white p-8">
              <div className="absolute top-4 right-4">
                <button
                  onClick={closeModal}
                  className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">{selectedUser.name}</h2>
                  <div className="flex items-center">
                    <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-medium text-white capitalize">{selectedUser.role}</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${selectedUser.status === "approved" ? "bg-green-500 text-white" :
                        selectedUser.status === "pending" ? "bg-yellow-500 text-white" :
                          "bg-red-500 text-white"
                      }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-gray-50 p-6 rounded-xl shadow-sm mb-8">
                <h3 className="text-gray-700 font-medium mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Email Address</p>
                      <p className="font-medium text-gray-800">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Phone Number</p>
                      <p className="font-medium text-gray-800">{selectedUser.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedUser.role === "restaurant" && selectedUser.restaurantDetails && (
                <div className="bg-gray-50 p-6 rounded-xl shadow-sm mb-8">
                  <h3 className="text-gray-700 font-medium mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Restaurant Details
                  </h3>
                  <div className="mb-4">
                    <p className="text-gray-500 text-sm mb-1">Restaurant Name</p>
                    <p className="font-medium text-gray-800">{selectedUser.restaurantDetails.name}</p>
                  </div>
                  <div className="mb-6">
                    <p className="text-gray-500 text-sm mb-1">Description</p>
                    <p className="text-gray-700">{selectedUser.restaurantDetails.description}</p>
                  </div>
                  {selectedUser.restaurantDetails.proofImage && (
                    <div>
                      <p className="text-gray-500 text-sm mb-2">Proof Document</p>
                      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <img
                          src={`${import.meta.env.VITE_AUTH_IMAGE_BASE_URL}/${selectedUser.restaurantDetails.proofImage}`}
                          alt="Proof"
                          className="w-full max-h-64 object-contain bg-white p-2"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedUser.role === "delivery" && selectedUser.licenseImage && (
                <div className="bg-gray-50 p-6 rounded-xl shadow-sm mb-8">
                  <h3 className="text-gray-700 font-medium mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    License Details
                  </h3>
                  <div>
                    <p className="text-gray-500 text-sm mb-2">License Image</p>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={`${import.meta.env.VITE_AUTH_IMAGE_BASE_URL}/${selectedUser.licenseImage}`}
                        alt="License"
                        className="w-full max-h-64 object-contain bg-white p-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <button
                  onClick={closeModal}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg flex items-center font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const Card = ({ title, value, icon }) => (
  <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-red-500 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className="bg-red-50 p-3 rounded-full">
      {icon}
    </div>
  </div>
);