import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/NavBar";
import Footer from "../../Components/Footer";
import { fetchAllRestaurants } from "../../services/customerService";

const AllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await fetchAllRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to load restaurants", error.message);
      }
    };

    fetchRestaurants();
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Hero Banner */}
      <section className="relative py-20 bg-red-600">
        <div className="absolute inset-0"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <span className="text-lg font-medium">Discover</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-2 mb-4">
            Our Partner Restaurants
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Explore our curated selection of top-rated restaurants offering a
            wide variety of cuisines
          </p>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-red-600 text-lg font-medium">
              Restaurants
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Find Your Favorite Restaurant
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={`${import.meta.env.VITE_AUTH_SERVICE_URL.replace("/api/auth", "")}/uploads/${restaurant.restaurantDetails?.proofImage || "default.jpg"}`}

                    alt={restaurant.restaurantDetails?.name || "Restaurant"}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white text-xl font-bold">
                      {restaurant.restaurantDetails?.name || "Restaurant Name"}
                    </h3>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-600 mb-4">
                    {restaurant.restaurantDetails?.description ||
                      "No description available."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-gray-700">4.8</span>
                    </div>
                    <button
                      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
                      className="bg-red-100 hover:bg-red-600 hover:text-white text-red-600 px-4 py-2 rounded transition-colors duration-300"
                    >
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading state */}
          {restaurants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading restaurants...</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Can't Decide What to Order?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our full menu with a variety of cuisines from our partner
            restaurants.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-medium transition-colors duration-300"
          >
            Explore Menu
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AllRestaurants;
