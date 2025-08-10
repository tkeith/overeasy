import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Play, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/auth-store";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/projects/$projectId/")({
  component: ProjectTestRuns,
});

function ProjectTestRuns() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/" });
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const trpc = useTRPC();

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      void navigate({ to: "/login" });
    }
  }, [token, navigate]);

  // Fetch project details
  const { data: project } = useQuery(
    trpc.projects.get.queryOptions(
      { token: token || "", projectId },
      { enabled: !!token },
    ),
  );

  if (!token || !project) {
    return null;
  }

  // For now, we'll show a placeholder since test runs aren't implemented yet
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Runs</h2>
          <p className="mt-1 text-sm text-gray-600">
            Security vulnerability testing history and results
          </p>
        </div>
        <button
          disabled
          className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Test Run (Coming Soon)
        </button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
        <AlertTriangle className="mb-4 h-12 w-12 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">
          Test Runs Coming Soon
        </h3>
        <p className="mt-2 max-w-md text-center text-sm text-gray-500">
          Security testing functionality will be available in a future update.
          For now, you can add learning resources to build your knowledge base.
        </p>
      </div>
    </div>
  );
}
