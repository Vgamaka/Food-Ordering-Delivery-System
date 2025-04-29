import { useEffect, useState } from "react";
import { fetchMenuItems, deleteMenuItem } from "../../../services/restaurantService";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Card } from "flowbite-react";

export default function MenuList() {
  const [items, setItems] = useState([]);
  const restaurantId = JSON.parse(localStorage.getItem("user"))?.id;

  const fetchItems = async () => {
    try {
      const res = await fetchMenuItems(restaurantId);
      setItems(res);
    } catch (err) {
      console.error("Failed to load menu items:", err);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteMenuItem(id);
      fetchItems();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 md:px-8 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title and Add Button */}
      <div className="flex flex-wrap justify-between items-center mb-8">
  <h2 className="text-3xl font-bold text-yellow-600">My Menu</h2>
  <Link to="/restaurant/menu/add">
  <Button
    size="xl"
    className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold"
  >
    + Add New Item
  </Button>
</Link>



</div>


      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-lg">
          No menu items found.
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <motion.div
              key={item._id}
              className="rounded-xl shadow bg-white overflow-hidden hover:shadow-lg transition"
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={`http://localhost:3002/uploads/${item.image}`}
                alt={item.name}
                className="w-full h-48 object-cover"
              />

              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <p className="text-green-600 font-medium">Rs. {item.price}</p>
                <p className="text-xs text-gray-400">
                  Category: {item.category || "N/A"}
                </p>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Link
                    to={`/restaurant/menu/edit/${item._id}`}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-lg text-sm font-semibold shadow hover:shadow-md transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="px-3 py-1 bg-gradient-to-r from-red-400 to-red-600 text-black rounded-lg text-sm font-semibold shadow hover:shadow-md transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
