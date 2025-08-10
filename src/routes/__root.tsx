import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TRPCReactProvider } from "~/trpc/react";
import { GoogleAuthProvider } from "~/components/google-auth-provider";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  if (isFetching) {
    return <div>Loading...</div>;
  }

  return (
    <TRPCReactProvider>
      <GoogleAuthProvider>
        <Outlet />
      </GoogleAuthProvider>
    </TRPCReactProvider>
  );
}
