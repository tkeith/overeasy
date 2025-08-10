import { createTRPCRouter } from "~/server/trpc/main";
import { getAgentExecution } from "~/server/trpc/procedures/get-agent-execution";
import { getAgentExecutions } from "~/server/trpc/procedures/get-agent-executions";

export const agentsRouter = createTRPCRouter({
  getExecution: getAgentExecution,
  listExecutions: getAgentExecutions,
});
