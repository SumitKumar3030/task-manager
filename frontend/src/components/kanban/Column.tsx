"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard, { Task } from "./TaskCard";

const columnMeta: Record<string, { label: string; dot: string }> = {
  todo: { label: "To Do", dot: "bg-slate-400" },
  "in-progress": { label: "In Progress", dot: "bg-indigo-400" },
  review: { label: "Review", dot: "bg-amber-400" },
  done: { label: "Done", dot: "bg-emerald-400" },
};

export default function Column({
  id,
  tasks,
  onTaskClick,
}: {
  id: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const meta = columnMeta[id];

  return (
    <div className="flex flex-col w-full min-w-[260px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
        <h3 className="text-sm font-semibold text-slate-300">{meta.label}</h3>
        <span className="text-xs text-slate-600 ml-1">{tasks.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-colors ${
          isOver ? "bg-indigo-500/5" : "bg-[#0F0F18]"
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="text-center text-slate-700 text-xs py-8">Drop tasks here</div>
        )}
      </div>
    </div>
  );
}