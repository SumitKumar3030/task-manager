"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User } from "lucide-react";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assignee?: { _id: string; name: string; email: string } | null;
  dueDate?: string;
  order: number;
}

const priorityStyles: Record<string, string> = {
  low: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  high: "bg-red-500/15 text-red-300 border-red-500/30",
};

export default function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-[#1a1a28] border border-white/5 hover:border-indigo-500/40 rounded-lg p-3.5 cursor-grab active:cursor-grabbing transition-colors"
    >
      <h4 className="text-white text-sm font-medium mb-2 leading-snug">{task.title}</h4>

      <div className="flex items-center justify-between mt-3">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${priorityStyles[task.priority]}`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          )}
          {task.assignee ? (
            <div
              title={task.assignee.name}
              className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-semibold text-white"
            >
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}