"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import axios from "axios";
import { Mail, Loader2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <KeyRound className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
          <p className="text-gray-500 mt-2">
            Enter your email and we&apos;ll send you a reset code
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="space-y-6 text-center">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-sm text-left rounded-r-lg">
              If an account exists for <span className="font-medium">{email}</span>, a reset code has been sent.
            </div>
            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all"
            >
              I have a code
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send Reset Code"}
            </button>
          </form>
        )}

        <p className="text-center text-gray-600 text-sm">
          Remembered your password?{" "}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}