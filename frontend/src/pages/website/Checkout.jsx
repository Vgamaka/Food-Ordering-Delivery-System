import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useLoadScript,
} from "@react-google-maps/api";
import { ChevronRight, MapPin, CreditCard, DollarSign, Truck, Check } from "lucide-react";
import Navbar from "../../Components/NavBar";
import Footer from "../../Components/Footer";
import { placeOrder , updateOrderStatusAfterPayment  } from "../../services/customerService";
import {requestPayHereHash} from "../../services/paymentService";

const mapContainerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "0.5rem",
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartGroups, clearCart, getTotal } = useCart();
  const { auth } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const restaurantId = queryParams.get("restaurantId");

  const defaultCoords = auth.user?.location?.coordinates || [80.7718, 7.8731];
  const defaultLatLng = { lat: defaultCoords[1], lng: defaultCoords[0] };

  const [items, setItems] = useState([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [editing, setEditing] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(defaultLatLng);
  const [autocomplete, setAutocomplete] = useState(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState({
    name: auth.user?.name || "",
    phone: auth.user?.phone || "",
    address: "",
    location: {
      type: "Point",
      coordinates: defaultCoords,
    },
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const deliveryFee = 250;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  useEffect(() => {
    if (!auth.user) {
      navigate("/");
    }

    const selectedGroup = cartGroups.find(g => g.restaurantId === restaurantId);
    if (!selectedGroup) {
      toast.error("No cart items found for this restaurant");
      navigate("/");
    } else {
      setItems(selectedGroup.items);
      setRestaurantName(selectedGroup.restaurantName);
    }
  }, [auth, cartGroups, restaurantId]);

  const handlePlaceOrder = async () => {
    if (!customer.location || !customer.location.coordinates) {
      return toast.warning("Please select a delivery location.");
    }
  
    setLoading(true);
  
    const itemsTotal = getTotal({ items });
    const totalWithDelivery = itemsTotal + deliveryFee;
  
    const payload = {
      customerId: auth.user?.id,
      phone: auth.user?.phone,
      restaurantId,
      items: items.map(i => ({
        menuItemId: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      totalAmount: itemsTotal,
      deliveryFee,
      deliveryAddress: customer.address,
      deliveryLocation: customer.location,
      paymentMethod,
    };
  
    // ✅ Log the payload
    console.log("📦 Payload being sent:", payload);
  
    // ✅ COD Flow
    if (paymentMethod === "cod") {
      try {
        await placeOrder(payload);
        toast.success("Order placed successfully! (Pending)");
        clearCart();
        navigate("/");
      } catch (err) {
        console.error("❌ COD Order creation failed:", err.response?.data || err.message);
        toast.error("Failed to place order");
      } finally {
        setLoading(false);
      }
      return;
    }
  
    // ✅ Card Payment Flow
    try {
      const orderResponse = await placeOrder(payload);
      console.log("🧾 orderResponse received:", orderResponse);
      const savedOrderId = orderResponse?.order?._id;
  
      if (!savedOrderId) {
        throw new Error("Order ID not returned");
      }
  
      const { hash } = await requestPayHereHash(savedOrderId, totalWithDelivery);
  
      const payment = {
        sandbox: true,
        merchant_id: "1230207",
        return_url: "http://localhost:5173/payment-success",
        cancel_url: "http://localhost:5173/payment-cancel",
        notify_url: "",
        order_id: savedOrderId,
        items: items.map(i => i.name).join(", "),
        amount: totalWithDelivery.toFixed(2),
        currency: "LKR",
        hash,
        first_name: auth.user?.name || "",
        last_name: "",
        email: auth.user?.email || "test@example.com",
        phone: auth.user?.phone || "",
        address: customer.address || "",
        city: "Colombo",
        country: "Sri Lanka",
      };
  
      payhere.onCompleted = async function (payHereOrderId) {
        try {
          const updatePayload = {
            paymentStatus: "paid",
            orderStatus: "confirmed",
            paymentId: payHereOrderId,
          };
      
          console.log("🔁 Updating order with:", updatePayload, "Order ID:", savedOrderId);
      
          const updateResponse = await updateOrderStatusAfterPayment(savedOrderId, updatePayload);
          console.log("✅ Order update response:", updateResponse);
      
          toast.success(`Payment completed! Order ID: ${payHereOrderId}`);
          clearCart();
          navigate("/");
        } catch (error) {
          console.error("❌ Failed to update order after payment:");
          if (error.response) {
            console.error("📨 Response Data:", JSON.stringify(error.response.data, null, 2));
            console.error("📨 Status:", error.response.status);
            console.error("📨 Headers:", error.response.headers);
          } else if (error.request) {
            console.error("📡 No response received:", error.request);
          } else {
            console.error("⚠️ Error Message:", error.message);
          }
        
          toast.error("Payment succeeded but failed to confirm order.");
        }
        
      };
      
  
      payhere.onDismissed = function () {
        toast.warning("Payment dismissed by user.");
        setLoading(false);
      };
  
      payhere.onError = function (error) {
        toast.error(`Payment error: ${error}`);
        setLoading(false);
      };
  
      payhere.startPayment(payment);
    } catch (err) {
      console.error("❌ Failed to initiate card payment:", err.response?.data || err.message);
      toast.error("Failed to initiate card payment.");
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const fetchAddressFromCoords = async (lng, lat) => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();
        const address = data.results?.[0]?.formatted_address || "Not set";
        setCustomer((prev) => ({ ...prev, address }));
      } catch (err) {
        console.error("Failed to fetch address from coordinates:", err);
      }
    };

    if (customer.location?.coordinates?.length === 2 && !customer.address) {
      const [lng, lat] = customer.location.coordinates;
      fetchAddressFromCoords(lng, lat);
    }
  }, [customer.location]);

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    setCustomer((prev) => ({
      ...prev,
      location: { type: "Point", coordinates: [lng, lat] },
    }));
  };

  const onMarkerDragEnd = (e) => {
    handleMapClick(e);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMarkerPosition({ lat, lng });
      setCustomer((prev) => ({
        ...prev,
        location: { type: "Point", coordinates: [lng, lat] },
        address: place.formatted_address || "",
      }));
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
      }
    }
  };

  const itemsTotal = getTotal({ items });
  const totalWithDelivery = itemsTotal + deliveryFee;

  return (

    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navbar />

      {/* Checkout Hero Section */}
      <section className="relative pt-16 pb-10 bg-red-600 text-white">
        <div className="absolute inset-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-xl">Complete your order from {restaurantName}</p>
          </div>
        </div>
      </section>

      {/* Breadcrumbs */}
      <div className="bg-white py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-red-600 cursor-pointer" onClick={() => navigate("/")}>Home</span>
            <ChevronRight size={16} className="mx-2" />
            <span className="hover:text-red-600 cursor-pointer" onClick={() => navigate("/cart")}>Cart</span>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-red-600 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Customer Info & Delivery */}
          <div className="lg:w-7/12 space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600 font-bold">1</span>
                </div>
                <h2 className="text-2xl font-bold">Customer Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Name</label>
                  <div className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                    {customer.name}
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Phone</label>
                  <div className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                    {customer.phone}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delivery Location Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600 font-bold">2</span>
                </div>
                <h2 className="text-2xl font-bold">Delivery Location</h2>
              </div>
              
              {!editing ? (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="text-red-600 mt-1" size={20} />
                    <div>
                      <h3 className="font-medium">Delivery Address</h3>
                      <p className="text-gray-700">{customer.address || "Not set"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-red-100 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    Change Location
                  </button>
                </>

              ) : (
                <>
                  <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
                    <input
                      type="text"
                      placeholder="Search for your delivery location..."
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg mb-4 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </Autocomplete>

                  <div className="mb-4">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={markerPosition}
                        zoom={15}
                        onClick={handleMapClick}
                        onLoad={(map) => (mapRef.current = map)}
                      >
                        <Marker
                          position={markerPosition}
                          draggable
                          onDragEnd={onMarkerDragEnd}
                        />
                      </GoogleMap>
                    ) : (
                      <div className="bg-gray-100 h-64 flex items-center justify-center rounded-lg">
                        <p>Loading map...</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p>You can drag the marker to pinpoint your exact location</p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                    >
                      Confirm Location
                    </button>
                  </div>
                </>
              )}
            </div>

            
            {/* Payment Method Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-red-600 font-bold">3</span>
                </div>
                <h2 className="text-2xl font-bold">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                <div className={`border-2 rounded-lg p-4 cursor-pointer flex items-center ${paymentMethod === "cod" ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-red-300"}`}
                  onClick={() => setPaymentMethod("cod")}>
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === "cod" ? "border-red-600" : "border-gray-400"}`}>
                    {paymentMethod === "cod" && <div className="w-3 h-3 bg-red-600 rounded-full"></div>}
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={20} className={paymentMethod === "cod" ? "text-red-600" : "text-gray-500"} />
                    <span className="ml-2 font-medium">Cash on Delivery</span>
                  </div>
                </div>
                
                <div className={`border-2 rounded-lg p-4 cursor-pointer flex items-center ${paymentMethod === "card" ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-red-300"}`}
                  onClick={() => setPaymentMethod("card")}>
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${paymentMethod === "card" ? "border-red-600" : "border-gray-400"}`}>
                    {paymentMethod === "card" && <div className="w-3 h-3 bg-red-600 rounded-full"></div>}
                  </div>
                  <div className="flex items-center">
                    <CreditCard size={20} className={paymentMethod === "card" ? "text-red-600" : "text-gray-500"} />
                    <span className="ml-2 font-medium">Credit / Debit Card</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:w-5/12">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 font-bold text-sm">{restaurantName ? restaurantName.charAt(0) : 'R'}</span>
                  </div>
                  <h3 className="font-bold">{restaurantName || 'Restaurant'}</h3>
                </div>
                
                <div className="border-t border-b py-4 space-y-3">
                  {items.map(item => (
                    <div key={item._id} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                          {item.quantity}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Total</span>
                  <span>Rs. {itemsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <Truck size={16} className="mr-1 text-gray-600" />
                    <span className="text-gray-600">Delivery Fee</span>
                  </div>
                  <span>Rs. {deliveryFee}</span>
                </div>
                <div className="border-t pt-3 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-red-600">Rs. {totalWithDelivery}</span>
                </div>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors duration-300 flex items-center justify-center font-medium text-lg"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span>Place Order</span>
                )}
              </button>
              
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Check size={16} className="text-green-600 mr-2" />
                  <span>Your personal data will be used to process your order, as described in our privacy policy.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Checkout;