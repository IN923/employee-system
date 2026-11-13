
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Users,
  Building2,
  UserPlus,
  ArrowUpRight,
  MoreHorizontal,
  LoaderCircle,
} from "lucide-react";

import axiosClient from "../services/api";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    total_employees: 0,
    total_departments: 0,
    recent_employees: [],
    department_statistics: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get("/api/dashboard/");

        const data = response.data?.dashboard_data;

        if (!data) {
          throw new Error("Invalid dashboard response.");
        }

        setDashboardData({
          total_employees: data.total_employees ?? 0,
          total_departments: data.total_departments ?? 0,
          recent_employees: Array.isArray(data.recent_employees)
            ? data.recent_employees
            : [],
          department_statistics: Array.isArray(data.department_statistics)
            ? data.department_statistics
            : [],
        });

      } catch (err) {
        console.error("Dashboard API Error:", err);

        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const {
    total_employees,
    total_departments,
    recent_employees,
    department_statistics,
  } = dashboardData;

  // Summary Cards
  const stats = [
    {
      title: "Total Employees",
      value: total_employees,
      icon: Users,
      color: "blue",
      description: "Registered employees",
    },
    {
      title: "Total Departments",
      value: total_departments,
      icon: Building2,
      color: "purple",
      description: "Organization departments",
    },
    {
      title: "Recently Added",
      value: recent_employees.length,
      icon: UserPlus,
      color: "green",
      description: "Latest 5 employees",
    },
  ];

  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  const maxEmployees = Math.max(
    ...department_statistics.map(
      (department) => Number(department.employee_count) || 0
    ),
    1
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
        <LoaderCircle
          size={32}
          className="animate-spin text-blue-600"
        />
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600">
        <p className="font-medium">Unable to load dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm font-semibold underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">

      {/* Page Heading */}
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Welcome to Employee Management System
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="min-w-0 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">
                  <p className="text-sm text-slate-500">
                    {item.title}
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
                    {item.value}
                  </h2>
                </div>

                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center ${colors[item.color]}`}
                >
                  <Icon size={22} />
                </div>

              </div>

              <div className="flex items-center gap-2 mt-4">
                <ArrowUpRight
                  size={15}
                  className="text-green-600 shrink-0"
                />

                <span className="text-xs text-slate-500">
                  {item.description}
                </span>
              </div>
            </div>
          );
        })}

      </div>

      {/* Department-wise Employee Count */}
      <div className="min-w-0 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm">

        <div className="flex items-start justify-between gap-3 mb-6">

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Department-wise Employee Count
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Employee distribution across departments
            </p>
          </div>

          <MoreHorizontal className="text-slate-400 shrink-0" />

        </div>

        <div className="space-y-6">

          {department_statistics.length > 0 ? (
            department_statistics.map((department) => {

              const count = Number(department.employee_count) || 0;
              const percentage = (count / maxEmployees) * 100;

              return (
                <div key={department.id}>

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">

                    <span className="text-sm font-medium text-slate-700">
                      {department.name}
                    </span>

                    <span className="text-xs sm:text-sm font-semibold text-slate-700">
                      {count} Employees
                    </span>

                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">

                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />

                  </div>

                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 text-center py-5">
              No department data available.
            </p>
          )}

        </div>
      </div>

      {/* Recently Added Employees */}
      <div className="min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5">

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Recently Added Employees
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Latest employees added to the organization
            </p>
          </div>

          <Link
            to="/employees"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
          >
            View All →
          </Link>

        </div>

        {/* Responsive Table */}
        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-150 text-left">

            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>

                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Employee
                </th>

                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Department
                </th>

                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Joining Date
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {recent_employees.length > 0 ? (
                recent_employees.map((employee) => {

                  const name =
                    employee.user?.name ||
                    employee.user?.username ||
                    employee.user?.first_name ||
                    "Employee";

                  const email = employee.user?.email || "N/A";

                  const initials = name
                    .trim()
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={employee.id}
                      className="hover:bg-slate-50 transition-colors"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800">
                              {name}
                            </p>

                            <p className="text-xs text-slate-500 truncate max-w-150">
                              {email}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {employee.department?.name || "N/A"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {employee.joining_date || "N/A"}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-8 text-sm text-slate-500"
                  >
                    No recently added employees found.
                  </td>
                </tr>
              )}

            </tbody>
          </table>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
