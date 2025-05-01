
const orderService = require("../services/orderService");

exports.getDashboardStats = async (req, res) => {
  const { restaurantId } = req.params;

  try {
    if (!restaurantId) {
      return res.status(400).json({ message: "Missing restaurantId" });
    }

    const orders = await orderService.getOrdersByRestaurant(restaurantId);

    // Business Logic
    const validOrders = orders.filter(o => o.orderStatus !== "cancelled" && o.orderStatus !== "rejected");
    const totalOrders = validOrders.length;

    const pendingOrders = validOrders.filter(o => o.orderStatus !== "delivered").length;
    const completedOrders = orders.filter(o => o.orderStatus === "delivered").length;

    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    //  Popular Dishes
    const dishCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      popularItems,
    });

  } catch (err) {
    console.error("Dashboard aggregation failed:", err.message);
    res.status(500).json({ message: "Failed to load dashboard", error: err.message });
  }
};

exports.getChartData = async (req, res) => {
  const { restaurantId } = req.params;
  const { filter } = req.query;

  try {
    if (!restaurantId) {
      return res.status(400).json({ message: "Missing restaurantId" });
    }

    //  Fetch orders via service
    const orders = await orderService.getOrdersByRestaurant(restaurantId);

    const now = new Date();
    const labels = filter === "weekly"
      ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const values = Array(labels.length).fill(0);

    orders.forEach(order => {
      const createdAt = new Date(order.createdAt);
      if (filter === "weekly") {
        const day = createdAt.getDay();
        values[day] += order.totalAmount || 0;
      } else {
        const month = createdAt.getMonth();
        values[month] += order.totalAmount || 0;
      }
    });

    res.status(200).json({ labels, values });

  } catch (err) {
    console.error("Chart aggregation failed:", err.message);
    res.status(500).json({ message: "Failed to load chart data", error: err.message });
  }
};
