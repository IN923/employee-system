
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  UserRound,
  Upload,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";

import axiosClient from "../services/api";

const AddEmployee = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    department: "",
    designation: "",
    salary: "",
    joining_date: "",
  });

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);

      try {
        const response = await axiosClient.get("/api/departments/");

        setDepartments(response.data.department_data || []);
      } catch (error) {
        console.error(error);
        setGeneralError("Unable to load departments.");
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  // Clean up image preview
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "full_name"
        ? { first_name: "", last_name: "" }
        : {}),
    }));

    setGeneralError("");
    setSuccessMessage("");
  };

  // Handle profile picture
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFieldErrors((prev) => ({
      ...prev,
      profile_pic: "",
    }));

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      setProfilePic(null);
      setImagePreview(null);

      setFieldErrors((prev) => ({
        ...prev,
        profile_pic: "Only JPG and PNG images are allowed.",
      }));

      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfilePic(null);
      setImagePreview(null);

      setFieldErrors((prev) => ({
        ...prev,
        profile_pic: "Image size must be less than 2 MB.",
      }));

      e.target.value = "";
      return;
    }

    setProfilePic(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Remove profile picture
  const removeImage = () => {
    setProfilePic(null);
    setImagePreview(null);
  };

  // Display backend validation errors
  const handleBackendErrors = (errors) => {
    const formattedErrors = {};

    Object.entries(errors || {}).forEach(([field, messages]) => {
      formattedErrors[field] = Array.isArray(messages)
        ? messages.join(" ")
        : String(messages);
    });

    setFieldErrors(formattedErrors);

    const knownFields = [
      "first_name",
      "last_name",
      "email",
      "phone_number",
      "password",
      "department",
      "designation",
      "salary",
      "joining_date",
      "profile_pic",
    ];

    const unknownErrors = Object.entries(formattedErrors)
      .filter(([field]) => !knownFields.includes(field))
      .map(([, message]) => message);

    if (unknownErrors.length) {
      setGeneralError(unknownErrors.join(" "));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFieldErrors({});
    setGeneralError("");
    setSuccessMessage("");

    const nameParts = formData.full_name.trim().split(/\s+/);

    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    if (!firstName) {
      setFieldErrors({
        full_name: "Please enter employee name.",
      });
      return;
    }

    const data = new FormData();

    data.append("first_name", firstName);
    data.append("last_name", lastName);
    data.append("email", formData.email);
    data.append("password", formData.password);

    if (formData.phone_number.trim()) {
      data.append("phone_number", formData.phone_number.trim());
    }

    if (formData.department) {
      data.append("department", formData.department);
    }

    if (formData.designation.trim()) {
      data.append("designation", formData.designation);
    }

    if (formData.salary) {
      data.append("salary", formData.salary);
    }

    if (formData.joining_date) {
      data.append("joining_date", formData.joining_date);
    }

    if (profilePic) {
      data.append("profile_pic", profilePic);
    }

    setSubmitting(true);

    try {
      const response = await axiosClient.post(
        "/api/employees/",
        data
      );

      if (response.data.success) {
        const employee = response.data.employee_data;

        setSuccessMessage(
          `Employee added successfully! Employee ID: ${
            employee?.employee_id || "Generated"
          }`
        );

        setFormData({
          full_name: "",
          email: "",
          phone_number: "",
          password: "",
          department: "",
          designation: "",
          salary: "",
          joining_date: "",
        });

        setProfilePic(null);
        setImagePreview(null);
      } else {
        handleBackendErrors(response.data.errors);
      }
    } catch (error) {
      console.error("Employee creation error:", error);

      const responseData = error.response?.data;

      if (responseData?.errors) {
        handleBackendErrors(responseData.errors);
      } else {
        setGeneralError(
          responseData?.message ||
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Get individual field error
  const getFieldError = (field) => fieldErrors[field] || "";

  // Input styling
  const inputClass = (field) =>
    `w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
      getFieldError(field)
        ? "border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    }`;

  // Render error message
  const renderError = (field) => {
    const message = getFieldError(field);

    if (!message) return null;

    return (
      <p className="mt-1.5 text-sm text-red-600">
        {message}
      </p>
    );
  };

  return (
    <div className="mx-auto max-w-5xl">

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Add Employee
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new employee to your organization.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2
            className="shrink-0 text-green-600"
            size={22}
          />

          <p className="flex-1 text-sm font-medium text-green-800">
            {successMessage}
          </p>

          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="text-sm font-semibold text-green-700 underline"
          >
            View Employees
          </button>
        </div>
      )}

      {/* General Error */}
      {generalError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {generalError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >

        {/* Profile Information */}
        <div className="border-b border-slate-200 p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Profile Information
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound
                  size={40}
                  className="text-slate-400"
                />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Upload size={16} />
                  Upload Photo

                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <X size={15} />
                    Remove
                  </button>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                JPG or PNG. Maximum file size: 2 MB.
              </p>

              {renderError("profile_pic")}
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="border-b border-slate-200 p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Personal Details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={inputClass("full_name")}
                required
              />

              {renderError("full_name")}
              {renderError("first_name")}
              {renderError("last_name")}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address <span className="text-red-500">*</span>
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={inputClass("email")}
                required
              />

              {renderError("email")}
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={inputClass("phone_number")}
              />

              {renderError("phone_number")}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={inputClass("password")}
                required
              />

              {renderError("password")}
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="p-6">
          <h2 className="mb-5 text-lg font-semibold text-slate-800">
            Employment Details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Department */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department
              </label>

              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={inputClass("department")}
              >
                <option value="">Select Department</option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name}
                  </option>
                ))}
              </select>

              {loadingDepartments && (
                <p className="mt-1 text-xs text-slate-500">
                  Loading departments...
                </p>
              )}

              {renderError("department")}
            </div>

            {/* Designation */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Designation
              </label>

              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Python Developer"
                className={inputClass("designation")}
              />

              {renderError("designation")}
            </div>

            {/* Salary */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Salary
              </label>

              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary"
                min="0"
                className={inputClass("salary")}
              />

              {renderError("salary")}
            </div>

            {/* Joining Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Joining Date
              </label>

              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                className={inputClass("joining_date")}
              />

              {renderError("joining_date")}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row">

          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />

            {submitting ? "Adding Employee..." : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
