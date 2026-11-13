import { useState, useEffect } from "react";
import axiosClient from "../services/api";
import { AuthContext } from "./auth";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    localStorage.getItem("access") || localStorage.getItem("refresh")
      ? null
      : false,
  );
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  const login = async (credentials) => {
    const response = await axiosClient.post("/api/login/", credentials);
    const userRole = response.data.user.role;

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    localStorage.setItem("role", userRole);
    setRole(userRole);
    setIsAuthenticated(true);
    return userRole;
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    setRole(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {

    const verifyToken = async () => {
      const accessToken = localStorage.getItem("access");
      const refreshToken = localStorage.getItem("refresh");

      if (!accessToken && !refreshToken) return;

      if (accessToken) {
        try {
          await axiosClient.post("/api/token/verify/", {
            token: accessToken,
          });
          setIsAuthenticated(true);
          return;
        } catch {
          // A refresh token may still be valid.
        }
      }

      if (refreshToken) {
        try {
          const response = await axiosClient.post("/api/token/refresh/", {
            refresh: refreshToken,
          });
          localStorage.setItem("access", response.data.access);
          if (response.data.refresh) {
            localStorage.setItem("refresh", response.data.refresh);
          }
          setIsAuthenticated(true);
          return;
        } catch {
          // Invalid or expired refresh tokens require a fresh login.
        }
      }

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setIsAuthenticated(false);
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}