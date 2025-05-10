import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Button, Card } from "flowbite-react";
import { fetchOrderDetails, updateOrderStatus } from "../../../services/restaurantService";

export default function OrderDetails({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [prepTime, setPrepTime] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      try {
        const data = await fetchOrderDetails(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error loading order", err);
        toast.error("Failed to load order");
      }
    };
    load();
  }, [orderId]);

  const handleUpdate = async (status) => {
    try {
      const payload = { orderStatus: status };
      if (status === "accepted" && prepTime) {
        payload.prepTime = prepTime;
      }
      if (status === "rejected" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      await updateOrderStatus(orderId, payload);
      toast.success(`Order ${status} successfully`);
      setTimeout(onClose, 500);
    } catch (err) {
      console.error("Failed to update order status", err);
      toast.error("Failed to update order");
    }
  };

  if (!order) {
    return (
      <div className="text-center py-20 text-gray-600 text-lg">
        Loading order details...
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 md:px-8 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-8">
        <h2 className="text-3xl font-bold text-yellow-600 text-center mb-8">
          Order Details
        </h2>

        <div className="space-y-2 text-gray-700 mb-6">
          <p><span className="font-semibold">Order ID:</span> {order._id}</p>
          <p><span className="font-semibold">Status:</span> {order.orderStatus}</p>
          <p><span className="font-semibold">Total Amount:</span> Rs. {order.totalAmount}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Items:</h3>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.name} – {item.quantity} × Rs.{item.price}
              </li>
            ))}
          </ul>
        </div>

        {(order.orderStatus === "pending" || order.orderStatus === "confirmed") && (
          <div className="space-y-6">
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Preparation Time (minutes)"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              <Button
                onClick={() => handleUpdate("accepted")}
                disabled={!prepTime}
                className={`w-full rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 ${
                  prepTime
                    ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-black"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Accept Order
              </Button>
            </div>

            <div className="space-y-3">
              <textarea
                placeholder="Optional rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
                rows={3}
              />
              <Button
                onClick={() => handleUpdate("rejected")}
                className="w-full rounded-xl bg-gradient-to-r from-red-400 to-red-600 text-black font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Reject Order
              </Button>
            </div>
          </div>
        )}

        {order.orderStatus === "accepted" && (
          <div className="mt-8">
            <Button
              onClick={() => handleUpdate("ready")}
              className="w-full rounded-xl bg-gradient-to-r from-purple-400 to-blue-500 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              Mark as Ready
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
