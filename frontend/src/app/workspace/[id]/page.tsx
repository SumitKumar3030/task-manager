"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import axios from "axios";
import { Plus, Loader2, ArrowLeft, UserPlus, Users, FolderKanban } from "lucide-react";

interface Member {
  user: { _id: string; name: string; email: string };
  role: string;
}

interface Workspace {
  _id: string;
  name: string;
  owner: { name: string; email: string };
  members: Member[];
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: { name: string };
}

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      const [wsRes, projRes] = await Promise.all([
        api.get(`/workspaces/${id}`),
        api.get(`/projects/workspace/${id}`),
      ]);
      setWorkspace(wsRes.data.workspace);
      setProjects(projRes.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const [wsRes, projRes] = await Promise.all([
          api.get(`/workspaces/${id}`),
          api.get(`/projects/workspace/${id}`),
        ]);
        if (!ignore) {
          setWorkspace(wsRes.data.workspace);
          setProjects(projRes.data.projects);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProject(true);
    setError("");
    try {
      await api.post("/projects", {
        name: projectName,
        description: projectDesc,
        workspaceId: id,
      });
      setProjectName("");
      setProjectDesc("");
      setShowProjectModal(false);
      loadData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create project");
      }
    } finally {
      setCreatingProject(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError("");
    setSuccessMsg("");
    try {
      await api.post(`/workspaces/${id}/invite`, { email: inviteEmail });
      setSuccessMsg(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to send invite");
      }
    } finally {
      setInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-400" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <p className="text-slate-400">Workspace not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B14]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 text-slate-300 hover:text-white text-sm border border-white/10 hover:border-indigo-500/40 px-3 py-1.5 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{workspace.name}</h1>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-2">
            <Users className="w-4 h-4" />
            {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <button
            onClick={() => setShowProjectModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
            <FolderKanban className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No projects yet.</p>
            <p className="text-slate-600 text-sm mt-1">Create one to start adding tasks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <button
                key={p._id}
                onClick={() => router.push(`/project/${p._id}`)}
                className="text-left bg-[#14141f] hover:bg-[#1a1a28] border border-white/5 hover:border-indigo-500/40 rounded-xl p-5 transition-colors"
              >
                <h3 className="text-white font-semibold text-lg mb-1">{p.name}</h3>
                {p.description && (
                  <p className="text-slate-400 text-sm line-clamp-2">{p.description}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create project modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#14141f] border border-white/10 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold text-lg mb-4">New Project</h3>
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm p-3 rounded-r-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input
                required
                autoFocus
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className="w-full px-4 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <textarea
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={creatingProject}
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-60 flex justify-center items-center"
                >
                  {creatingProject ? <Loader2 className="animate-spin h-4 w-4" /> : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#14141f] border border-white/10 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold text-lg mb-4">Invite Teammate</h3>
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm p-3 rounded-r-lg mb-4">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-500/10 border-l-4 border-green-500 text-green-400 text-sm p-3 rounded-r-lg mb-4">
                {successMsg}
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-4">
              <input
                required
                autoFocus
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@company.com"
                className="w-full px-4 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
                
                <button
                  disabled={inviting}
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-60 flex justify-center items-center"
                >
                  {inviting ? <Loader2 className="animate-spin h-4 w-4" /> : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}