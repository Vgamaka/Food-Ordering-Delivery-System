// frontend/src/pages/restaurant/menu/MenuList.jsx

import React, { useEffect, useState } from "react";
import { fetchMenuItems, deleteMenuItem } from "../../../services/restaurantService";
import { motion } from "framer-motion";
import { AddMenuItem } from "./AddMenuItem";      // ← named import
import { EditMenuItem } from "./EditMenuItem";    // ← named import

export default function MenuList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const restaurantId = JSON.parse(localStorage.getItem("user"))?.id;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetchMenuItems(restaurantId);
      setItems(res);
    } catch (err) {
      console.error("Failed to load menu items:", err);
    } finally {
      setLoading(false);
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
    <>
      <motion.div
        className="max-w-7xl mx-auto px-4 md:px-8 py-6 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Title and Add Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-yellow-600">My Menu</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold px-6 py-2"
          >
            + Add New Item
          </button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-600 text-lg">
            Loading menu items...
          </div>
        ) : items.length === 0 ? (
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
                  src={`${import.meta.env.VITE_RESTAURANT_SERVICE_URL.replace(/\/api\/?$/, '')}/uploads/${item.image}`}
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
                    <button
                      onClick={() => {
                        setSelectedItemId(item._id);
                        setShowEdit(true);
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-lg text-sm font-semibold shadow hover:shadow-md transition"
                    >
                      Edit
                    </button>
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

      {/* Background Overlay */}
      {(showEdit || showAdd) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setShowEdit(false);
            setShowAdd(false);
          }}
        />
      )}

      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <AddMenuItem
            onClose={() => {
              setShowAdd(false);
              fetchItems();
            }}
          />
        </div>
      )}

      {/* Edit Item Modal */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <EditMenuItem
            itemId={selectedItemId}
            onClose={() => {
              setShowEdit(false);
              fetchItems();
            }}
          />
        </div>
      )}
    </>
  );
}
