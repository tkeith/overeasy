import { createCallerFactory, createTRPCRouter } from "~/server/trpc/main";
import { authRouter } from "~/server/trpc/routers/auth";
import { projectsRouter } from "~/server/trpc/routers/projects";
import { learningsRouter } from "~/server/trpc/routers/learnings";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  projects: projectsRouter,
  learnings: learningsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
