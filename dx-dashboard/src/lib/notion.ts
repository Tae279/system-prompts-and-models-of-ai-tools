import { Task, TaskStatus, TaskPriority } from "@/types/task";

/**
 * Notion integration supporting two modes:
 *
 * 1. MCP mode (preferred): Set NOTION_MCP_URL to your Notion MCP server endpoint
 *    (e.g. http://localhost:3100/mcp for local @notionhq/notion-mcp-server,
 *    or https://mcp.notion.com/mcp for Notion's hosted MCP).
 *    The MCP server handles auth via OAuth or its own NOTION_TOKEN.
 *
 * 2. Direct API mode (fallback): Set NOTION_API_KEY + NOTION_DATABASE_ID to
 *    call the Notion REST API directly.
 *
 * If neither is configured, returns empty (dashboard falls back to mock data).
 */

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function apiHeaders() {
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

// ---------------------------------------------------------------------------
// MCP transport: call the Notion MCP server over Streamable HTTP (JSON-RPC)
// ---------------------------------------------------------------------------

async function mcpCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const mcpUrl = process.env.NOTION_MCP_URL!;
  const res = await fetch(mcpUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolName, arguments: args },
    }),
  });
  if (!res.ok) throw new Error(`MCP request failed: ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

async function fetchTasksViaMcp(): Promise<Task[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) return [];

  const result = (await mcpCall("notion_query_database", {
    database_id: databaseId,
    sorts: [{ property: "Created", direction: "descending" }],
  })) as { content?: Array<{ text?: string }> };

  if (!result?.content?.[0]?.text) return [];

  const data = JSON.parse(result.content[0].text);
  const pages = Array.isArray(data) ? data : data?.results;
  if (!Array.isArray(pages)) return [];

  return mapNotionPages(pages);
}

async function updateTaskViaMcp(
  taskId: string,
  statusName: string
): Promise<void> {
  await mcpCall("notion_update_page", {
    page_id: taskId,
    properties: {
      Status: { status: { name: statusName } },
    },
  });
}

// ---------------------------------------------------------------------------
// Direct REST API transport
// ---------------------------------------------------------------------------

async function fetchTasksViaApi(): Promise<Task[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!process.env.NOTION_API_KEY || !databaseId) return [];

  const res = await fetch(
    `${NOTION_API_BASE}/databases/${databaseId}/query`,
    {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        sorts: [{ property: "Created", direction: "descending" }],
      }),
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return mapNotionPages(data.results);
}

async function updateTaskViaApi(
  taskId: string,
  statusName: string
): Promise<void> {
  await fetch(`${NOTION_API_BASE}/pages/${taskId}`, {
    method: "PATCH",
    headers: apiHeaders(),
    body: JSON.stringify({
      properties: {
        Status: { status: { name: statusName } },
      },
    }),
  });
}

// ---------------------------------------------------------------------------
// Shared page mapper
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapNotionPages(pages: any[]): Task[] {
  return pages.map((page: any) => {
    const props = page.properties || {};

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

    const repoProp = props.Repo || props.Repository || props["GitHub Repo"];
    const repo = repoProp?.url
      ? (repoProp.url as string).replace("https://github.com/", "")
      : repoProp?.rich_text
        ? getPlainText(repoProp.rich_text)
        : "";

    return {
      id: page.id,
      title,
      description,
      status,
      priority,
      assignee,
      repo,
      dueDate,
      tags,
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
    };
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Public API — picks the right transport automatically
// ---------------------------------------------------------------------------

export async function fetchTasksFromNotion(): Promise<Task[]> {
  if (process.env.NOTION_MCP_URL) {
    return fetchTasksViaMcp();
  }
  return fetchTasksViaApi();
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<void> {
  const statusMap: Record<TaskStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "In Review",
    done: "Done",
  };
  const statusName = statusMap[status];

  if (process.env.NOTION_MCP_URL) {
    await updateTaskViaMcp(taskId, statusName);
    return;
  }

  if (process.env.NOTION_API_KEY) {
    await updateTaskViaApi(taskId, statusName);
  }
}
