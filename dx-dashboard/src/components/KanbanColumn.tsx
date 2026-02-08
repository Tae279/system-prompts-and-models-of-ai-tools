"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column } from "@/types/task";
import KanbanCard from "./KanbanCard";

const columnColors: Record<string, string> = {
  todo: "border-t-gray-400",
  in_progress: "border-t-blue-500",
  review: "border-t-yellow-500",
  done: "border-t-green-500",
};

interface KanbanColumnProps {
  column: Column;
}

export default function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div
        className={`bg-surface-alt rounded-xl border border-border border-t-4 ${columnColors[column.id]} p-4`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">{column.title}</h2>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-border text-xs font-medium text-text-muted">
            {column.tasks.length}
          </span>
        </div>

        <div ref={setNodeRef} className="space-y-3 min-h-[100px]">
          <SortableContext
            items={column.tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}
