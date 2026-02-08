import { Task, TaskStatus, TaskPriority } from "@/types/task";

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function headers() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

function mapNotionStatus(status: string): TaskStatus {
  const map: Record<string, TaskStatus> = {
    "To Do": "todo",
    "Not Started": "todo",
    "In Progress": "in_progress",
    "In Review": "review",
    Review: "review",
    Done: "done",
    Complete: "done",
  };
  return map[status] || "todo";
}

function mapNotionPriority(priority: string): TaskPriority {
  const map: Record<string, TaskPriority> = {
    Low: "low",
    Medium: "medium",
    High: "high",
    Urgent: "urgent",
  };
  return map[priority] || "medium";
}

function getPlainText(richText: Array<{ plain_text: string }>): string {
  return richText.map((t) => t.plain_text).join("");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchTasksFromNotion(): Promise<Task[]> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return [];
  }

  const res = await fetch(
    `${NOTION_API_BASE}/databases/${process.env.NOTION_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        sorts: [{ property: "Created", direction: "descending" }],
      }),
    }
  );

  if (!res.ok) return [];

  const data = await res.json();

  return (data.results as any[]).map((page: any) => {
    const props = page.properties;

    const titleProp = props.Name || props.Title || props.Task;
    const title = titleProp?.title
      ? getPlainText(titleProp.title)
      : "Untitled";

    const descProp = props.Description || props.Notes;
    const description = descProp?.rich_text
      ? getPlainText(descProp.rich_text)
      : "";

    const statusProp = props.Status;
    const status = statusProp?.status
      ? mapNotionStatus(statusProp.status.name)
      : "todo";

    const priorityProp = props.Priority;
    const priority = priorityProp?.select
      ? mapNotionPriority(priorityProp.select.name)
      : "medium";

    const assigneeProp = props.Assignee || props.Owner;
    const assignee = assigneeProp?.people
      ? assigneeProp.people.map((p: any) => p.name).join(", ")
      : "Unassigned";

    const dueProp = props["Due Date"] || props.Due || props.Deadline;
    const dueDate = dueProp?.date ? dueProp.date.start : "";

    const tagsProp = props.Tags || props.Labels;
    const tags = tagsProp?.multi_select
      ? tagsProp.multi_select.map((t: any) => t.name)
      : [];

    return {
      id: page.id,
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      tags,
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
    };
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  if (!process.env.NOTION_API_KEY) return;

  const statusMap: Record<TaskStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "In Review",
    done: "Done",
  };

  await fetch(`${NOTION_API_BASE}/pages/${taskId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        Status: {
          status: { name: statusMap[status] },
        },
      },
    }),
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
