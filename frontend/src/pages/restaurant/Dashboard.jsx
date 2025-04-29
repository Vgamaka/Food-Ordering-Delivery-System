import { useEffect, useState } from "react";
import { fetchDashboardStats, fetchChartData  } from '../../services/restaurantService';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("monthly");
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetchDashboardStats(user.id);
        setStats(res);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    const fetchChart = async () => {
      try {
        const res = await fetchChartData(user.id, filter);
        setChartData(res);
      } catch (err) {
        console.error("Failed to load chart data", err);
      }
    };

    fetchStats();
    fetchChart();
  }, [user.id, filter]);

  const handleFilterChange = (e) => setFilter(e.target.value);

  if (!stats) {
    return (
      <div className="text-center py-20 text-lg font-medium text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 md:px-8 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Title + Filter */}
      <div className="flex flex-wrap justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-yellow-600">Restaurant Analytics</h2>

        <select
          value={filter}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} />
        <StatCard title="Completed Orders" value={stats.completedOrders} />
        <StatCard title="Total Revenue (Rs.)" value={stats.totalRevenue} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h3 className="text-xl font-semibold text-gray-700 mb-6">
          Revenue Trends
        </h3>
        {chartData ? (
          <Line
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: "Revenue (Rs.)",
                  data: chartData.values,
                  borderColor: "#3b82f6",
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  tension: 0.4,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        ) : (
          <p className="text-center text-gray-500">No chart data available.</p>
        )}
      </div>

      {/* Top Dishes */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Top Dishes</h3>
        {stats.popularItems.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            {stats.popularItems.map((item, idx) => (
              <li key={idx}>
                {item.name} – {item.count} orders
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No popular items yet.</p>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ title, value }) {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 text-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <h4 className="text-2xl font-bold text-blue-600">{value}</h4>
    </motion.div>
  );
}
