import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  UserCheck, 
  LogOut, 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Check, 
  X, 
  Phone, 
  FileText,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { fetchPendingUsers, approveUser, rejectUser } from '../../services/adminService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // success, error, info
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetchPendingUsers();
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch pending users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    try {
      const actionLoading = action === "approve" ? "Approving user..." : "Rejecting user...";
      const actionSuccess = action === "approve" ? "User approved successfully!" : "User rejected successfully!";
      const actionError = action === "approve" ? "Failed to approve user." : "Failed to reject user.";
  
      const loadingToastId = toast.loading(actionLoading);
  
      if (action === "approve") {
        await approveUser(userId);
      } else {
        await rejectUser(userId);
      }
  
      toast.update(loadingToastId, {
        render: actionSuccess,
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
  
      fetchPending(); // Refresh list
    } catch (err) {
      console.error(`${action} failed:`, err);
  
      toast.update(loadingToastId, {
        render: `Failed to ${action} user.`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };
  

  const openImageModal = (imageName) => {
    setSelectedImage(`http://localhost:3001/uploads/${imageName}`);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  useEffect(() => {
    fetchPending();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Change page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getStatusAlert = () => {
    if (!actionStatus) return null;
    
    const alertStyles = {
      success: "bg-green-50 border-l-4 border-green-500 text-green-700",
      error: "bg-red-50 border-l-4 border-red-500 text-red-700",
      info: "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
    };
    
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      error: <AlertCircle className="h-5 w-5 text-red-500" />,
      info: <AlertCircle className="h-5 w-5 text-blue-500" />
    };
    
    return (
      <div className={`${alertStyles[statusType]} p-4 mb-6 rounded-r-md`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {icons[statusType]}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{actionStatus}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button 
                onClick={() => setActionStatus("")}
                className={`inline-flex rounded-md p-1.5 ${
                  statusType === 'success' ? 'text-green-500 hover:bg-green-100' :
                  statusType === 'error' ? 'text-red-500 hover:bg-red-100' :
                  'text-blue-500 hover:bg-blue-100'
                } focus:outline-none`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pagination component
  const Pagination = () => {
    // Generate page numbers
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Complex pagination logic for many pages
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // Add first page
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastUser, users.length)}
              </span>{" "}
              of <span className="font-medium">{users.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                  currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {pageNumbers.map((number, index) => (
                number === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={number}
                    onClick={() => goToPage(number)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === number
                        ? 'z-10 bg-red-600 text-white focus-visible:outline-offset-2'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {number}
                  </button>
                )
              ))}
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                  currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Admin Hero Section */}
      <section className="relative pt-16 pb-10 bg-red-600 text-white">
        <div className="absolute inset-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-xl">Manage restaurant approvals and user accounts</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <UserCheck className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admin Control Panel</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Dashboard Navigation Button */}
            <Link 
              to="/admin/dashboard"
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                isActive('/admin/dashboard') 
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
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                isActive('/admin/approval') 
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

        {/* Notification Area */}
        {getStatusAlert()}

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Pending Restaurant Approvals</h3>
            {!loading && users.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full">
                {users.length} pending
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center p-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent">
              </div>
              <p className="mt-4 text-gray-500">Loading pending accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">All Caught Up!</h3>
              <p className="mt-1 text-gray-500">No pending accounts require approval.</p>
              <button 
                onClick={fetchPending}
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none transition-colors duration-300"
              >
                Refresh List
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentation</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-red-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <Phone className="h-4 w-4 text-gray-400 mr-1" />
                          {user.phone || "Not provided"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.licenseImage ? (
                          <button
                            onClick={() => openImageModal(user.licenseImage)}
                            className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            <span>View License</span>
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" />
                            <span>Not provided</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(user._id, "approve")}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(user._id, "reject")}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Component */}
              <Pagination />
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">Restaurant License</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex-1 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="License"
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
              />
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}