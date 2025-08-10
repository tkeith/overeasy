import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
} from "@tanstack/react-router";
import { sampleProjects } from "~/data/placeholder-data";
import { ArrowLeft, Play, BookOpen } from "lucide-react";

export const Route = createFileRoute("/app/projects/$projectId")({
  component: ProjectLayout,
});

function ProjectLayout() {
  const { projectId } = useParams({ from: "/app/projects/$projectId" });
  const project = sampleProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="py-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Project not found
          </h2>
          <Link
            to="/app"
                          className="mt-4 inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const isTestRunsActive =
    window.location.pathname.includes("/learnings") === false;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Project Header */}
      <div className="mb-6">
        <Link
          to="/app"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>

        <div className="rounded-lg bg-white p-6 shadow-sm border border-amber-100/30">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="mt-1 text-gray-600">{project.url}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 border-t pt-4">
            <nav className="flex space-x-8">
              <Link
                to="/app/projects/$projectId"
                params={{ projectId }}
                className={`inline-flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                  isTestRunsActive
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:border-amber-200 hover:text-gray-700"
                }`}
              >
                <Play className="mr-2 h-4 w-4" />
                Test Runs
              </Link>
              <Link
                to="/app/projects/$projectId/learnings"
                params={{ projectId }}
                className={`inline-flex items-center border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                  !isTestRunsActive
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-gray-500 hover:border-amber-200 hover:text-gray-700"
                }`}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Learnings
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <Outlet />
    </div>
  );
}
