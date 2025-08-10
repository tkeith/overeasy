import { createFileRoute, Link } from "@tanstack/react-router";
import { useIsAuthenticated } from "~/stores/auth-store";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to Overeasy
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-600 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Your sunny-side up approach to cybersecurity testing
          </p>
          <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-amber-500 px-8 py-3 text-base font-medium text-white shadow-lg shadow-amber-200/50 transition-all hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-200/50 md:px-10 md:py-4 md:text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-amber-500 px-8 py-3 text-base font-medium text-white shadow-lg shadow-amber-200/50 transition-all hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-200/50 md:px-10 md:py-4 md:text-lg"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
