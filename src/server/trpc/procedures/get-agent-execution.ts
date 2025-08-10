import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const getAgentExecution = baseProcedure
  .input(
    z.object({
      token: z.string(),
      executionId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { token, executionId } = input;

    // Verify the token and get user
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Fetch the agent execution with blocks
    const execution = await db.agentExecution.findUnique({
      where: { id: executionId },
      include: {
        blocks: {
          orderBy: { sequence: "asc" },
        },
      },
    });

    if (!execution) {
      throw new Error("Agent execution not found");
    }

    // Optionally verify user has access to this execution
    // For now, we'll allow any authenticated user to view any execution
    // In the future, you might want to check if the user owns the related entity

    return execution;
  });
