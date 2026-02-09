import StatCard from "@/components/StatCard";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import SourceBadge from "@/components/SourceBadge";
import RepoLink from "@/components/RepoLink";
import { mockTasks } from "@/lib/mock-data";
import { TaskSource } from "@/types/task";

const sourceInfo: Record<TaskSource, { label: string; color: string }> = {
  chat: { label: "Claude Chat", color: "bg-violet-500" },
  cowork: { label: "Claude Cowork", color: "bg-amber-500" },
  code: { label: "Claude Code", color: "bg-emerald-500" },
};

export default function DashboardPage() {
  const totalTasks = mockTasks.length;
  const chatTasks = mockTasks.filter((t) => t.source === "chat").length;
  const coworkTasks = mockTasks.filter((t) => t.source === "cowork").length;
  const codeTasks = mockTasks.filter((t) => t.source === "code").length;

  const recentTasks = [...mockTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-muted mt-1">Your tasks across Claude Chat, Cowork, and Code</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="All Tasks"
          value={totalTasks}
          change={`${mockTasks.filter((t) => t.status === "done").length} completed`}
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Claude Chat"
          value={chatTasks}
          change={`${mockTasks.filter((t) => t.source === "chat" && t.status !== "done").length} active`}
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <StatCard
          title="Claude Cowork"
          value={coworkTasks}
          change={`${mockTasks.filter((t) => t.source === "cowork" && t.status !== "done").length} active`}
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Claude Code"
          value={codeTasks}
          change={`${mockTasks.filter((t) => t.source === "code" && t.status !== "done").length} active`}
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <SourceBadge source={task.source} />
                    <RepoLink repo={task.repo} size="xs" />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks by Source */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Tasks by Source</h2>
          <div className="space-y-4">
            {(["chat", "cowork", "code"] as const).map((source) => {
              const count = mockTasks.filter((t) => t.source === source).length;
              const doneCount = mockTasks.filter((t) => t.source === source && t.status === "done").length;
              const percentage = Math.round((count / totalTasks) * 100);
              return (
                <div key={source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{sourceInfo[source].label}</span>
                    <span className="text-text-muted">{count} tasks ({doneCount} done)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${sourceInfo[source].color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Status Overview</h3>
            <div className="space-y-3">
              {(["todo", "in_progress", "review", "done"] as const).map((status) => {
                const count = mockTasks.filter((t) => t.status === status).length;
                const percentage = Math.round((count / totalTasks) * 100);
                const colors = {
                  todo: "bg-gray-400",
                  in_progress: "bg-blue-500",
                  review: "bg-yellow-500",
                  done: "bg-green-500",
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize">{status.replace("_", " ")}</span>
                      <span className="text-text-muted">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[status]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
