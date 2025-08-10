import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const getAgentExecutions = baseProcedure
  .input(
    z.object({
      token: z.string(),
      agentName: z.string().optional(),
      status: z.enum(["RUNNING", "SUCCEEDED", "FAILED"]).optional(),
      limit: z.number().min(1).max(100).default(20),
    }),
  )
  .query(async ({ input }) => {
    const { token, agentName, status, limit } = input;

    // Verify the token and get user
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Build filter conditions
    const where: {
      agentName?: string;
      status?: "RUNNING" | "SUCCEEDED" | "FAILED";
    } = {};

    if (agentName) {
      where.agentName = agentName;
    }

    if (status) {
      where.status = status;
    }

    // Fetch agent executions
    const executions = await db.agentExecution.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        _count: {
          select: { blocks: true },
        },
      },
    });

    return executions;
  });
