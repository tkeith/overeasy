import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TRPCReactProvider } from "~/trpc/react";
import { GoogleAuthProvider } from "~/components/google-auth-provider";
import { Toaster } from "react-hot-toast";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-50">
        <div className="flex flex-col items-center">
          <img
            src="https://ewnjlwwtpuzcbskypoue.supabase.co/storage/v1/object/public/assets/eggy-fighting.gif"
            alt="Loading"
            className="h-32 w-32"
          />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <TRPCReactProvider>
      <GoogleAuthProvider>
        <Outlet />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
            },
            success: {
              style: {
                background: "#10b981",
              },
            },
            error: {
              style: {
                background: "#ef4444",
              },
            },
          }}
        />
      </GoogleAuthProvider>
    </TRPCReactProvider>
  );
}
