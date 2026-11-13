
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  CalendarDays,
  Building2,
  BriefcaseBusiness,
  UserRound,
  IdCard,
  IndianRupee,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axiosClient from "../services/api";

const EmployeeDetail = () => {

  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BASE_URL = `${import.meta.env.VITE_API_URL}`.slice(0,-1)
  // Fetch Employee Details
  useEffect(() => {

    const fetchEmployeeDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axiosClient.get(
          `/api/employees/${id}/`
        );

        setEmployee(response.data.employee_detail);

      } catch (error) {
        console.log("Error fetching employee:", error);
        setError(
          error.response?.data?.message || "Failed to fetch employee details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetail();

  }, [id]);

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-sm font-medium text-slate-500">
          Loading employee details...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !employee) {
    return (
      <div className="rounded-xl border border-red-100 bg-white p-6 text-center">
        <p className="text-sm text-red-500">
          {error || "Employee not found."}
        </p>

        <Link
          to="/employees"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </Link>
      </div>
    );
  }

  // Employee Data
  const employeeName = employee.user?.name || "N.A.";
  const employeeEmail = employee.user?.email || "N.A.";
  const employeePhone = employee.user?.phone || "N.A.";
  const departmentName = employee.department?.name || "N.A.";

  // Format Joining Date
  const joiningDate = employee.joining_date
    ? new Date(employee.joining_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "N.A.";

  // Format Salary
  const salary = employee.salary
    ? `₹${Number(employee.salary).toLocaleString("en-IN")}`
    : "N.A.";

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <Link
            to="/employees"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Employees
          </Link>

          <h1 className="text-2xl font-bold text-slate-800">
            Employee Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View complete employee information.
          </p>
        </div>

        <Link
          to={`/employees/edit/${employee.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Pencil size={17} />
          Edit Employee
        </Link>

      </div>

      {/* Employee Profile Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xl font-bold text-blue-700">

            {employee.profile_pic ? (
              <img
                src={`${BASE_URL}${employee.profile_pic}`}
                alt={employeeName}
                className="h-full w-full object-cover"
              />
            ) : (
              employeeName.charAt(0).toUpperCase()
            )}

          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {employeeName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {employee.designation || "N.A."}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-400">
              {employee.employee_id}
            </p>
          </div>

        </div>

      </div>

      {/* Employee Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Personal Information */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-4">

            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <UserRound size={18} className="text-blue-600" />
              Personal Information
            </h3>

          </div>

          <div className="space-y-5 p-6">

            {/* Full Name */}
            <div>
              <p className="text-xs font-medium text-slate-400">
                Full Name
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {employeeName}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs font-medium text-slate-400">
                Email Address
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Mail size={15} className="text-slate-400" />
                {employeeEmail}
              </p>
            </div>

            {/* Phone */}
            <div>
              <p className="text-xs font-medium text-slate-400">
                Phone Number
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700">
                <Phone size={15} className="text-slate-400" />
                {employeePhone}
              </p>
            </div>

          </div>

        </div>

        {/* Employment Information */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-4">

            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <BriefcaseBusiness size={18} className="text-blue-600" />
              Employment Information
            </h3>

          </div>

          <div className="space-y-5 p-6">

            {/* Employee ID */}
            <div>
              <p className="text-xs font-medium text-slate-400">
                Employee ID
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <IdCard size={15} className="text-slate-400" />
                {employee.employee_id || "N.A."}
              </p>
            </div>

            {/* Department */}
            <div>
              <p className="text-xs font-medium text-slate-400">
                Department
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Building2 size={15} className="text-slate-400" />
                {departmentName}
              </p>
            </div>

            {/* Designation */}
            <div>
              <p className="text-xs font-medium text-slate-400">
                Designation
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {employee.designation || "N.A."}
              </p>
            </div>

            {/* Joining Date */}
            <div>
              <p className="text-xs font-medium text-slate-400">
                Joining Date
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarDays size={15} className="text-slate-400" />
                {joiningDate}
              </p>
            </div>

            {/* Salary */}
            <div>
              <p className="text-xs font-medium text-slate-400">
                Salary
              </p>

              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <IndianRupee size={15} className="text-slate-400" />
                {salary}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default EmployeeDetail;
