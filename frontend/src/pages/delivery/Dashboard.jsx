import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchOrdersByDriver, updateOrderStatus } from '../../services/driverService'; // ✅ New

export default function DriverDashboard() {
  const navigate = useNavigate();
  const driverId = localStorage.getItem('driverId');
  const driverName = localStorage.getItem('driverName');
  const licensePhoto = localStorage.getItem('licensePhoto'); // ⬅️ Load image path

  const [orders, setOrders] = useState([]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!driverId) {
      navigate('/login');
    }
  }, [driverId, navigate]);

  // Fetch assigned orders
  const fetchOrders = async () => {
    try {
      const res = await fetchOrdersByDriver(driverId);
      setOrders(res);
    } catch (err) {
      console.error('Order fetch error:', err);
    }
  };

  useEffect(() => {
    if (driverId) {
      fetchOrders();
    }
  }, [driverId]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('driverId');
    localStorage.removeItem('driverName');
    localStorage.removeItem('licensePhoto');
    navigate('/login');
  };

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Navigate to DriverOrders page
  const handleViewOrders = () => {
    navigate('/delivery/orders');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Profile section */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {driverName || 'Driver'}</h2>
          <p className="text-sm text-gray-500 mb-1">You’re logged in as a delivery partner.</p>

          <button
            onClick={() => navigate('/driverProfile')}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
          >
            View Profile
          </button>

          {/* Button to navigate to DriverOrders */}
          <button
            onClick={handleViewOrders}
            className="ml-4 bg-green-600 text-white text-sm px-3 py-1 rounded"
          >
            View Orders
          </button>
        </div>
        
        {licensePhoto && (
          <img
            src={`http://localhost:3009/${licensePhoto}`}
            alt="License"
            className="w-28 h-28 object-cover rounded-md shadow"
          />
        )}
        <button
          onClick={handleLogout}
          className="ml-4 bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Orders list */}
      <h3 className="text-lg font-semibold mb-3">Assigned Orders</h3>
      {orders.length === 0 ? (
        <p>No orders assigned yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border p-3 rounded mb-3 shadow">
            <p><b>Pickup Location:</b> {order.pickupLocation}</p>
            <p><b>Delivery Location:</b> {order.deliveryLocation}</p>
            <p><b>Status:</b> <span className="font-semibold">{order.orderStatus}</span></p>

            {order.items && order.items.length > 0 && (
              <div>
                <strong>Items:</strong>
                <ul className="list-disc ml-6">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} x {item.quantity} - ${item.price}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons Based on Status */}
            {order.orderStatus === 'Assigned' && (
              <button
                onClick={() => updateStatus(order._id, 'Started')}
                className="bg-yellow-500 text-white px-3 py-1 rounded mt-2"
              >
                Start Delivery
              </button>
            )}

            {order.orderStatus === 'Started' && (
              <button
                onClick={() => updateStatus(order._id, 'Delivered')}
                className="bg-green-600 text-white px-3 py-1 rounded mt-2"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
