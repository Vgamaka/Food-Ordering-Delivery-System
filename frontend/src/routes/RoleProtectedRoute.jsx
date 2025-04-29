import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ use useAuth not AuthContext

export default function RoleProtectedRoute({ allowedRoles, children }) {
  const { auth } = useAuth(); // ✅ get auth from useAuth()

  if (!auth.user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(auth.user.role)) {
    // Logged in but wrong role
    return <Navigate to="/unauthorized" replace />;
  }

  // Correct role
  return children;
}
