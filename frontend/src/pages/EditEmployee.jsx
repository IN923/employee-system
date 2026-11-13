
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  UserRound,
  Save,
  X,
  Camera,
  LoaderCircle,
} from "lucide-react";

import axiosClient from "../services/api";

const BASE_URL = `${import.meta.env.VITE_API_URL}`.slice(0, -1);

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    department: "",
    designation: "",
    salary: "",
    joining_date: "",
    profile_pic: null,
  });

  const [preview, setPreview] = useState("");

  // Fetch employee and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeeResponse, departmentResponse] =
          await Promise.all([
            axiosClient.get(`/api/employees/${id}/`),
            axiosClient.get("/api/departments/"),
          ]);

        const employeeData =
          employeeResponse.data.employee_detail;

        const departmentData =
          departmentResponse.data.department_data ||
          departmentResponse.data.results ||
          departmentResponse.data;

        setEmployee(employeeData);
        setDepartments(departmentData);

        setFormData({
          department:
            employeeData.department?.id ||
            employeeData.department ||
            "",
          designation: employeeData.designation || "",
          salary: employeeData.salary ?? "",
          joining_date: employeeData.joining_date || "",
          profile_pic: null,
        });

        if (employeeData.profile_pic) {
          setPreview(employeeData.profile_pic);
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Unable to load employee details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile picture
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPG and PNG images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must not exceed 2MB.");
      e.target.value = "";
      return;
    }

    setError("");

    setFormData((prev) => ({
      ...prev,
      profile_pic: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const data = new FormData();

      data.append("department", formData.department);
      data.append("designation", formData.designation);
      data.append("salary", formData.salary);
      data.append("joining_date", formData.joining_date);

      if (formData.profile_pic) {
        data.append("profile_pic", formData.profile_pic);
      }

      const response = await axiosClient.put(
        `/api/employees/${id}/`,
        data
      );

      setSuccess(
        response.data.message ||
        "Employee updated successfully."
      );

      navigate(`/employees/${id}`);
    } catch (err) {
      console.error("Error updating employee:", err);

      const errors = err.response?.data?.errors;

      if (errors) {
        setError(
          Object.entries(errors)
            .map(([field, messages]) => {
              return `${field}: ${
                Array.isArray(messages)
                  ? messages.join(", ")
                  : messages
              }`;
            })
            .join(" | ")
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Failed to update employee."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoaderCircle
          className="animate-spin text-blue-600"
          size={30}
        />
      </div>
    );
  }

  // Employee not found
  if (!employee) {
    return (
      <div className="text-center py-10 text-red-500">
        {error || "Employee not found."}
      </div>
    );
  }

  const userName =
    employee.user?.name ||
    employee.user?.username ||
    "Employee";

  const userEmail =
    employee.user?.email || "Not available";

  const userPhone =
    employee.user?.phone_number || "Not available";

  // Existing media URL OR newly selected blob URL
  const profileImage = preview
    ? preview.startsWith("blob:")
      ? preview
      : `${BASE_URL}${preview}`
    : "";

  return (
    <div className="max-w-5xl mx-auto">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Employee
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Update employee information and details
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Employee Profile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Employee"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserRound
                  size={45}
                  className="text-blue-500"
                />
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                {userName}
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Employee ID: {employee.employee_id || "N.A."}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Personal Information */}
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-5">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={userName}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={userPhone}
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Designation
                </label>

                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Employment Information */}
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-5">
              Employment Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Joining Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Joining Date
                </label>

                <input
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Salary <span className="text-red-500">*</span>
                </label>

                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Profile Photo */}
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              Profile Photo
            </h3>

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={45}
                    className="text-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-100 transition">
                  <Camera size={17} />
                  Change Photo

                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                <p className="text-xs text-slate-400 mt-2">
                  JPG, PNG (Max 2MB)
                </p>
              </div>

            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Success Message */}
          {success && (
            <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              {success}
            </p>
          )}

          {/* Action Buttons */}
          <div className="border-t border-slate-100 pt-5 flex flex-col-reverse sm:flex-row justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate(`/employees/${id}`)}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
            >
              <span className="flex items-center justify-center gap-2">
                <X size={17} />
                Cancel
              </span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition"
            >
              <span className="flex items-center justify-center gap-2">
                {saving ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={17} />
                )}

                {saving ? "Updating..." : "Update Employee"}
              </span>
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default EditEmployee;
