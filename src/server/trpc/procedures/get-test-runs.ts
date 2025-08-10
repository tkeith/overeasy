import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const getTestRuns = baseProcedure
  .input(
    z.object({
      token: z.string(),
      projectId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    console.log("[getTestRuns] Fetching test runs for project");

    // Verify the token and get the user
    const user = await verifyToken(input.token);
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    // Verify the project belongs to the user
    const project = await db.project.findFirst({
      where: {
        id: input.projectId,
        userId: user.id,
      },
    });

    if (!project) {
      throw new Error("Project not found or unauthorized");
    }

    // Get test runs for the project
    const testRuns = await db.testRun.findMany({
      where: {
        projectId: input.projectId,
      },
      include: {
        vulnerabilities: {
          select: {
            id: true,
            severity: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include summary statistics
    const testRunsWithStats = testRuns.map((testRun) => {
      const vulnerabilityCounts = {
        total: testRun.vulnerabilities.length,
        critical: testRun.vulnerabilities.filter(
          (v) => v.severity === "CRITICAL",
        ).length,
        high: testRun.vulnerabilities.filter((v) => v.severity === "HIGH")
          .length,
        medium: testRun.vulnerabilities.filter((v) => v.severity === "MEDIUM")
          .length,
        low: testRun.vulnerabilities.filter((v) => v.severity === "LOW").length,
      };

      return {
        id: testRun.id,
        status: testRun.status,
        startedAt: testRun.startedAt,
        completedAt: testRun.completedAt,
        createdAt: testRun.createdAt,
        agentExecutionId: testRun.agentExecutionId,
        vulnerabilityCounts,
      };
    });

    return testRunsWithStats;
  });
