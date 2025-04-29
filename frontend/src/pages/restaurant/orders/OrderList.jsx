import { useEffect, useState } from "react";
import { fetchOrders as fetchOrdersAPI } from "../../../services/restaurantService";
import { motion } from "framer-motion";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")); // ✅ fix added

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5; // ✅ Show 5 orders per page

  const restaurantId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    if (!restaurantId) return;   // Prevent bad calls

    const fetch = async () => {
      setLoading(true);
      try {
        const data = await fetchOrdersAPI(restaurantId);
        console.log("✅ Orders fetched:", data);
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [restaurantId]);


  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "pendingConfirmed") {
        return order.orderStatus === "pending" || order.orderStatus === "confirmed";
      }
      return order.orderStatus === filterStatus;
    })
    : [];

  // Calculate orders for current page
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Pagination functions
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredOrders.length / ordersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 md:px-8 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title */}
      <h2 className="text-3xl font-bold text-yellow-600 text-center mb-8">
        Restaurant Order Management
      </h2>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { key: "all", label: "All Orders" },
          { key: "pendingConfirmed", label: "Pending & Confirmed" },
          { key: "accepted", label: "Accepted" },
          { key: "ready", label: "Ready" },
          { key: "rejected", label: "Rejected" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-xl font-semibold transition ${filterStatus === key
                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-lg hover:shadow-2xl"
                : key === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Loading or Orders */}
      {loading ? (
        <div className="text-center py-20 text-gray-600 text-lg">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-md">
          No orders found for this selection.
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {currentOrders.map((order) => (
              <motion.div
                key={order._id}
                className="bg-white rounded-xl shadow p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-semibold">Order ID:</span> {order._id}</p>
                    <p><span className="font-semibold">Status:</span> {order.orderStatus}</p>
                    <p><span className="font-semibold">Payment:</span> {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</p>
                    <p><span className="font-semibold">Total:</span> Rs. {order.totalAmount}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        window.location.href = `/restaurant/orders/${order._id}`;
                      }}
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-xl transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl font-semibold transition ${currentPage === 1
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-lg hover:shadow-2xl"
                }`}
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
              className={`px-4 py-2 rounded-xl font-semibold transition ${currentPage === Math.ceil(filteredOrders.length / ordersPerPage)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-orange-400 text-black shadow-lg hover:shadow-2xl"
                }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
