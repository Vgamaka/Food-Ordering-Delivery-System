import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/NavBar";
import Footer from "../../Components/Footer";
import food from "../../public/images/food.jpg";
import food1 from "../../public/images/food1.jpg";
import food2 from "../../public/images/food3.jpg";
import restaurant from "../../public/images/restaurant.jpg";
import sarah from "../../public/images/sarah.jpg";
import michael from "../../public/images/michael.jpg";
import emily from "../../public/images/emily.jpg";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import { fetchAllMenuItems  , fetchAllRestaurants  } from "../../services/customerService";

const AllItems = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();
  const { addToCart, restaurantId, clearCart } = useCart();
  // Pagination for Menu Items
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Pagination for Restaurants
  const [restaurantPage, setRestaurantPage] = useState(1);
  const restaurantsPerPage = 3;

  // Fetch menu items from API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await fetchAllMenuItems();
        setItems(data);
      } catch (error) {
        console.error("Error fetching menu items:", error.message);
      }
    };

    fetchItems();
  }, []);


  // Fetch restaurants from API - Updated with AllRestaurants logic
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await fetchAllRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to load restaurants", error.message);
        setRestaurants(getFallbackRestaurants());
      }
    };

    fetchRestaurants();
  }, []);


  // Fallback restaurant data in case API fails
  const getFallbackRestaurants = () => {
    return [
      {
        _id: "1",
        restaurantDetails: {
          name: "Italiano Delight",
          description: "Authentic Italian cuisine",
          proofImage: "default.jpg",
        },
      },
      {
        _id: "2",
        restaurantDetails: {
          name: "Spice Paradise",
          description: "Finest Indian flavors",
          proofImage: "default.jpg",
        },
      },
      {
        _id: "3",
        restaurantDetails: {
          name: "Sushi Master",
          description: "Premium Japanese dishes",
          proofImage: "default.jpg",
        },
      },
    ];
  };

  const heroSlides = [
    {
      image: food,
      title: "Enjoy Delicious Food",
      subtitle: "Order your favorite meals online",
    },
    {
      image: food1,
      title: "Quick Delivery",
      subtitle: "Fresh food delivered to your doorstep",
    },
    {
      image: food2,
      title: "Special Offers",
      subtitle: "Discover our weekly promotions",
    },
  ];

  // Fallback menu items in case API fails
  const fallbackMenuItems = [
    {
      category: "Breakfast",
      image: "/api/placeholder/600/400",
      price: "$8.99",
      title: "Classic Breakfast",
      description: "Eggs, bacon, toast and hash browns",
    },
    {
      category: "Lunch",
      image: "/api/placeholder/600/400",
      price: "$12.99",
      title: "Grilled Chicken Salad",
      description: "Fresh greens with grilled chicken breast",
    },
    {
      category: "Dinner",
      image: "/api/placeholder/600/400",
      price: "$18.99",
      title: "Steak with Vegetables",
      description: "Prime cut steak with seasonal vegetables",
    },
    {
      category: "Dessert",
      image: "/api/placeholder/600/400",
      price: "$6.99",
      title: "Chocolate Cake",
      description: "Rich chocolate cake with vanilla ice cream",
    },
    {
      category: "Beverages",
      image: "/api/placeholder/600/400",
      price: "$4.99",
      title: "Fresh Fruit Smoothie",
      description: "Blend of seasonal fruits",
    },
    {
      category: "Snacks",
      image: "/api/placeholder/600/400",
      price: "$7.99",
      title: "Loaded Nachos",
      description: "Tortilla chips with cheese, jalapeños and salsa",
    },
  ];

  // Get unique categories from API items or fallback items
  const getCategories = () => {
    // If we have items from the API, extract unique categories
    if (items && items.length > 0) {
      const categories = [...new Set(items.map((item) => item.category))];
      return ["All", ...categories];
    }

    // Fallback categories that match your backend structure
    return [
      "All",
      "Appetizers",
      "Main Course",
      "Side Dishes",
      "Desserts",
      "Beverages",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Vegan",
      "Gluten-Free",
      "Kids Menu",
      "Specials"
    ];
  };
  // Filter items based on selected category
  const getFilteredItems = () => {
    if (!items || items.length === 0) {
      return fallbackMenuItems;
    }

    if (activeCategory === "All") {
      return items;
    }

    return items.filter((item) => item.category === activeCategory);
  };
  const handleAddToCart = (item) => {
    const quantity = 1; // Default quantity in AllItems
    const id = item.restaurantId || item.restaurant?._id; // Try both ways

    if (!id) {
      toast.error("Restaurant ID missing for this item.");
      return;
    }

    if (restaurantId && restaurantId !== id) {
      if (window.confirm("You already have items from another restaurant. Clear the cart to continue?")) {
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
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Food Blogger",
      image: sarah,
      text: "The food quality and delivery speed are exceptional. My go-to app for ordering food!",
    },
    {
      name: "Michael Brown",
      role: "Regular Customer",
      image: michael,
      text: "I've tried many food delivery services, but this one stands out with its variety and taste.",
    },
    {
      name: "Emily Wilson",
      role: "Food Critic",
      image: emily,
      text: "The menu options are excellent and the food arrives hot and fresh every time.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation - Now using the Navbar component */}
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative h-screen pt-16">
        <div className="absolute inset-0 overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="absolute inset-0 bg-black opacity-60"></div>
              <img
                src={slide.image}
                alt={slide.title}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>

        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              {heroSlides[currentSlide].subtitle}
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg transition-colors duration-300">
              Order Now
            </button>
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-colors duration-300"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-colors duration-300"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${index === currentSlide ? "bg-red-600" : "bg-white/50"
                }`}
            ></button>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-600 text-lg font-medium" style={{ fontFamily: "'Amatic SC', cursive" }}>About Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Learn More About DeliciousEats
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img
                src={restaurant}
                alt="About Us"
                className="rounded-lg shadow-lg w-full"
              />
            </div>

            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold mb-4">
                We Deliver The Best Food Experiences
              </h3>
              <p className="text-gray-700 mb-4">
                Welcome to DeliciousEats, where culinary excellence meets
                convenience. Our mission is to deliver exceptional food
                experiences right to your doorstep, without compromising on
                quality or taste.
              </p>
              <p className="text-gray-700 mb-6">
                Our team of skilled chefs prepare each meal with the freshest
                ingredients, ensuring that every bite is a delight. With a
                diverse menu catering to all tastes and dietary preferences,
                we've got something for everyone.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl font-bold">01</span>
                  </div>
                  <span className="font-medium">Quality Food</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl font-bold">02</span>
                  </div>
                  <span className="font-medium">Fast Delivery</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl font-bold">03</span>
                  </div>
                  <span className="font-medium">Easy Ordering</span>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl font-bold">04</span>
                  </div>
                  <span className="font-medium">24/7 Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-600 text-lg font-medium" style={{ fontFamily: "'Amatic SC', cursive" }}>
              Our Menu
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Check Our Delicious Menu
            </h2>
          </div>

          {/* Category Filters */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {getCategories().map((category, index) => (
                <button
                  key={index}
                  className={`${activeCategory === category
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-700 hover:bg-red-600 hover:text-white"
                    } px-4 py-2 rounded-full transition-colors duration-300`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredItems()
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((item, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">

                  <div className="p-5">
                    <div className="relative h-48 overflow-hidden rounded-lg mb-4 group">
                    <img
                      src={`http://localhost:3002/uploads/${item.image}`}
                      alt={item.name}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Black gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      {/* Red category badge - move after gradient */}
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 rounded z-10">
                        {item.category}
                      </div>

                      {/* Price and name */}
                      <div className="absolute top-3 right-3 bg-white shadow-md text-red-600 font-bold px-3 py-1 rounded-full text-sm z-10">
                        Rs. {item.price}
                      </div>
                      <h3 className="absolute bottom-3 left-3 text-white font-bold text-lg z-10">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center space-x-2 shadow-sm"
                      >
                        <span>Add to Cart</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {/* Beautiful Pagination Controls for Menu Items */}
          <div className="flex justify-center mt-8 space-x-2 items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-full bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>

            {Array.from({ length: Math.ceil(getFilteredItems().length / itemsPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-full transition ${currentPage === index + 1
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white"
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(getFilteredItems().length / itemsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(getFilteredItems().length / itemsPerPage)}
              className="px-3 py-2 rounded-full bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
          {/* Loading state or error message */}
          {items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading menu items...</p>
            </div>
          )}
        </div>
      </section>


      {/* Restaurants Section - UPDATED WITH NEW FETCHING LOGIC */}
      <section id="restaurants" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-600 text-lg font-medium" style={{ fontFamily: "'Amatic SC', cursive" }}>
              Our Restaurants
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Check Out Our Restaurants
            </h2>
            <button
              onClick={() => navigate("/restaurants")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full text-base transition-colors duration-300 mt-4"
            >
              View All Restaurants
            </button>
          </div>

          {/* Restaurants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants
              .slice((restaurantPage - 1) * restaurantsPerPage, restaurantPage * restaurantsPerPage)
              .map((restaurant) => (
                <div key={restaurant._id} className="bg-white border rounded-xl shadow p-4 hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={`${import.meta.env.VITE_AUTH_SERVICE_URL.replace("/api/auth", "")}/uploads/${restaurant.restaurantDetails?.proofImage || "default.jpg"}`}

                    alt={restaurant.restaurantDetails?.name || "Restaurant"}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold">
                    {restaurant.restaurantDetails?.name || "Restaurant Name"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {restaurant.restaurantDetails?.description ||
                      "No description available."}
                  </p>
                  <button
                    onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                    className="w-full bg-red-100 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2 rounded transition-colors duration-300"
                  >
                    View Menu
                  </button>
                </div>
              ))}
          </div>
          {/* Beautiful Pagination Controls for Restaurants */}
          <div className="flex justify-center mt-8 space-x-2 items-center">
            <button
              onClick={() => setRestaurantPage((prev) => Math.max(prev - 1, 1))}
              disabled={restaurantPage === 1}
              className="px-3 py-2 rounded-full bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>

            {Array.from({ length: Math.ceil(restaurants.length / restaurantsPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => setRestaurantPage(index + 1)}
                className={`px-4 py-2 rounded-full transition ${restaurantPage === index + 1
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white"
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setRestaurantPage((prev) =>
                  Math.min(prev + 1, Math.ceil(restaurants.length / restaurantsPerPage))
                )
              }
              disabled={restaurantPage === Math.ceil(restaurants.length / restaurantsPerPage)}
              className="px-3 py-2 rounded-full bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>

          {/* Loading state */}
          {restaurants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading restaurants...</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-600 text-lg font-medium" style={{ fontFamily: "'Amatic SC', cursive" }}>
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 object-cover rounded-full mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                <div className="flex text-yellow-400 mt-4">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Order Delicious Food?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the best food delivery service with a wide variety of
            cuisines prepared by our expert chefs.
          </p>
          <button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-medium transition-colors duration-300">
            Order Now
          </button>
        </div>
      </section>

      {/* Footer - Now using the Footer component */}
      <Footer />
    </div>
  );
};

export default AllItems;
