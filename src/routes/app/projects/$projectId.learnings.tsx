import {
  createFileRoute,
  useParams,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  BookOpen,
  ExternalLink,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "~/stores/auth-store";
import toast from "react-hot-toast";

export const Route = createFileRoute("/app/projects/$projectId/learnings")({
  component: ProjectLearnings,
});

function ProjectLearnings() {
  const { projectId } = useParams({
    from: "/app/projects/$projectId/learnings",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"single" | "batch">("single");
  const [newUrl, setNewUrl] = useState("");
  const [batchUrls, setBatchUrls] = useState("");

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

  // Fetch learnings
  const {
    data: learnings = [],
    isLoading,
    refetch,
  } = useQuery(
    trpc.learnings.list.queryOptions(
      { token: token || "", projectId },
      {
        enabled: !!token,
        refetchInterval: 5000, // Poll every 5 seconds to check for status updates
      },
    ),
  );

  // Create learning mutation
  const createLearningMutation = useMutation(
    trpc.learnings.create.mutationOptions({
      onSuccess: () => {
        void refetch();
        setNewUrl("");
        setBatchUrls("");
      },
      onError: (error) => {
        console.error("Failed to add learning:", error);
        toast.error("Failed to add learning. Please try again.");
      },
    }),
  );

  // Delete learning mutation
  const deleteLearningMutation = useMutation(
    trpc.learnings.delete.mutationOptions({
      onSuccess: () => {
        void refetch();
      },
      onError: (error) => {
        console.error("Failed to delete learning:", error);
        toast.error("Failed to delete learning. Please try again.");
      },
    }),
  );

  const handleAddLearning = async () => {
    if (!project || !token) return;

    if (addMode === "single" && newUrl) {
      await createLearningMutation.mutateAsync({
        token,
        projectId,
        url: newUrl,
      });
      toast.success("Learning resource added successfully!");
      setShowAddModal(false);
    } else if (addMode === "batch" && batchUrls) {
      const urls = batchUrls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

      // Add all URLs sequentially
      let successCount = 0;
      let failCount = 0;
      for (const url of urls) {
        try {
          await createLearningMutation.mutateAsync({
            token,
            projectId,
            url,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to add URL ${url}:`, error);
          failCount++;
        }
      }
      if (successCount > 0) {
        toast.success(
          `Successfully added ${successCount} learning resource${successCount > 1 ? "s" : ""}`,
        );
      }
      if (failCount > 0) {
        toast.error(
          `Failed to add ${failCount} URL${failCount > 1 ? "s" : ""}`,
        );
      }
      setShowAddModal(false);
    }
  };

  const handleDeleteLearning = (learningId: string) => {
    if (!token) return;

    deleteLearningMutation.mutate({
      token,
      learningId,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "PROCESSING":
        return <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Processed";
      case "PROCESSING":
        return "Processing...";
      case "FAILED":
        return "Failed";
      case "PENDING":
        return "Pending";
      default:
        return status;
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Learnings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Resources and documentation for security best practices
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Resource
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && learnings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12">
          <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            No learning resources yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Add URLs to build your knowledge base
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add First Resource
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {learnings.map((learning) => (
            <div
              key={learning.id}
              className="rounded-lg border border-amber-100/20 bg-white p-4 shadow-sm transition-all hover:border-amber-100/40"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <a
                      href={learning.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {learning.url}
                    </a>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(learning.status)}
                      <span className="text-xs text-gray-500">
                        {getStatusText(learning.status)}
                      </span>
                    </div>
                  </div>

                  {learning.summary && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {learning.summary}
                    </p>
                  )}

                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      Added: {new Date(learning.createdAt).toLocaleDateString()}
                    </span>
                    {learning.processedAt && (
                      <span>
                        Processed:{" "}
                        {new Date(learning.processedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLearning(learning.id)}
                  className="ml-4 text-red-500 transition-colors hover:text-red-600"
                  disabled={deleteLearningMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Learning Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Add Learning Resource
            </h2>

            {/* Mode Selector */}
            <div className="mb-4 flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setAddMode("single")}
                className={`flex-1 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  addMode === "single"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Single URL
              </button>
              <button
                onClick={() => setAddMode("batch")}
                className={`flex-1 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  addMode === "batch"
                    ? "bg-white text-gray-900 shadow"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Batch Add
              </button>
            </div>

            {/* Input Fields */}
            {addMode === "single" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="https://example.com/security-guide"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URLs (one per line)
                </label>
                <textarea
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  placeholder="https://example.com/security-guide&#10;https://owasp.org/..."
                  rows={5}
                />
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={createLearningMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleAddLearning()}
                disabled={
                  createLearningMutation.isPending ||
                  (addMode === "single" ? !newUrl : !batchUrls)
                }
                className="flex-1 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {createLearningMutation.isPending ? (
                  <span className="inline-flex items-center">
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Adding...
                  </span>
                ) : (
                  "Add"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
