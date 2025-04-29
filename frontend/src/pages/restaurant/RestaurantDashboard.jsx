import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import PageContainer from "./components/PageContainer";
import Profile from "./Profile";
import Dashboard from "./Dashboard";
import OrderList from "./orders/OrderList";
import MenuList from "./menu/MenuList";

export default function RestaurantDashboard() {
  const [activePage, setActivePage] = useState("profile");

  const renderPage = () => {
    switch (activePage) {
      case "profile":
        return <Profile />;
      case "orders":
        return (
          <div className="space-y-8">
            <Dashboard />
            <OrderList />
          </div>
        );
      case "menu":
        return <MenuList />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white to-yellow-50">
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content */}
      <PageContainer>
        <motion.div
          className="py-8 px-4 md:px-8 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {renderPage()}
        </motion.div>
      </PageContainer>
    </div>
  );
}
