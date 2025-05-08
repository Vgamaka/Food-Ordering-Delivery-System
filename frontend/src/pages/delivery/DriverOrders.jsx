import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { fetchOrdersByDriver, assignOrderToDriver, updateOrderStatus, fetchDriverProfile } from '../../services/driverService';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const centerDefault = {
  lat: 6.9271,
  lng: 79.8612
};

const libraries = ['places'];

const DriverOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [mapError, setMapError] = useState(null);
  const [directions, setDirections] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [driverAvailability, setDriverAvailability] = useState(true);

  const navigate = useNavigate();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setDriverLocation(pos);
        },
        () => {
          toast.error("Error getting your location");
        }
      );
    } else {
      toast.error("Your browser doesn't support geolocation");
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
    const locationInterval = setInterval(getCurrentLocation, 60000);
    return () => clearInterval(locationInterval);
  }, [getCurrentLocation]);

  // Fetch driver profile to get availability status
  const fetchDriverInfo = async () => {
    const driverId = localStorage.getItem('driverId');
    if (!driverId) {
      navigate('/login');
      return;
    }

    try {
      const driverData = await fetchDriverProfile(driverId);
      setDriverAvailability(driverData.availability);
      return driverData.availability;
    } catch (err) {
      console.error("Error fetching driver profile:", err);
      toast.error("Failed to fetch your profile");
      return null;
    }
  };

  const calculateDirections = useCallback(async (destination) => {
    if (!driverLocation) {
      toast.warning("Waiting for your current location...");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: driverLocation,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        provideRouteAlternatives: false,
        avoidHighways: false,
        avoidTolls: false,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: 'bestguess'
        }
      });
      setDirections(result);
    } catch (error) {
      console.error('Direction calculation error:', error);
      toast.error('Could not calculate directions');
    }
  }, [driverLocation]);

  const openGoogleMaps = (origin, destination) => {
    if (!origin || !destination) {
      toast.error("Location data not available");
      return;
    }

    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}&travelmode=driving`;

    window.open(url, "_blank");
  };

  const fetchOrders = async () => {
    const driverId = localStorage.getItem('driverId');
    if (!driverId) {
      navigate('/login');
      return;
    }

    try { 
      setLoading(true); 
      // Ensure we have the latest availability status
      const isAvailable = await fetchDriverInfo();
      
      const ordersData = await fetchOrdersByDriver(driverId); 
      console.log('Raw orders from API:', ordersData); // Debug log 
      setOrders(ordersData); 
      
      // If driver is unavailable and trying to view available orders, switch to ongoing tab
      if (isAvailable === false && activeTab === 'available') {
        setActiveTab('ongoing');
        toast.info('You are currently unavailable. Set yourself to available to see new orders.');
      }
    } catch (err) { 
      console.error("Error fetching orders:", err); 
      toast.error("Failed to fetch orders"); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (orderId) => {
    const driverId = localStorage.getItem('driverId');
    if (!driverId) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    
    // Check if driver is available before trying to accept
    if (!driverAvailability) {
      toast.error('You must set your status to Available before accepting orders');
      return;
    }
  
    try {
      setActionLoading(orderId);
      await assignOrderToDriver(orderId, driverId);
      toast.success('Order accepted successfully');
      fetchOrders();
    } catch (err) {
      console.error('Error assigning order:', err);
      const errorMessage = err.response?.data?.message || 'Failed to accept order';
      toast.error(errorMessage);
    } finally {
      setActionLoading('');
    }
  };
  
  const handleStatusUpdate = async (orderId, newStatus) => { 
    try { 
      setActionLoading(orderId); 
      await updateOrderStatus(orderId, newStatus); 
      toast.success(`Order marked as ${newStatus}`); 
      fetchOrders(); 
      
      // Clear directions when order is completed
      if (newStatus === 'delivered') {
        setDirections(null);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      onTheWay: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filterOrders = () => {
    // No need to show available orders tab if driver isn't available
    if (activeTab === 'available' && !driverAvailability) {
      return [];
    }
    
    let filteredOrders;
    if (activeTab === 'available') {
      filteredOrders = orders.filter(order => 
        order.orderStatus === 'ready' && !order.assignedDriverId
      );
      console.log('Available orders:', filteredOrders);
    } else if (activeTab === 'ongoing') {
      filteredOrders = orders.filter(order => 
        order.orderStatus === 'onTheWay' // Only show "onTheWay" orders in ongoing tab
      );
      console.log('Ongoing orders:', filteredOrders);
    } else {
      filteredOrders = orders.filter(order => 
        ['delivered', 'cancelled'].includes(order.orderStatus)
      );
      console.log('Completed orders:', filteredOrders);
    }
    return filteredOrders;
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    // If in available tab, show restaurant location, otherwise show delivery location
    if (activeTab === 'available' && order.restaurantLocation?.coordinates) {
      const location = {
        lat: order.restaurantLocation.coordinates[1],
        lng: order.restaurantLocation.coordinates[0]
      };
      setSelectedLocation(location);
      setDirections(null); // Clear existing directions
      
      // Calculate directions to restaurant if we have driver location
      if (driverLocation) {
        calculateDirections(location);
      }
    } else if (order.deliveryLocation?.coordinates) {
      const destination = {
        lat: order.deliveryLocation.coordinates[1],
        lng: order.deliveryLocation.coordinates[0]
      };
      setSelectedLocation(destination);
      
      if (order.orderStatus === 'onTheWay') {
        calculateDirections(destination);
      } else {
        setDirections(null);
      }
    }
  };

  const toggleOrderExpand = (orderId, event) => {
    event.stopPropagation();
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const renderActionButtons = (order) => {
    const isLoading = actionLoading === order._id;
    const baseClasses = "px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]";
    
    if (order.orderStatus === "ready") {
      return (
        <div className="flex gap-2">
          {order.restaurantLocation?.coordinates && driverLocation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const destination = {
                  lat: order.restaurantLocation.coordinates[1],
                  lng: order.restaurantLocation.coordinates[0]
                };
                openGoogleMaps(driverLocation, destination);
              }}
              className={`${baseClasses} bg-red-700 hover:bg-red-600`}
            >
              Navigate to Restaurant
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAccept(order._id);
            }}
            disabled={isLoading}
            className={`${baseClasses} bg-blue-600 hover:bg-blue-700`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Accepting...
              </>
            ) : (
              'Accept Order'
            )}
          </button>
        </div>
      );
    }
    
    if (order.orderStatus === "accepted") {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusUpdate(order._id, "onTheWay");
          }}
          disabled={isLoading}
          className={`${baseClasses} bg-yellow-500 hover:bg-yellow-600`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting...
            </>
          ) : (
            'Start Delivery'
          )}
        </button>
      );
    }
    
    if (order.orderStatus === "onTheWay") {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusUpdate(order._id, "delivered");
          }}
          disabled={isLoading}
          className={`${baseClasses} bg-green-600 hover:bg-green-700`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Completing...
            </>
          ) : (
            'Complete Delivery'
          )}
        </button>
      );
    }
    
    return null;
  };

  const renderMap = () => {
    if (loadError) {
      return (
        <div className="bg-red-50 p-4 rounded-lg text-red-600">
          <p className="font-medium">Failed to load Google Maps</p>
          <p className="text-sm mt-1">Please check your internet connection and try again.</p>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading map...</p>
          </div>
        </div>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedLocation || driverLocation || centerDefault}
        zoom={selectedLocation ? 14 : 10}
        onLoad={() => setMapError(null)}
        onError={(e) => setMapError(e)}
      >
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}
        {selectedLocation && !directions && <Marker position={selectedLocation} />}
        {directions && (
          <DirectionsRenderer 
            directions={directions}
            options={{
              suppressMarkers: false,
              preserveViewport: false,
              polylineOptions: {
                strokeColor: "#2196F3",
                strokeWeight: 5
              }
            }}
          />
        )}
      </GoogleMap>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-red-800">Delivery Orders</h2>
            <p className="text-sm text-black-600">Manage and track your delivery orders</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center">
              {/* Enhanced attention-grabbing status indicator */}
              <div className={`flex items-center px-3 py-1.5 rounded-full ${
                driverAvailability 
                ? 'bg-green-100 border border-green-300 animate-pulse' 
                : 'bg-red-100 border border-red-300'
              }`}>
                <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                  driverAvailability ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`font-medium text-sm ${
                  driverAvailability ? 'text-green-700' : 'text-red-700'
                }`}>
                  Status: {driverAvailability ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            {/* Enhanced "Back to Profile" button */}
            <button 
              onClick={() => navigate('/driverProfile')}
              className="px-4 py-1.5 text-sm font-medium bg-red-700 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Back to Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="border-b">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'available', label: 'Available', count: driverAvailability ? orders.filter(o => o.orderStatus === 'ready' && !o.assignedDriverId).length : 0 },
                { id: 'ongoing', label: 'Ongoing', count: orders.filter(o => ['accepted', 'onTheWay'].includes(o.orderStatus)).length },
                { id: 'completed', label: 'Completed', count: orders.filter(o => ['delivered', 'cancelled'].includes(o.orderStatus)).length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${tab.id === 'available' && !driverAvailability ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={tab.id === 'available' && !driverAvailability}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Driver Unavailable Warning */}
        {!driverAvailability && activeTab === 'available' && (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg shadow-sm mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">You are currently unavailable</h3>
                <p className="text-sm mt-1">
                  To see and accept new orders, please set your status to "Available" in your profile.
                </p>
                <div className="mt-2">
                  <button 
                    onClick={() => navigate('/driverProfile')}
                    className="text-sm font-medium text-yellow-700 hover:text-yellow-600 underline"
                  >
                    Go to Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/2 space-y-3">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="animate-pulse space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filterOrders().length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                {activeTab === 'available' && !driverAvailability ? (
                  <p className="text-gray-500">You must set your status to "Available" to see new orders</p>
                ) : (
                  <p className="text-gray-500">No {activeTab} orders found</p>
                )}
                {activeTab === 'available' && driverAvailability && (
                  <p className="text-xs text-gray-400 mt-1">Check back later for new orders</p>
                )}
              </div>
            ) : (
              filterOrders().map((order) => (
                <div
                  key={order._id}
                  className={`p-3 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow cursor-pointer ${
                    selectedOrder?._id === order._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleOrderSelect(order)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <button
                        onClick={(e) => toggleOrderExpand(order._id, e)}
                        className="mt-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${
                            expandedOrders[order._id] ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <p className="font-medium text-sm truncate">#{order._id.slice(-6)}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{order.deliveryAddress}</p>
                        <p className="text-xs text-gray-500">Rs. {order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      {renderActionButtons(order)}
                    </div>
                  </div>

                  <div className={`overflow-hidden transition-all duration-200 ${
                    expandedOrders[order._id] ? 'max-h-96 mt-3' : 'max-h-0'
                  }`}>
                    <div className="space-y-2 border-t pt-2">
                      <p className="text-xs"><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</p>
                      
                      {activeTab === 'available' && directions && selectedOrder?._id === order._id && (
                        <div className="p-2 bg-blue-50 rounded text-xs">
                          <p className="font-medium text-blue-800 mb-1">Distance to Restaurant:</p>
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-blue-800">
                              <i className="fas fa-clock mr-1"></i>
                              {directions.routes[0].legs[0].duration.text}
                            </p>
                            <p className="font-medium text-blue-800">
                              <i className="fas fa-road mr-1"></i>
                              {directions.routes[0].legs[0].distance.text}
                            </p>
                          </div>
                        </div>
                      )}

                      {order.orderStatus === 'onTheWay' && directions && selectedOrder?._id === order._id && (
                        <div className="p-2 bg-blue-50 rounded text-xs">
                          <p className="font-medium text-blue-800 mb-1">Distance to Customer:</p>
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-blue-800">
                              <i className="fas fa-clock mr-1"></i>
                              {directions.routes[0].legs[0].duration.text}
                            </p>
                            <p className="font-medium text-blue-800">
                              <i className="fas fa-road mr-1"></i>
                              {directions.routes[0].legs[0].distance.text}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium mb-1">Items:</p>
                        <ul className="text-xs space-y-0.5 text-gray-600">
                          {order.items?.map((item, idx) => (
                            <li key={idx}>
                              {item.name} × {item.quantity} - Rs. {(item.price * item.quantity).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {order.orderStatus === 'onTheWay' && driverLocation && order.deliveryLocation?.coordinates && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const destination = {
                              lat: order.deliveryLocation.coordinates[1],
                              lng: order.deliveryLocation.coordinates[0]
                            };
                            openGoogleMaps(driverLocation, destination);
                          }}
                          className="w-full mt-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md flex items-center justify-center gap-1"
                        >
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Navigate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="lg:w-1/2 lg:sticky lg:top-4 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-bold mb-2">Delivery Location</h2>
              {selectedOrder ? (
                <>
                  <p className="text-sm text-gray-600 mb-2">{selectedOrder.deliveryAddress}</p>
                  {directions && (
                    <div className="text-sm space-y-1 mb-3">
                      <p className="font-medium text-gray-700">
                        <i className="fas fa-clock mr-2"></i>
                        Est. Time: {directions.routes[0].legs[0].duration.text}
                      </p>
                      <p className="font-medium text-gray-700">
                        <i className="fas fa-road mr-2"></i>
                        Distance: {directions.routes[0].legs[0].distance.text}
                      </p>
                    </div>
                  )}
                  {selectedOrder.orderStatus === 'onTheWay' && driverLocation && selectedLocation && (
                    <button
                      onClick={() => openGoogleMaps(driverLocation, selectedLocation)}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Open in Google Maps
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">Select an order to view its delivery location</p>
              )}
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-sm">
              {renderMap()}
            </div>

            {mapError && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">Error loading map: {mapError.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverOrders;
