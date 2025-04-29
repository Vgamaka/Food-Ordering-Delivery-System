import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchOrdersByCustomer, fetchRestaurantById } from "../../services/customerService";

const CustomerOrders = () => {
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await fetchOrdersByCustomer(auth.user?.id);
    
        const ordersWithNames = await Promise.all(
          ordersData.map(async (order) => {
            let restaurantName = "Unknown";
            try {
              const restaurantData = await fetchRestaurantById(order.restaurantId);
              restaurantName = restaurantData?.restaurantDetails?.name || "Unknown";
            } catch {
              // fail silently
            }
            return { ...order, restaurantName };
          })
        );
    
        setOrders(ordersWithNames);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };
    

    if (auth.user?.id) fetchOrders();
  }, [auth]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-green-700">🛍️ Your Orders</h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border rounded-xl shadow-md p-6 bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-2 text-sm text-gray-500">Order ID: <span className="font-mono">{order._id}</span></div>
              <div className="mb-1"><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</div>
              <div className="mb-1"><strong>Restaurant:</strong> {order.restaurantName}</div>
              <div className="mb-1"><strong>Delivery Address:</strong> {order.deliveryAddress || "Not provided"}</div>
              <div className="mb-1"><strong>Payment:</strong> {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})</div>
              <div className="mb-3"><strong>Status:</strong> <span className="text-blue-600">{order.orderStatus}</span></div>

              <div className="mt-2">
                <strong>Items:</strong>
                <ul className="ml-4 mt-1 list-disc text-gray-800">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.quantity} — Rs. {item.price * item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ✅ Delivery Fee and Total */}
              <div className="mt-4 text-sm text-gray-700">
                <div>Delivery Fee: <strong>Rs. {order.deliveryFee || 0}</strong></div>
              </div>

              <div className="text-right font-bold text-lg mt-2 text-green-700">
                Total Amount: Rs. {order.totalAmount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
