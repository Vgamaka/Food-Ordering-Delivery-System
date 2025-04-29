import { useEffect, useState } from "react";
import { fetchSingleMenuItem, editMenuItem } from "../../../services/restaurantService";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Card } from "flowbite-react";
import { toast } from "react-toastify";

export default function EditMenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurantId = JSON.parse(localStorage.getItem("user"))?.id;
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: 0,
    category: "",
    available: true,
    image: null,      // Will hold new File if picked
    imageUrl: "",     // Existing image from DB
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const data = await fetchSingleMenuItem(id);

        setForm(prev => ({
          ...prev,
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          quantity: data.quantity || "",
          category: data.category || "",
          available: data.available ?? true,
          imageUrl: data.imageUrl || "",
          image: null, // Keep null initially
        }));

        if (data.imageUrl) {
          setPreview(data.imageUrl); // Show existing image
        }
      } catch (err) {
        console.error("Error loading item:", err);
        toast.error("Failed to load menu item");
        setError("Failed to load menu item. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("quantity", form.quantity);
    formData.append("category", form.category);
    formData.append("available", form.available);

    if (form.image instanceof File) {
      formData.append("image", form.image); // Only attach if new image picked
    }

    try {
      await editMenuItem(id, formData);
      toast.success("Menu item updated successfully!");
      navigate("/restaurant/menu");
    } catch (err) {
      console.error("Update failed:", err);
      setError("Update failed. Please try again.");
      toast.error("Failed to update menu item.");
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 md:px-8 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-8">
        <h2 className="text-3xl font-bold text-yellow-600 text-center mb-6">
          Edit Menu Item
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm text-gray-700">Name</label>
            <input
              name="name"
              placeholder="Name"
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
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm text-gray-700">Price (Rs.)</label>
              <input
                name="price"
                type="number"
                placeholder="Price"
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
                placeholder="Quantity"
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
              placeholder="Category"
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div className="flex items-center gap-3">
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
            <label className="block mb-1 text-sm text-gray-700">Upload Image</label>
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
                className="w-full max-h-60 object-contain border rounded mt-4"
              />
            )}
          </div>
          <div className="flex justify-center">
            <Button
              type="submit"
              size="xl"
              className="w-full md:w-auto rounded-xl shadow-lg hover:shadow-2xl bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold transition-all duration-300"
            >
              Update Item
            </Button>
          </div>

        </form>
      </Card>
    </motion.div>
  );
}
