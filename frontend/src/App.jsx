
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useAuth } from "./context/auth";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import AddEmployee from "./pages/AddEmployee";
import EmployeeDetail from "./pages/EmployeeDetail";
import EditEmployee from "./pages/EditEmployee";
import Layout from "./layouts/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import MyProfile from "./pages/employee/MyProfile";
import { getRoleLandingPath } from "./utils/routes";

const RoleRedirect = () => {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated === null) {
    return <p>Checking authentication...</p>;
  }

  return (
    <Navigate
      to={isAuthenticated ? getRoleLandingPath(role) : "/login"}
      replace
    />
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />

          {/* Employees */}
          <Route
            path="/employees"
            element={
              <Layout>
                <EmployeeList />
              </Layout>
            }
          />

          <Route
            path="/employees/add"
            element={
              <Layout>
                <AddEmployee />
              </Layout>
            }
          />

          <Route
            path="/employees/:id"
            element={
              <Layout>
                <EmployeeDetail />
              </Layout>
            }
          />

          <Route
            path="/employees/edit/:id"
            element={
              <Layout>
                <EditEmployee />
              </Layout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
          <Route
            path="/my-profile"
            element={
              <Layout>
                <MyProfile />
              </Layout>
            }
          />
        </Route>

        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

