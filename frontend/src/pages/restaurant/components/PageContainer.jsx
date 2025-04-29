import { motion } from "framer-motion";

export default function PageContainer({ children }) {
  return (
    <motion.main
      className="flex-1 bg-gradient-to-b from-white to-yellow-50 p-6 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.main>
  );
}
