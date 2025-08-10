import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GoogleLogin } from "@react-oauth/google";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore, useIsAuthenticated } from "~/stores/auth-store";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppBrand } from "~/components/app-brand";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const setToken = useAuthStore((state) => state.setToken);
  const isAuthenticated = useIsAuthenticated();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated, redirect to app
    if (isAuthenticated) {
      void navigate({ to: "/app" });
    }
  }, [isAuthenticated, navigate]);

  const loginMutation = useMutation(
    trpc.auth.googleLogin.mutationOptions({
      onSuccess: (data) => {
        setToken(data.token);
        void navigate({ to: "/app" });
      },
      onError: (error) => {
        console.error("Login error:", error);
        setError("Failed to sign in. Please try again.");
      },
    }),
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-amber-100/30 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mb-4">
              <AppBrand className="text-4xl" />
            </div>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  loginMutation.mutate({
                    credential: credentialResponse.credential,
                  });
                }
              }}
              onError={() => {
                setError("Google login failed. Please try again.");
              }}
              size="large"
              theme="outline"
              text="continue_with"
              shape="rectangular"
              width="300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
