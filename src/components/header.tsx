import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "~/stores/auth-store";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import { AppBrand } from "~/components/app-brand";

export function Header() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const token = useAuthStore((state) => state.token);
  const clearToken = useAuthStore((state) => state.clearToken);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userQuery = useQuery(
    trpc.auth.getUser.queryOptions(
      { token: token || "" },
      { enabled: !!token },
    ),
  );

  const { data: user } = userQuery;

  const handleLogout = () => {
    clearToken();
    void navigate({ to: "/" });
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl">
              <AppBrand className="text-2xl" />
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || "Profile"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    ></div>
                    <div className="absolute right-0 top-12 z-20 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || "User"}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>

                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                          Account ID
                        </p>
                        <p className="font-mono text-xs text-gray-700">
                          {user.id}
                        </p>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Sign out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
