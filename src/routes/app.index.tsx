import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "~/stores/auth-store";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Header } from "~/components/header";

export const Route = createFileRoute("/app/")({
  component: AppDashboard,
});

function AppDashboard() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const token = useAuthStore((state) => state.token);

  const userQuery = useQuery(
    trpc.auth.getUser.queryOptions(
      { token: token || "" },
      { enabled: !!token },
    ),
  );

  const { data: user } = userQuery;

  useEffect(() => {
    if (!token) {
      void navigate({ to: "/login" });
    }
  }, [token, navigate]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content Area - Currently blank */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome to Your App
          </h2>
          <p className="mt-2 text-gray-600">
            This is a blank dashboard. Start building your application here.
          </p>
        </div>
      </main>
    </div>
  );
}
