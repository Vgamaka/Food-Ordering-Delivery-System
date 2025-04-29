import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
import Navbar from "../../Components/NavBar";
import Footer from "../../Components/Footer";
import { fetchRestaurantById , fetchMenuItemsByRestaurant   } from "../../services/customerService";

const RestaurantMenu = () => {
  const { id } = useParams(); // restaurantId from route
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [restaurant, setRestaurant] = useState(null);
  const { cartItems, addToCart, clearCart, restaurantId } = useCart();

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await fetchRestaurantById(id);
        setRestaurant(data);
      } catch (err) {
        console.error("Failed to fetch restaurant details", err);
        toast.error("Failed to fetch restaurant details");
      }
    };
    fetchRestaurant();
  }, [id]);
  

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const items = await fetchMenuItemsByRestaurant(id);
        setMenuItems(items);
        const initialQuantities = {};
        items.forEach((item) => {
          initialQuantities[item._id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (err) {
        console.error("Failed to fetch menu items", err);
        toast.error("Failed to fetch menu items");
      }
    };
    fetchMenuItems();
  }, [id]);  

  const updateQuantity = (itemId, type) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 1;
      const newQty = type === "inc" ? current + 1 : Math.max(current - 1, 1);
      return { ...prev, [itemId]: newQty };
    });
  };

  const handleAddToCart = (item) => {
    const quantity = quantities[item._id] || 1;

    if (restaurantId && restaurantId !== id) {
      if (
        window.confirm(
          "You already have items from another restaurant. Clear the cart to continue?"
        )
      ) {
        clearCart();
        addToCart({ ...item, quantity, restaurantId: id });
        toast.success("Cart cleared and item added.");
      } else {
        toast.info("Item not added.");
      }
      return;
    }

    addToCart({ ...item, quantity, restaurantId: id });
    toast.success("Item added to cart!");
  };

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Restaurant Info Banner */}
      <section className="relative py-20 bg-red-600">
        <div className="absolute inset-0"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {restaurant?.restaurantDetails?.name || "Restaurant Menu"}
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            {restaurant?.restaurantDetails?.description ||
              "Explore our delicious offerings and place your order"}
          </p>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-600 text-lg font-medium">Our Menu</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Delicious Options for Every Taste
            </h2>
          </div>

          {Object.keys(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-12">
                <h3 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-red-200">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-48">
                        <img
                          src={`http://localhost:3002/uploads/${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded">
                          Rs. {item.price}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm h-12 overflow-hidden">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 border rounded-full overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item._id, "dec")}
                              className="px-3 py-1 bg-gray-100 text-red-600 hover:bg-gray-200 transition-colors"
                            >
                              -
                            </button>
                            <span className="min-w-[2rem] text-center font-semibold">
                              {quantities[item._id] || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, "inc")}
                              className="px-3 py-1 bg-gray-100 text-red-600 hover:bg-gray-200 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-red-100 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2 rounded transition-colors duration-300"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600 text-lg">
                No menu items available for this restaurant.
              </p>
              <p className="text-gray-500 mt-2">
                Please check back later or try another restaurant.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Order?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Add your favorite items to the cart and enjoy a delicious meal
            delivered to your doorstep.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-medium transition-colors duration-300"
          >
            Back to Top
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RestaurantMenu;
