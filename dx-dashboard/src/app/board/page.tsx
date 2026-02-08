"use client";

import KanbanBoard from "@/components/KanbanBoard";
import { mockTasks } from "@/lib/mock-data";

export default function BoardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Board</h1>
        <p className="text-text-muted mt-1">
          Drag and drop tasks between columns to update their status
        </p>
      </div>

      <KanbanBoard initialTasks={mockTasks} />
    </div>
  );
}
