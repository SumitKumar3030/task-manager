"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import axios from "axios";
import { Loader2, ShieldCheck } from "lucide-react";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/auth/verify-otp", { email, otp });
      setStatus({ type: "success", message: "Email verified! Redirecting to login..." });
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setStatus({ type: "error", message: error.response?.data?.message || "Verification failed" });
      } else {
        setStatus({ type: "error", message: "Something went wrong" });
      }
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.post("/auth/resend-otp", { email });
      setStatus({ type: "success", message: "A new code has been sent to your email." });
      setResendCooldown(60);
    } catch (error) {
      setStatus({ type: "error", message: "Failed to resend code. Try again shortly." });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <ShieldCheck className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900">Verify your email</h1>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>
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

        <form onSubmit={handleVerify} className="space-y-5">
          <input
            required
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full text-center tracking-[0.5em] text-xl font-semibold pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />

          <button
            disabled={isLoading || otp.length !== 6}
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify Email"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm">
          Didn&apos;t get the code?{" "}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-indigo-600 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}