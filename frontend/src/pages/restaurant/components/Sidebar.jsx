import { motion } from "framer-motion";
import { HiUserCircle, HiClipboardList, HiOutlineViewList } from "react-icons/hi";

export default function Sidebar({ activePage, setActivePage }) {
  const sidebarItems = [
    { key: "profile", label: "Profile", icon: <HiUserCircle className="h-6 w-6" /> },
    { key: "orders", label: "Orders", icon: <HiClipboardList className="h-6 w-6" /> },
    { key: "menu", label: "Menu & Food", icon: <HiOutlineViewList className="h-6 w-6" /> },
  ];

  return (
    <motion.aside
      className="w-64 bg-white shadow-lg border-r border-gray-200 hidden md:flex flex-col py-8 px-4"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-center mb-10 text-yellow-600">
         Restaurant
      </h2>

      <nav className="flex flex-col space-y-4">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActivePage(item.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition ${
              activePage === item.key
                ? "bg-yellow-100 text-yellow-700"
                : "hover:bg-yellow-50 text-gray-700"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </motion.aside>
  );
}
