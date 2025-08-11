import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, ArrowRight, Folder, ExternalLink } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/auth-store";
import toast from "react-hot-toast";

export const Route = createFileRoute("/app/")({
  component: ProjectsOverview,
});

function ProjectsOverview() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!token) {
      void navigate({ to: "/login" });
    }
  }, [token, navigate]);

  // Fetch projects
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery(
    trpc.projects.list.queryOptions(
      { token: token || "" },
      { enabled: !!token },
    ),
  );

  // Create project mutation
  const createProjectMutation = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: ["projects"] });
        setShowCreateModal(false);
        setNewProjectName("");
        setNewProjectUrl("");
        // Navigate to the newly created project
        void navigate({
          to: "/app/projects/$projectId",
          params: { projectId: data.id },
        });
      },
      onError: (error) => {
        console.error("Failed to create project:", error);
        toast.error("Failed to create project. Please try again.");
      },
    }),
  );

  const handleCreateProject = () => {
    if (!newProjectName || !newProjectUrl || !token) return;

    createProjectMutation.mutate({
      token,
      name: newProjectName,
      url: newProjectUrl,
    });
  };

  if (!token) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">
            Manage your security testing projects and learnings
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Failed to load projects. Please try again.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <Folder className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first project
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Project
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg border border-amber-100/20 bg-white shadow transition-all hover:shadow-lg hover:shadow-amber-100/50"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <p className="line-clamp-1 text-sm text-gray-500">
                        {project.url}
                      </p>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center text-amber-500 transition-colors hover:text-amber-600"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                      {project._count?.learnings || 0} learnings
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link
                    to="/app/projects/$projectId"
                    params={{ projectId: project.id }}
                    className="inline-flex items-center text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
                  >
                    View Project
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Create New Project
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="My Web App"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  App URL
                </label>
                <input
                  type="url"
                  value={newProjectUrl}
                  onChange={(e) => setNewProjectUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={createProjectMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={
                  !newProjectName ||
                  !newProjectUrl ||
                  createProjectMutation.isPending
                }
                className="flex-1 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {createProjectMutation.isPending ? (
                  <span className="inline-flex items-center">
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </span>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
