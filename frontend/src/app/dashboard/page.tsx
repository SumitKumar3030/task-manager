"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import axios from "axios";
import { Plus, Loader2, Users, LogOut } from "lucide-react";

interface Workspace {
  _id: string;
  name: string;
  owner: { name: string; email: string };
  members: { user: string; role: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
  let ignore = false;

  const loadWorkspaces = async () => {
    try {
      const res = await api.get("/workspaces");
      if (!ignore) setWorkspaces(res.data.workspaces);
    } catch (err) {
      console.error(err);
    } finally {
      if (!ignore) setIsLoading(false);
    }
  };

  loadWorkspaces();

  return () => {
    ignore = true;
  };
}, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await api.post("/workspaces", { name: newName });
      setNewName("");
      setShowModal(false);
      fetchWorkspaces();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create workspace");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0B0B14]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <h1 className="text-xl font-bold text-white">
          Task<span className="text-indigo-400">Flow</span>
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Workspaces</h2>
            <p className="text-slate-400 text-sm mt-1">
              Pick a workspace to see its projects and tasks
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-400" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <p className="text-slate-400">You don&apos;t have any workspaces yet.</p>
            <p className="text-slate-600 text-sm mt-1">Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <button
                key={ws._id}
                onClick={() => router.push(`/workspace/${ws._id}`)}
                className="text-left bg-[#14141f] hover:bg-[#1a1a28] border border-white/5 hover:border-indigo-500/40 rounded-xl p-5 transition-colors"
              >
                <h3 className="text-white font-semibold text-lg mb-2">{ws.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Users className="w-3.5 h-3.5" />
                  {ws.members?.length || 1} member{ws.members?.length !== 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create workspace modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#14141f] border border-white/10 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold text-lg mb-4">New Workspace</h3>
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm p-3 rounded-r-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                required
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Marketing Team"
                className="w-full px-4 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={creating}
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-60 flex justify-center items-center"
                >
                  {creating ? <Loader2 className="animate-spin h-4 w-4" /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}