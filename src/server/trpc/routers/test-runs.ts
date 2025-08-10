import { createTRPCRouter } from "~/server/trpc/main";
import { createTestRun } from "~/server/trpc/procedures/create-test-run";
import { getTestRuns } from "~/server/trpc/procedures/get-test-runs";
import { getTestRun } from "~/server/trpc/procedures/get-test-run";

export const testRunsRouter = createTRPCRouter({
  create: createTestRun,
  getMany: getTestRuns,
  getOne: getTestRun,
});

