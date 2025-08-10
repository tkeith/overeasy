import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app/projects/$projectId/")({
  component: ProjectIndex,
});

function ProjectIndex() {
  const navigate = useNavigate();
  const { projectId } = Route.useParams();

  // Redirect to test-runs page immediately
  useEffect(() => {
    void navigate({
      to: "/app/projects/$projectId/test-runs",
      params: { projectId },
      replace: true,
    });
  }, [navigate, projectId]);

  // Show loading while redirecting
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
    </div>
  );
}
