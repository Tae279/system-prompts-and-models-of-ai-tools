export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskSource = "chat" | "cowork" | "code";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  source: TaskSource;
  assignee: string;
  repo: string;
  dueDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export type SortField = "title" | "priority" | "status" | "dueDate" | "assignee" | "repo" | "source";
export type SortDirection = "asc" | "desc";
