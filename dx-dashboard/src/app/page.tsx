import StatCard from "@/components/StatCard";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import RepoLink from "@/components/RepoLink";
import { mockTasks } from "@/lib/mock-data";

export default function DashboardPage() {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = mockTasks.filter((t) => t.status === "in_progress").length;
  const urgentTasks = mockTasks.filter((t) => t.priority === "urgent").length;

  const recentTasks = [...mockTasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-muted mt-1">Claude AI / Cowork / Code &mdash; collaborative task overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          change="+3 this week"
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          change={`${Math.round((completedTasks / totalTasks) * 100)}% completion rate`}
          changeType="positive"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          change={`${inProgressTasks} active tasks`}
          changeType="neutral"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          title="Urgent"
          value={urgentTasks}
          change={urgentTasks > 0 ? "Needs attention" : "All clear"}
          changeType={urgentTasks > 0 ? "negative" : "positive"}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-text-muted">{task.assignee}</p>
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

        {/* Task Distribution */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <div className="space-y-4">
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

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold mb-3">Priority Breakdown</h3>
            <div className="flex flex-wrap gap-3">
              {(["urgent", "high", "medium", "low"] as const).map((priority) => {
                const count = mockTasks.filter((t) => t.priority === priority).length;
                return (
                  <div key={priority} className="flex items-center gap-2">
                    <PriorityBadge priority={priority} />
                    <span className="text-sm text-text-muted">{count}</span>
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
