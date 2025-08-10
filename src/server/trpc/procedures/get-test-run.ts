import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const getTestRun = baseProcedure
  .input(
    z.object({
      token: z.string(),
      testRunId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    console.log("[getTestRun] Fetching test run details");

    // Verify the token and get the user
    const user = await verifyToken(input.token);
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    // Get the test run with full details
    const testRun = await db.testRun.findFirst({
      where: {
        id: input.testRunId,
        userId: user.id, // Ensure the test run belongs to the user
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
        vulnerabilities: {
          orderBy: [
            // Order by severity (critical first)
            {
              severity: "desc",
            },
            {
              createdAt: "asc",
            },
          ],
        },
        agentExecution: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!testRun) {
      throw new Error("Test run not found or unauthorized");
    }

    // Calculate summary statistics
    const stats = {
      totalVulnerabilities: testRun.vulnerabilities.length,
      bySeverity: {
        critical: testRun.vulnerabilities.filter(
          (v) => v.severity === "CRITICAL",
        ).length,
        high: testRun.vulnerabilities.filter((v) => v.severity === "HIGH")
          .length,
        medium: testRun.vulnerabilities.filter((v) => v.severity === "MEDIUM")
          .length,
        low: testRun.vulnerabilities.filter((v) => v.severity === "LOW").length,
      },
      byCategory: testRun.vulnerabilities.reduce(
        (acc, vuln) => {
          const category = vuln.category || "Uncategorized";
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };

    return {
      ...testRun,
      stats,
    };
  });
