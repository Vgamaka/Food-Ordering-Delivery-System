import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import Navbar from "../../Components/NavBar";
import Footer from "../../Components/Footer";
import { fetchOrdersByCustomer  } from '../../services/customerService';

const DeliveryTracking = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth(); // Get auth context

  // Fetch orders automatically when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!auth.token) {
      toast.error('Please login to view your orders');
      return;
    }
  
    setLoading(true);
    try {
      const ordersData = await fetchOrdersByCustomer(auth.user.id);
      const sortedOrders = ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
      setSelectedOrder(sortedOrders[0] || null);
      if (sortedOrders.length === 0) {
        toast.info('No orders found');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };  

  // Poll for updates every 30 seconds if we have a selected order
  useEffect(() => {
    if (!selectedOrder || !auth.token) return;

    const interval = setInterval(async () => {
      try {
        const ordersData = await getOrdersByCustomer(auth.user.id);
        const updatedOrder = ordersData.find(order => order._id === selectedOrder._id);
        
        if (updatedOrder && updatedOrder.orderStatus !== selectedOrder.orderStatus) {
          setSelectedOrder(updatedOrder);
          setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
          
          if (updatedOrder.orderStatus === 'cancelled') {
            toast.error('Order has been cancelled');
          } else if (updatedOrder.orderStatus === 'rejected') {
            toast.error('Order has been rejected by the restaurant');
          } else {
            toast.info(`Order status updated to: ${updatedOrder.orderStatus}`);
          }
        }
      } catch (err) {
        console.error('Error polling order status:', err);
        toast.error('Unable to get order updates. Please refresh the page.');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedOrder, auth.token, auth.user.id]);

  const deliverySteps = [
    { status: 'pending', icon: '📋', label: 'Order Placed'},
    { status: 'confirmed', icon: '✅', label: 'Accepted'},
    { status: 'preparing', icon: '👨‍🍳', label: 'Preparing'},
    { status: 'ready', icon: '🔔', label: 'Ready'},
    { status: 'onTheWay', icon: '🚗', label: 'On the Way'},
    { status: 'delivered', icon: '🎉', label: 'Delivered'}
  ];

  const getCancelledStatus = (status) => {
    if (status === 'cancelled') return { icon: '❌', label: 'Cancelled', message: 'Order was cancelled' };
    if (status === 'rejected') return { icon: '⛔', label: 'Rejected', message: 'Order was rejected by restaurant' };
    return null;
  };

  const getStepStatus = (stepStatus, orderStatus) => {
    // Handle cancelled/rejected states
    if (orderStatus === 'cancelled' || orderStatus === 'rejected') {
      return 'cancelled';
    }
    
    const stepIndex = deliverySteps.findIndex(step => step.status === stepStatus);
    const orderIndex = deliverySteps.findIndex(step => step.status === orderStatus);
    
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-800 border-amber-200',
      accepted: 'bg-blue-50 text-blue-800 border-blue-200',
      preparing: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      ready: 'bg-violet-50 text-violet-800 border-violet-200',
      onTheWay: 'bg-orange-50 text-orange-800 border-orange-200',
      delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-800 border-gray-200';
  };

  const getStatusInfo = (status) => {
    return {
      pending: { icon: '📋', message: 'Order received and waiting for confirmation' },
      accepted: { icon: '✅', message: 'Restaurant has confirmed your order' },
      preparing: { icon: '👨‍🍳', message: 'Your food is being prepared' },
      ready: { icon: '🔔', message: 'Order is ready for delivery' },
      onTheWay: { icon: '🚗', message: 'Your order is on its way!' },
      delivered: { icon: '🎉', message: 'Order has been delivered' }
    }[status] || { icon: '📋', message: 'Processing order' };
  };

  const getPaymentAlert = (order) => {
    if (order.orderStatus === 'onTheWay' && order.paymentMethod === 'cod') {
      return {
        type: 'payment',
        icon: '💵',
        title: 'Payment Reminder',
        message: `Please keep Rs. ${order.totalAmount.toFixed(2)} ready for delivery`
      };
    }
    return null;
  };

  const getStatusMessage = (order) => {
    const messages = {
      pending: {
        type: 'info',
        icon: '⏳',
        message: 'Restaurant will confirm your order soon'
      },
      accepted: {
        type: 'info',
        icon: '👍',
        message: 'Your food will be prepared fresh'
      },
      preparing: {
        type: 'info',
        icon: '⏰',
        message: 'Estimated preparation time: 15-20 minutes'
      },
      ready: {
        type: 'info',
        icon: '🛵',
        message: 'Looking for a delivery partner nearby'
      },
      onTheWay: {
        type: 'info',
        icon: '🗺️',
        message: 'Your delivery partner is on the way!'
      },
      delivered: {
        type: 'success',
        icon: '⭐',
        message: 'Enjoy your meal!'
      }
    };
    return messages[order.orderStatus] || null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2">
            <Navbar />

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Orders</h2>
          {!auth.token && (
            <div className="text-center py-4">
              <p className="text-gray-600">Please login to view your orders</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block">
              <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
            <p className="text-gray-600 mt-2">Loading your orders...</p>
          </div>
        )}

        {orders.length > 0 && !loading && (
          <div className="space-y-2">
            {/* Order Tabs */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {orders.map(order => (
                    <button
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        selectedOrder?._id === order._id
                          ? getStatusColor(order.orderStatus)
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-sm font-medium">
                        Order #{order._id.slice(-6)}
                      </div>
                      <div className="text-xs opacity-75">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Order Progress */}
            {selectedOrder && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Status */}
                <div className="p-3 border-b border-gray-10">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {getStatusInfo(selectedOrder.orderStatus).icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                      </h3>
                      <p className="text-gray-600">
                        {getStatusInfo(selectedOrder.orderStatus).message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Progress Steps */}
                <div className="relative mb-12 mt-6">
                  {/* Progress bar background */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                  {/* Progress bar fill */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-500"
                    style={{ 
                      width: `${(deliverySteps.findIndex(step => step.status === selectedOrder.orderStatus) + 1) * (100 / deliverySteps.length)}%` 
                    }}
                  ></div>
                  
                  <div className="relative flex justify-between max-w-[850px] mx-auto px-1">
                    {deliverySteps.map((step) => {
                      const status = getStepStatus(step.status, selectedOrder.orderStatus);
                      return (
                        <div key={step.status} className="flex flex-col items-center relative px-4">
                          <div 
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg border-2 transition-all duration-500 ${
                              status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                              status === 'current' ? 'bg-white border-blue-500 text-blue-500' :
                              'bg-white border-gray-300 text-gray-300'
                            }`}
                          >
                            {step.icon}
                          </div>
                          <div className="absolute top-12 w-24 sm:w-32 text-center transform -translate-x-1/2 left-1/2">
                            <p className={`text-xs sm:text-sm whitespace-normal ${
                              status === 'completed' ? 'text-green-600' :
                              status === 'current' ? 'text-blue-600' :
                              'text-gray-700'
                            }`}>
                              {step.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Messages Section - Moved below visual progress */}
                <div className="px-6 pb-4 space-y-4">
                  {/* Status Message */}
                  {getStatusMessage(selectedOrder) && (
                    <div className={`p-4 rounded-lg ${
                      getStatusMessage(selectedOrder).type === 'success' 
                        ? 'bg-green-50 border border-green-100' 
                        : 'bg-blue-50 border border-blue-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getStatusMessage(selectedOrder).icon}</div>
                        <p className={`font-medium ${
                          getStatusMessage(selectedOrder).type === 'success'
                            ? 'text-green-800'
                            : 'text-blue-800'
                        }`}>
                          {getStatusMessage(selectedOrder).message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Alert for COD */}
                  {getPaymentAlert(selectedOrder) && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">💵</div>
                        <div>
                          <h4 className="font-medium text-yellow-800">
                            {getPaymentAlert(selectedOrder).title}
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            {getPaymentAlert(selectedOrder).message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Delivery Address</p>
                      <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium">
                        {selectedOrder.paymentMethod.toUpperCase()}
                        {selectedOrder.paymentMethod === 'cod' && ' - Pay on Delivery'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">Rs. {selectedOrder.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Order Items</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{item.name} × {item.quantity}</span>
                          <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>Rs. {selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {orders.length === 0 && !loading && auth.token && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">No orders found</div>
            <p className="text-sm text-gray-400 mt-1">Please check back later</p>
          </div>
        )}
      </div>
      <Footer />
    </div>

  );
};

export default DeliveryTracking;