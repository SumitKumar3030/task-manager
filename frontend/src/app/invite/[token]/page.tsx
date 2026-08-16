"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import axios from "axios";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AcceptInvitePage() {
  const { token } = useParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error" | "needs-login">("loading");
  const [message, setMessage] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");

  useEffect(() => {
    let ignore = false;

    const accept = async () => {
      const loggedIn = !!localStorage.getItem("token");

      if (!loggedIn) {
        if (!ignore) {
          setStatus("needs-login");
        }
        return;
      }

      try {
        const res = await api.post(`/workspaces/invite/${token}/accept`);
        if (!ignore) {
          setStatus("success");
          setMessage(res.data.message || "Joined workspace!");
          setWorkspaceId(res.data.workspace._id);
        }
      } catch (err) {
        if (!ignore) {
          setStatus("error");
          if (axios.isAxiosError(err)) {
            setMessage(err.response?.data?.message || "Failed to accept invite");
          } else {
            setMessage("Something went wrong");
          }
        }
      }
    };

    accept();
    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <Loader2 className="animate-spin h-10 w-10 text-indigo-400 mx-auto mb-4" />
            <p className="text-slate-400">Checking your invite...</p>
          </>
        )}

        {status === "needs-login" && (
          <>
            <p className="text-white font-semibold text-lg mb-2">Log in to accept this invite</p>
            <p className="text-slate-400 text-sm mb-6">
              You need an account with the invited email address to join this workspace.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/login?redirect=/invite/${token}`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Log In
              </Link>
              <Link
                href={`/register?redirect=/invite/${token}`}
                className="px-5 py-2.5 border border-white/10 hover:border-indigo-500/40 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Sign Up
              </Link>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-2">{message}</p>
            <button
              onClick={() => router.push(`/workspace/${workspaceId}`)}
              className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Go to Workspace
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-2">Couldn&apos;t accept invite</p>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}