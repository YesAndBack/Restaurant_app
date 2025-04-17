
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token = localStorage.getItem("booking_access_token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin-dashboard" replace />; // Admins go to admin dashboard instead
  }

  return <Outlet />;
};

export default ProtectedRoute;
