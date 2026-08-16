"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/axios";
import axios from "axios";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", formData);
      const token = res.data.token;

      if (token) {
        localStorage.setItem("token", token);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.needsVerification) {
          router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
          return;
        }
        setError(err.response?.data?.message || "Invalid email or password. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Side: Branding/Visual */}
      <div className="hidden md:flex flex-col justify-center bg-indigo-600 p-12 text-white">
        <h2 className="text-4xl font-bold mb-6">Get Back To Work.</h2>
        <p className="text-indigo-100 text-lg max-w-md">
          Pick up right where you left off — boards, tasks, and your whole
          team, all in sync.
        </p>
        <div className="mt-12 p-6 bg-indigo-500/30 rounded-xl border border-indigo-400/30 backdrop-blur-sm">
          <p className="italic text-indigo-50">
            This app cut our standup time in half — everyone just checks the board.
          </p>
          <p className="mt-4 font-semibold">— Sarah J., Operations Lead</p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">
              Please enter your details to sign in
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-gray-600">
            Do not have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}