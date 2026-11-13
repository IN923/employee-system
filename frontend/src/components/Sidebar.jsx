
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  UserRound,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/auth";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, role } = useAuth();

  // Admin navigation
  const adminMenuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: Users,
    },
  ];

  // Employee navigation
  const employeeMenuItems = [
    {
      name: "My Profile",
      path: "/my-profile",
      icon: UserRound,
    },
  ];

  const menuItems =
    role?.toLowerCase() === "admin"
      ? adminMenuItems
      : employeeMenuItems;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5
        bg-white border border-gray-200 rounded-lg shadow-sm
        text-gray-700 hover:bg-gray-50"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          h-screen w-64 shrink-0
          bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300
          lg:sticky lg:top-0 lg:z-30 lg:translate-x-0
          ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                EmployeeHub
              </h2>
              <p className="text-xs text-gray-500">
                Management System
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-900"
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-4">
            {role === "admin" ? "Admin Menu" : "Employee Menu"}
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl
                    text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <div className="px-3 mb-3">
            <p className="text-xs text-gray-400">
              Signed in as
            </p>
            <p className="text-sm font-semibold text-gray-800 capitalize mt-1">
              {role || "User"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3
            rounded-xl text-sm font-medium text-red-600
            hover:bg-red-50 transition-colors"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
