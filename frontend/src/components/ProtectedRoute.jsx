import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/auth";
import { getRoleLandingPath } from "../utils/routes";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated === null) {
    return <p>Checking authentication...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(role?.toLowerCase())
  ) {
    return <Navigate to={role ? getRoleLandingPath(role) : "/login"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;