import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
  useNavigate,
} from "@tanstack/react-router";
import { BookOpen, TestTube, Settings, ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/auth-store";

export const Route = createFileRoute("/app/projects/$projectId")({
  component: ProjectLayout,
});

function ProjectLayout() {
  const { projectId } = useParams({ from: "/app/projects/$projectId" });
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
  const {
    data: project,
    isLoading,
    error,
  } = useQuery(
    trpc.projects.get.queryOptions(
      { token: token || "", projectId },
      { enabled: !!token },
    ),
  );

  if (!token) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error ? "Failed to load project" : "Project not found"}
        </div>
        <Link
          to="/app"
          className="mt-4 inline-flex items-center text-sm text-amber-600 hover:text-amber-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Project Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/app"
              className="text-gray-600 transition-colors hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {project.name}
              </h1>
              <p className="text-sm text-gray-500">{project.url}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4 flex space-x-6">
          <Link
            to="/app/projects/$projectId"
            params={{ projectId }}
            className="inline-flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors"
            activeProps={{
              className: "border-amber-500 text-amber-600",
            }}
            inactiveProps={{
              className:
                "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            }}
            activeOptions={{ exact: true }}
          >
            <TestTube className="mr-2 h-4 w-4" />
            Test Runs
          </Link>
          <Link
            to="/app/projects/$projectId/learnings"
            params={{ projectId }}
            className="inline-flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors"
            activeProps={{
              className: "border-amber-500 text-amber-600",
            }}
            inactiveProps={{
              className:
                "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            }}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Learnings
          </Link>
          <Link
            to="/app/projects/$projectId/settings"
            params={{ projectId }}
            className="inline-flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors"
            activeProps={{
              className: "border-amber-500 text-amber-600",
            }}
            inactiveProps={{
              className:
                "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}
