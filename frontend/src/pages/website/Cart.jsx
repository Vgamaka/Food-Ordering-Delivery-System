import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

// Newly imported
import Navbar from "../../Components/NavBar";
import Footer from "../../Components/Footer";

const Cart = () => {
  const {
    cartGroups,
    incrementItem,
    decrementItem,
    removeFromCart,
    clearCart,
    getTotal,
  } = useCart();

  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = (restaurantId) => {
    if (!auth?.user) {
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    navigate(`/checkout?restaurantId=${restaurantId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Cart Content */}
      <main className="flex-1 p-6  pt-20 pb-10">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Your Cart
        </h1>

        {cartGroups.length === 0 ? (
          <p className="text-center text-gray-500 mt-8 text-lg">
            Your cart is empty.
          </p>
        ) : (
          <>
            {cartGroups.map((group) => (
              <div key={group.restaurantId} className="mb-10 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
                <h2 className="text-2xl font-semibold text-red-600 mb-6">
                  {group.restaurantName}
                </h2>

                {group.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-6 border-b pb-6 mb-6"
                  >
                    <img
                      src={`${import.meta.env.VITE_RESTAURANT_SERVICE_URL.replace("/api/restaurant", "")}/uploads/${item.image}`}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <p className="text-gray-600">Rs. {item.price}</p>
                      <div className="flex items-center mt-3 gap-3">
                        <button
                          onClick={() => decrementItem(group.restaurantId, item._id)}
                          className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-full text-lg font-bold transition"
                        >
                          -
                        </button>
                        <span className="min-w-[2rem] text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => incrementItem(group.restaurantId, item._id)}
                          className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-full text-lg font-bold transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        Rs. {item.price * item.quantity}
                      </p>
                      <button
                        onClick={() => removeFromCart(group.restaurantId, item._id)}
                        className="text-sm text-red-500 hover:underline mt-2 block"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="text-right mt-6">
                  <p className="text-2xl font-bold mb-4 text-gray-800">
                    Total: Rs. {getTotal(group)}
                  </p>
                  <button
                    onClick={() => handleCheckout(group.restaurantId)}
                    className="bg-red-600 hover:bg-red-700 text-white text-lg px-6 py-3 rounded-full font-semibold transition duration-300"
                  >
                    Purchase {group.restaurantName}
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Entire Cart */}
            <div className="text-right">
              <button
                onClick={clearCart}
                className="text-sm text-red-600 hover:underline font-semibold"
              >
                Clear Entire Cart
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Cart;
