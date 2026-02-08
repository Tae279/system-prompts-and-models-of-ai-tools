import { NextRequest, NextResponse } from "next/server";
import { fetchTasksFromNotion, updateTaskStatus } from "@/lib/notion";
import { mockTasks } from "@/lib/mock-data";
import { TaskStatus } from "@/types/task";

export async function GET() {
  try {
    const notionTasks = await fetchTasksFromNotion();

    if (notionTasks.length > 0) {
      return NextResponse.json({ tasks: notionTasks, source: "notion" });
    }

    return NextResponse.json({ tasks: mockTasks, source: "mock" });
  } catch {
    return NextResponse.json({ tasks: mockTasks, source: "mock" });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { taskId, status } = (await request.json()) as {
      taskId: string;
      status: TaskStatus;
    };

    if (!taskId || !status) {
      return NextResponse.json(
        { error: "taskId and status are required" },
        { status: 400 }
      );
    }

    await updateTaskStatus(taskId, status);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
