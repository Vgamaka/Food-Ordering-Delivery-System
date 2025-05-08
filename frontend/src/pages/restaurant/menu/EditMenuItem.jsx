import { useEffect, useState } from "react";
import { fetchSingleMenuItem, editMenuItem } from "../../../services/restaurantService";
import { motion } from "framer-motion";
import { Button, Card } from "flowbite-react";
import { toast } from "react-toastify";

export function EditMenuItem({ itemId, onClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: 0,
    category: "",
    available: true,
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      try {
        const data = await fetchSingleMenuItem(itemId);
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          quantity: data.quantity || 0,
          category: data.category || "",
          available: data.available ?? true,
          image: null,
        });
        if (data.image) {
          // Serve uploads from root uploads folder, not /api/uploads
          const baseUrl = import.meta.env.VITE_RESTAURANT_SERVICE_URL.replace(/\/api\/?$/,'');
          setPreview(`${baseUrl}/uploads/${data.image}`);
        }
      } catch (err) {
        console.error("Error loading menu item:", err);
        toast.error("Failed to load menu item.");
        setError("Unable to load item.");
      } finally {
        setLoading(false);
      }
    };
    if (itemId) loadItem();
  }, [itemId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key !== "image") formData.append(key, val);
    });
    if (form.image) formData.append("image", form.image);

    try {
      await editMenuItem(itemId, formData);
      toast.success("Menu item updated successfully!");
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update menu item.");
      setError("Update failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 text-lg">
        Loading item...
      </div>
    );
  }

  return (
    <motion.div
         className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto p-6 relative max-h-[90vh] overflow-y-auto"
    initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-4">
        <h2 className="text-2xl font-bold text-yellow-600 text-center mb-4">
          Edit Menu Item
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-700">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-700">Price (Rs.)</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm text-gray-700">Quantity</label>
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={handleChange}
              className="w-5 h-5"
            />
            <label className="text-sm font-medium text-gray-700">Available</label>
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Change Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-48 object-contain rounded mt-4"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              color="gray"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black rounded-xl font-semibold"
            >
              Update Item
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
