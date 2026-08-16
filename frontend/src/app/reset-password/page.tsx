"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import axios from "axios";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      setStatus({ type: "success", message: "Password reset! Redirecting to login..." });
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setStatus({ type: "error", message: error.response?.data?.message || "Reset failed" });
      } else {
        setStatus({ type: "error", message: "Something went wrong" });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Lock className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-500 mt-2">
            Enter the code we sent you and choose a new password
          </p>
        </div>

        {status.message && (
          <div
            className={`p-4 border-l-4 text-sm rounded-r-lg ${
              status.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Reset Code</label>
            <input
              required
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] text-xl font-semibold px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                required
                type={showPassword ? "text" : "password"}
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm">
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}