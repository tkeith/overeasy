import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  sampleProjects,
  simulateCreateProject,
  simulateDeleteProject,
} from "~/data/placeholder-data";
import { Plus, Trash2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: ProjectsOverview,
});

function ProjectsOverview() {
  const [projects, setProjects] = useState(sampleProjects);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newProjectName || !newProjectUrl) return;

    setIsCreating(true);
    const newProject = await simulateCreateProject({
      name: newProjectName,
      url: newProjectUrl,
    });
    setProjects([...projects, newProject]);
    setNewProjectName("");
    setNewProjectUrl("");

    setShowCreateModal(false);
    setIsCreating(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(projectId);
    await simulateDeleteProject(projectId);
    setProjects(projects.filter((p) => p.id !== projectId));
    setIsDeleting(null);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="mt-2 text-gray-600">
          Manage your security testing projects
        </p>
      </div>

      {/* Create Project Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg bg-white shadow transition-all hover:shadow-lg hover:shadow-amber-100/50 border border-amber-100/20"
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{project.url}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/app/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  View Project
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
                <button
                  onClick={() => {
                    void handleDeleteProject(project.id);
                  }}
                  disabled={isDeleting === project.id}
                  className="text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                >
                  {isDeleting === project.id ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="My Web App"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target URL
                </label>
                <input
                  type="url"
                  value={newProjectUrl}
                  onChange={(e) => setNewProjectUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void handleCreateProject();
                }}
                disabled={!newProjectName || !newProjectUrl || isCreating}
                className="rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
