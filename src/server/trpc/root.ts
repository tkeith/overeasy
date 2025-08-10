import { createCallerFactory, createTRPCRouter } from "~/server/trpc/main";
import { authRouter } from "~/server/trpc/routers/auth";
import { projectsRouter } from "~/server/trpc/routers/projects";
import { learningsRouter } from "~/server/trpc/routers/learnings";
import { agentsRouter } from "~/server/trpc/routers/agents";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  projects: projectsRouter,
  learnings: learningsRouter,
  agents: agentsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
