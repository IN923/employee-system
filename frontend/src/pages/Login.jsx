
import { useState } from "react";
import {
  Users,
  Mail,
  LockKeyhole,
  Eye,
  LogIn,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/auth";
import { getRoleLandingPath } from "../utils/routes";
import toast from "react-hot-toast";

const Login = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    
    try {
      const role = await login({
        username:email,
        password:password,
      });

      toast.success("Login successful");
      navigate(getRoleLandingPath(role), { replace: true });
    } catch (loginError) {
      setError(
        loginError.response?.data?.detail ||
          "Unable to sign in. Check your email and password.",
      );
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white overflow-hidden">

      {/* Left Section */}
      <div className="hidden lg:flex flex-col justify-center bg-blue-50 px-12 xl:px-20 relative">

        <div className="absolute top-10 left-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Employee System
          </span>
        </div>

        <div className="max-w-lg">
          {/* <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
            <ClipboardCheck className="w-7 h-7 text-blue-600" />
          </div> */}

          <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
            Manage your team
            <span className="block text-blue-600">
              smarter and faster.
            </span>
          </h1>

          <p className="mt-5 text-gray-600 text-base leading-relaxed">
            A simple and efficient employee management system
            to organize your workforce, manage departments,
            and keep everything in one place.
          </p>

          <div className="mt-8 space-y-4">
            {[
              "Manage employee information",
              "Organize departments",
              "Track employee statistics",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 text-sm font-medium">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="absolute bottom-8 left-12 text-sm text-gray-500">
          © 2026 EMS. All rights reserved.
        </div> */}
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center px-5 py-6 sm:px-8">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-7">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Employee System
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back!
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Please enter your details to sign in.
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleLogin}>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  required
                  placeholder="Enter your email"
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  onChange={(event) => setEmail(event.target.value)}
                  value={email}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="w-full h-12 pl-12 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  onChange={(event) => setPassword(event.target.value)}
                  value={password}
                />

                <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer" />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-100 transition"
            >
              <LogIn className="w-5 h-5" />
              Sign In
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
