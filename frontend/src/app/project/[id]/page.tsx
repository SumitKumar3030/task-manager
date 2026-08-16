"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import axios from "axios";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ArrowLeft, Plus, Loader2, X } from "lucide-react";
import Column from "@/components/kanban/Column";
import TaskCard, { Task } from "@/components/kanban/TaskCard";

interface Member {
  user: { _id: string; name: string; email: string };
  role: string;
}

const STATUSES = ["todo", "in-progress", "review", "done"] as const;

export default function ProjectBoardPage() {
  const { id } = useParams();
  const router = useRouter();

  const [projectName, setProjectName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
    dueDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadBoard = useCallback(async () => {
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProjectName(projRes.data.project.name);

      const wsId = projRes.data.project.workspace;
      const [wsRes, tasksRes] = await Promise.all([
        api.get(`/workspaces/${wsId}`),
        api.get(`/tasks/project/${id}`),
      ]);

      setMembers(wsRes.data.workspace.members);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      await loadBoard();
      if (ignore) return;
    })();
    return () => {
      ignore = true;
    };
  }, [loadBoard]);

  const tasksByStatus = (status: string) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  const findTask = (taskId: string) => tasks.find((t) => t._id === taskId) || null;
  const findColumnOf = (taskId: string) => tasks.find((t) => t._id === taskId)?.status;

  const handleDragStart = (event: DragStartEvent) => {
    const task = findTask(event.active.id as string);
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskData = findTask(activeId);
    if (!activeTaskData) return;

    // Determine target column: either dropped on a column directly, or on another task
    const overIsColumn = (STATUSES as readonly string[]).includes(overId);
    const targetStatus = overIsColumn ? overId : findColumnOf(overId);
    if (!targetStatus) return;

    const sourceStatus = activeTaskData.status;

    let newTasks = [...tasks];

    if (sourceStatus === targetStatus) {
      // Reorder within same column
      const columnTasks = tasksByStatus(sourceStatus);
      const oldIndex = columnTasks.findIndex((t) => t._id === activeId);
      const newIndex = overIsColumn
        ? columnTasks.length - 1
        : columnTasks.findIndex((t) => t._id === overId);

      const reordered = arrayMove(columnTasks, oldIndex, newIndex).map((t, idx) => ({
        ...t,
        order: idx,
      }));

      newTasks = newTasks.map((t) => {
        const updated = reordered.find((r) => r._id === t._id);
        return updated || t;
      });

      setTasks(newTasks);

      try {
        await api.put(`/tasks/${activeId}`, { order: newIndex });
      } catch (err) {
        console.error(err);
        loadBoard();
      }
    } else {
      // Move to a different column
      const destTasks = tasksByStatus(targetStatus);
      const newOrder = destTasks.length;

      newTasks = newTasks.map((t) =>
        t._id === activeId ? { ...t, status: targetStatus as Task["status"], order: newOrder } : t
      );
      setTasks(newTasks);

      try {
        await api.put(`/tasks/${activeId}`, { status: targetStatus, order: newOrder });
      } catch (err) {
        console.error(err);
        loadBoard();
      }
    }
  };

  const openNewTask = () => {
    setEditingTask(null);
    setForm({ title: "", description: "", priority: "medium", assignee: "", dueDate: "" });
    setError("");
    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      assignee: task.assignee?._id || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setError("");
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, {
          title: form.title,
          description: form.description,
          priority: form.priority,
          assignee: form.assignee || null,
          dueDate: form.dueDate || null,
        });
      } else {
        await api.post("/tasks", {
          title: form.title,
          description: form.description,
          priority: form.priority,
          assignee: form.assignee || null,
          dueDate: form.dueDate || null,
          projectId: id,
        });
      }
      setShowTaskModal(false);
      loadBoard();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to save task");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    try {
      await api.delete(`/tasks/${editingTask._id}`);
      setShowTaskModal(false);
      loadBoard();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B14]">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-white font-semibold">{projectName}</h1>
        <button
          onClick={openNewTask}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </header>

      <main className="px-8 py-8 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-4 gap-4 min-w-[900px]">
            {STATUSES.map((status) => (
              <Column key={status} id={status} tasks={tasksByStatus(status)} onTaskClick={openEditTask} />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Task modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#14141f] border border-white/10 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">
                {editingTask ? "Edit Task" : "New Task"}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm p-3 rounded-r-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4">
              <input
                required
                autoFocus
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Task title"
                className="w-full px-4 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Description (optional)"
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="px-3 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="px-3 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <select
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                className="w-full px-3 py-2.5 bg-[#0B0B14] border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-3 pt-2">
                {editingTask && (
                  <button
                    type="button"
                    onClick={handleDeleteTask}
                    className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                  >
                    Delete
                  </button>
                )}
                <button
                  disabled={saving}
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-60 flex justify-center items-center"
                >
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}