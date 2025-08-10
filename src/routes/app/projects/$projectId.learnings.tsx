import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  sampleLearnings,
  sampleProjects,
  simulateAddLearning,
} from "~/data/placeholder-data";
import { Plus, BookOpen, ExternalLink, Trash2 } from "lucide-react";

export const Route = createFileRoute("/app/projects/$projectId/learnings")({
  component: ProjectLearnings,
});

function ProjectLearnings() {
  const { projectId } = useParams({
    from: "/app/projects/$projectId/learnings",
  });
  const project = sampleProjects.find((p) => p.id === projectId);
  const projectLearnings = sampleLearnings.filter(
    (l) => l.projectId === projectId,
  );
  const [learnings, setLearnings] = useState(projectLearnings);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<"single" | "batch">("single");
  const [newUrl, setNewUrl] = useState("");
  const [batchUrls, setBatchUrls] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLearning = async () => {
    if (!project) return;

    setIsAdding(true);

    if (addMode === "single" && newUrl) {
      const learning = await simulateAddLearning({
        url: newUrl,
        projectId: project.id,
      });
      setLearnings([learning, ...learnings]);
      setNewUrl("");
    } else if (addMode === "batch" && batchUrls) {
      const urls = batchUrls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);
      const newLearnings = await Promise.all(
        urls.map((url) =>
          simulateAddLearning({
            url,
            projectId: project.id,
          }),
        ),
      );
      setLearnings([...newLearnings, ...learnings]);
      setBatchUrls("");
    }

    setShowAddModal(false);
    setIsAdding(false);
  };

  const handleDeleteLearning = (id: string) => {
    setLearnings(learnings.filter((l) => l.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Learning Resources
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Security resources and documentation for this project
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </button>
      </div>

      {/* Learnings List */}
      {learnings.length === 0 ? (
        <div className="rounded-lg border border-amber-100/30 bg-white p-8 text-center shadow-sm">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No learning resources yet
          </h3>
          <p className="mb-4 text-gray-500">
            Add security resources and documentation for this project
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-200"
          >
            <Plus className="mr-2 h-4 w-4" />
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
                  <a
                    href={learning.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {learning.url}
                  </a>
                  <p className="mt-2 text-sm text-gray-600">
                    {learning.summary}
                  </p>
                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      Status:{" "}
                      <span
                        className={
                          learning.status === "processed"
                            ? "text-green-600"
                            : learning.status === "processing"
                              ? "text-amber-600"
                              : "text-red-600"
                        }
                      >
                        {learning.status}
                      </span>
                    </span>
                    <span>
                      Added: {new Date(learning.addedAt).toLocaleDateString()}
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
                  className="ml-4 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Add Learning Resource
            </h2>

            {/* Mode Selector */}
            <div className="mb-4 flex space-x-2">
              <button
                onClick={() => setAddMode("single")}
                className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
                  addMode === "single"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Single URL
              </button>
              <button
                onClick={() => setAddMode("batch")}
                className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
                  addMode === "batch"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Batch Import
              </button>
            </div>

            {addMode === "single" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="https://example.com/security-guide"
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  URLs (one per line)
                </label>
                <textarea
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  rows={8}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="https://example.com/security-guide&#10;https://owasp.org/..."
                />
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleAddLearning()}
                disabled={
                  isAdding ||
                  (addMode === "single" && !newUrl) ||
                  (addMode === "batch" && !batchUrls)
                }
                className="rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {isAdding ? "Adding..." : "Add Resource"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
