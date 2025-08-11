import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoadingScreen } from "~/components/loading-screen";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Show loading screen for 3 seconds then redirect to app
    const timer = setTimeout(() => {
      void navigate({ to: "/app" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Always show loading screen for all users
  return <LoadingScreen message="Preparing your dashboard..." />;
}
