
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function CustomerProtectedRoute({ children }) {
  const { auth } = useAuth();

  if (!auth?.user || auth.user.role !== "customer") {
    return <Navigate to="/register/customer" replace />;
  }

  return children;
}
