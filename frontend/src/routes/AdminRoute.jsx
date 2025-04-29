import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { auth } = useAuth();

  if (!auth.token || auth.user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
}
