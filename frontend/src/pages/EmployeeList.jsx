
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, SlidersHorizontal, FileSpreadsheet } from "lucide-react";

import EmployeeTable from "../components/EmployeeTable";
import axiosClient from "../services/api";

const EmployeeList = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [currentPages, setCurrentPages] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const PAGE_SIZE = Number(import.meta.env.VITE_PAGE_SIZE) || 10;

  const requestEmployees = useCallback(async () => {
    const response = await axiosClient.get("api/employees/", {
      params: {
        department: selectedDepartment,
        search: debouncedSearch,
        page: currentPages,
        page_size: PAGE_SIZE,
      },
    });

    const employees = response.data?.results?.employee_data;
    if (!Array.isArray(employees)) {
      throw new Error("Unexpected employee response.");
    }

    return {
      employees,
      totalPages: Math.max(
        1,
        Math.ceil((response.data.count || 0) / PAGE_SIZE)
      ),
    };
  }, [PAGE_SIZE, selectedDepartment, debouncedSearch, currentPages]);

  const fetchAllEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { employees, totalPages: pages } = await requestEmployees();
      setAllEmployees(employees);
      setTotalPages(pages);
    } catch (error) {
      console.error("Employee fetch error:", error);
      setAllEmployees([]);
      setError(
        error.response?.data?.message ||
        error.message ||
        "Unable to fetch employees."
      );
    } finally {
      setLoading(false);
    }
  }, [requestEmployees]);

  const handleExportExcel = async () => {
    try {
      const response = await axiosClient.get(
        "api/employees/export/",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "Employee_Data.xlsx");

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Excel export failed:", error);
      alert("Failed to export employee data.");
    }
  };

  useEffect(() => {
    let active = true;

    const loadDepartments = async () => {
      try {
        const response = await axiosClient.get("api/departments/");
        const departments = response.data?.department_data;
        if (active && Array.isArray(departments)) {
          setAllDepartments(departments);
        }
      } catch (error) {
        console.error("Department fetch error:", error);
      }
    };

    loadDepartments();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const normalizedSearch = searchTerm.trim();
    if (normalizedSearch === debouncedSearch) return;

    const timeoutId = setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
      setCurrentPages(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    let active = true;

    const loadEmployees = async () => {
      setLoading(true);
      try {
        const { employees, totalPages: pages } = await requestEmployees();
        if (active) {
          setAllEmployees(employees);
          setTotalPages(pages);
          setError("");
        }
      } catch (error) {
        if (active) {
          console.error("Employee fetch error:", error);
          setAllEmployees([]);
          setError(
            error.response?.data?.message ||
            error.message ||
            "Unable to fetch employees."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEmployees();
    return () => {
      active = false;
    };
  }, [requestEmployees]);

  const handleDepartmentChange = (e) => {
    setLoading(true);
    setError("");
    setSelectedDepartment(e.target.value);
    setCurrentPages(1);
  };

  const handlePageChange = (page) => {
    setLoading(true);
    setError("");
    setCurrentPages(page);
  };

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Employees
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and view all employees in your organization.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={handleExportExcel}>
            <FileSpreadsheet size={18} />
            Export to Excel
          </button>

          <Link
            to="/employees/add"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Search and Department Filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by employee name..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-slate-500" />

            <select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="">All Departments</option>

              {allDepartments.map((department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Employee Table */}
      {loading ? (
        <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
          Loading employees...
        </div>
      ) : error ? (
        <div className="rounded-xl border bg-white p-10 text-center text-red-500">
          {error}
        </div>
      ) : allEmployees.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
          No employees found.
        </div>
      ) : (
        <EmployeeTable
          employees={allEmployees}
          currentPages={currentPages}
          totalPages={totalPages}
          setCurrentPages={handlePageChange}
          fetchAllEmployees={fetchAllEmployees}
        />
      )}

    </div>
  );
};

export default EmployeeList;
