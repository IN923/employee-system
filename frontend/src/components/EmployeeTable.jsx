
import {
  Eye,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import { Link } from "react-router";
import { useState } from "react";
import axiosClient from "../services/api";

const EmployeeTable = ({
  employees = [],
  currentPages = 1,
  totalPages = 1,
  setCurrentPages,
  fetchAllEmployees,
}) => {

  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const handleDelete = async (employee) => {

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.employee_id}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(employee.id);
      setError("");

      // Call soft delete API
      await axiosClient.delete(
        `/api/employees/${employee.id}/`
      );

      // Fetch employees again after deletion
      await fetchAllEmployees();

    } catch (err) {
      console.error("Delete employee error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to delete employee."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Employee List
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Manage and view all employee records.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">

          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                Employee
              </th>

              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                Employee ID
              </th>

              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                Department
              </th>

              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                Designation
              </th>

              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                Salary
              </th>

              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase">
                Joining Date
              </th>

              <th className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {employees.length > 0 ? (

              employees.map((employee) => (

                <tr
                  key={employee.id}
                  className="hover:bg-gray-50 transition"
                >

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                        {employee.full_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {employee.full_name || "Name unavailable"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {employee.email || ""}
                        </p>
                      </div>

                    </div>
                  </td>

                  {/* Employee ID */}
                  <td className="px-5 py-4 text-sm font-medium text-gray-700">
                    {employee.employee_id}
                  </td>

                  {/* Department */}
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {employee.department}
                  </td>

                  {/* Designation */}
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {employee.designation}
                  </td>

                  {/* Salary */}
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {employee.salary}
                  </td>

                  {/* Joining Date */}
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {employee.joining_date}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">

                      {/* View */}
                      <Link
                        to={`/employees/${employee.id}`}
                        title="View Employee"
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <Eye size={17} />
                      </Link>

                      {/* Edit */}
                      <Link
                        to={`/employees/edit/${employee.id}`}
                        title="Edit Employee"
                        className="p-2 rounded-lg text-green-600 hover:bg-green-50"
                      >
                        <Pencil size={17} />
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        title="Delete Employee"
                        onClick={() => handleDelete(employee)}
                        disabled={deletingId !== null}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {deletingId === employee.id ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>

                    </div>
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-12 text-center text-sm text-gray-500"
                >
                  No employees found.
                </td>
              </tr>

            )}

          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">

        <p className="text-sm text-gray-500">
          Showing {employees.length} employees
        </p>

        <p className="text-sm text-gray-500">
          Page {currentPages} of {totalPages}
        </p>

      </div>

      {/* Pagination */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">

        <button
          disabled={currentPages === 1}
          onClick={() => setCurrentPages(prev => prev - 1)}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <button
          disabled={currentPages >= totalPages}
          onClick={() => setCurrentPages(prev => prev + 1)}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default EmployeeTable;
