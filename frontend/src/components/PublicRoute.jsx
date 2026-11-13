import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/auth";
import { getRoleLandingPath } from "../utils/routes";

const PublicRoute = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated === null) {
    return <p>Checking authentication...</p>;
  }

  return isAuthenticated
    ? <Navigate to={getRoleLandingPath(role)} replace />
    : <Outlet />;
};

export default PublicRoute;
