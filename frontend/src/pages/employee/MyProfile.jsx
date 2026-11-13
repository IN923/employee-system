
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  IndianRupee,
  BadgeCheck,
} from "lucide-react";
import axiosClient from "../../services/api";

const formatDate = (date) => {
  if (!date) return "Not provided";

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatSalary = (salary) => {
  if (salary === null || salary === undefined || salary === "") {
    return "Not provided";
  }

  const amount = Number(salary);
  if (Number.isNaN(amount)) return salary;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await axiosClient.get("/api/employee/profile/");
        if (isMounted) setProfile(response.data.profile);
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              "Could not load your profile. Please try again.",
          );
        }
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const personalInfo = profile
    ? [
        { label: "Full Name", value: profile.full_name, icon: UserRound },
        { label: "Email Address", value: profile.email, icon: Mail },
        { label: "Phone Number", value: profile.phone_number, icon: Phone },
      ]
    : [];

  const employmentInfo = profile
    ? [
        { label: "Employee ID", value: profile.employee_id, icon: UserRound },
        { label: "Department", value: profile.department, icon: Building2 },
        {
          label: "Designation",
          value: profile.designation,
          icon: BriefcaseBusiness,
        },
        {
          label: "Joining Date",
          value: formatDate(profile.joining_date),
          icon: CalendarDays,
        },
        {
          label: "Salary",
          value: formatSalary(profile.salary),
          icon: IndianRupee,
        },
      ]
    : [];

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!profile) {
    return <p role="status">Loading your profile...</p>;
  }

  return (
    <div className="w-full space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Profile
        </h1>
        <p className="text-gray-500 mt-1">
          View your personal and employment details.
        </p>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          <div className="flex items-center gap-3 px-5 py-4 bg-blue-50 border-b border-gray-100">
            <UserRound className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>

          <div className="p-6">

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-7">
              <div className="w-28 h-28 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100 shrink-0">
                {profile.profile_pic ? (
                  <img
                    src={profile.profile_pic}
                    alt={`${profile.full_name}'s profile`}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="w-16 h-16 text-blue-600" />
                )}
              </div>

              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-gray-900">
                  {profile.full_name || "Name not provided"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {profile.designation || "Designation not provided"}
                </p>
                {/* <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  <BadgeCheck size={14} />
                  Active Employee
                </span> */}
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-5">
              {personalInfo.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3"
                  >
                    <Icon className="w-5 h-5 text-gray-400 mt-0.5" />

                    <div>
                      <p className="text-xs text-gray-500">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-gray-800 mt-1 break-all">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          <div className="flex items-center gap-3 px-5 py-4 bg-blue-50 border-b border-gray-100">
            <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">
              Employment Information
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {employmentInfo.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3"
                  >
                    <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />

                    <div className="flex-1">
                      <p className="text-xs text-gray-500">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-gray-800 mt-1">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Employment Status */}
              <div className="flex items-start gap-3">
                <BadgeCheck className="w-5 h-5 text-gray-400 mt-0.5" />

                <div>
                  <p className="text-xs text-gray-500">
                    Employment Status
                  </p>
                  {/* <span className="inline-block mt-1 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    Active
                  </span> */}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyProfile;
