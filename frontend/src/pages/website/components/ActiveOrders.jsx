import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchOrdersByCustomer, cancelOrder as cancelOrderAPI } from "../../../services/customerService"; 

export default function ActiveOrders() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 5; // 5 orders per page

  const fetchOrders = async () => {
    try {
      const res = await fetchOrdersByCustomer(user.id);
      const activeOrders = res.filter(
        (order) =>
          order.orderStatus !== "cancelled" &&
          order.orderStatus !== "rejected" &&
          order.orderStatus !== null
      );
      setOrders(activeOrders);
    } catch (err) {
      console.error("Failed to fetch active orders", err);
      toast.error("Failed to load active orders");
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrderAPI(orderId);
      toast.success("Order cancelled successfully");
      fetchOrders(); // refresh after cancel
    } catch (err) {
      console.error("Error cancelling order", err);
      toast.error("Failed to cancel order");
    }
  };

  // Pagination handling
  const paginatedOrders = orders.slice((page - 1) * limit, page * limit);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-6">
        Loading Active Orders...
      </p>
    );

  return (
    <div className="space-y-6">
      {paginatedOrders.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No active orders found.</p>
      ) : (
        paginatedOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-xl shadow-md p-6 space-y-3 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-700 font-semibold">
                  Order ID: <span className="text-gray-900">{order._id}</span>
                </p>
                <p className="capitalize text-sm text-gray-600">
                  Status: {order.orderStatus}
                </p>
                <p className="text-sm text-gray-600">
                  Total: <span className="font-medium">Rs. {order.totalAmount}</span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex-shrink-0">
                {["pending", "confirmed"].includes(order.orderStatus) ? (
                  <button
                  onClick={() => handleCancelOrder(order._id)} // ✅ Fixed function call
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-300"
                  >
                    Cancel Order
                  </button>
                ) : (
                  <Link
                    to={`/website/DeliveryTracking/${order._id}`}
                    className="bg-red-100 hover:bg-red-600 hover:text-white text-red-600 text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-300 inline-block"
                  >
                    Track Order
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Pagination Controls */}
      {orders.length > limit && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(orders.length / limit) }).map((_, idx) => (
            <button
              key={idx}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                page === idx + 1
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 hover:bg-red-100"
              }`}
              onClick={() => setPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
