import {
  createFileRoute,
  useParams,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Save, Trash2 } from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/auth-store";
import toast from "react-hot-toast";

export const Route = createFileRoute("/app/projects/$projectId/settings")({
  component: ProjectSettings,
});

function ProjectSettings() {
  const { projectId } = useParams({
    from: "/app/projects/$projectId/settings",
  });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [context, setContext] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Fetch project details
  const { data: project } = useQuery(
    trpc.projects.get.queryOptions(
      { token: token || "", projectId },
      { enabled: !!token },
    ),
  );

  // Set initial form values when project loads
  useEffect(() => {
    if (project) {
      setName(project.name);
      setUrl(project.url);
      setContext(project.context || "");
    }
  }, [project]);

  // Update project mutation
  const updateProjectMutation = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["projects"] });
        toast.success("Project updated successfully!");
      },
      onError: (error) => {
        console.error("Failed to update project:", error);
        toast.error("Failed to update project. Please try again.");
      },
    }),
  );

  // Delete project mutation
  const deleteProjectMutation = useMutation(
    trpc.projects.delete.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["projects"] });
        toast.success("Project deleted successfully");
        void navigate({ to: "/app" });
      },
      onError: (error) => {
        console.error("Failed to delete project:", error);
        toast.error("Failed to delete project. Please try again.");
      },
    }),
  );

  const handleSave = () => {
    if (!token || !project) return;

    updateProjectMutation.mutate({
      token,
      projectId,
      name: name || undefined,
      url: url || undefined,
      context: context || null,
    });
  };

  const handleDelete = () => {
    if (!token) return;

    deleteProjectMutation.mutate({
      token,
      projectId,
    });
  };

  if (!token || !project) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Project Settings
        </h2>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              General Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  App URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Context
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Optional information like login credentials, API keys, or other details needed for testing
                </p>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={6}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Example:\nUsername: testuser\nPassword: testpass123\n\nNotes:\n- The app requires specific headers...\n- Test data is available at..."
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={updateProjectMutation.isPending || !name || !url}
                className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {updateProjectMutation.isPending ? (
                  <span className="inline-flex items-center">
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h3 className="mb-4 text-lg font-medium text-red-900">
              Danger Zone
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Delete this project</p>
                <p className="mt-1 text-xs text-red-600">
                  This action cannot be undone. All learnings will be
                  permanently deleted.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Delete Project?
              </h2>
              <p className="mb-6 text-sm text-gray-600">
                Are you sure you want to delete "{project.name}"? This action
                cannot be undone and all learnings will be permanently deleted.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={deleteProjectMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteProjectMutation.isPending}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteProjectMutation.isPending ? (
                    <span className="inline-flex items-center">
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Deleting...
                    </span>
                  ) : (
                    "Delete Project"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
