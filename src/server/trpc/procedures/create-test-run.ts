import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";
import { TestingAgent } from "~/server/ai/agents/testing-agent";

export const createTestRun = baseProcedure
  .input(
    z.object({
      token: z.string(),
      projectId: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    console.log("[createTestRun] Starting test run creation");

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

    // Check if there's already a running test for this project
    const runningTest = await db.testRun.findFirst({
      where: {
        projectId: input.projectId,
        status: "RUNNING",
      },
    });

    if (runningTest) {
      throw new Error("A test is already running for this project");
    }

    // Create the test run
    const testRun = await db.testRun.create({
      data: {
        projectId: input.projectId,
        userId: user.id,
        status: "PENDING",
      },
    });

    console.log(
      `[createTestRun] Created test run ${testRun.id} for project ${input.projectId}`,
    );

    // Execute the test run asynchronously
    // We don't await this so the API can return immediately
    void (async () => {
      try {
        console.log(
          `[createTestRun] Starting async execution of test run ${testRun.id}`,
        );

        const agent = new TestingAgent({
          testRunId: testRun.id,
          projectId: input.projectId,
          userId: user.id,
          targetUrl: project.url,
        });

        await agent.execute();

        console.log(
          `[createTestRun] Test run ${testRun.id} completed successfully`,
        );
      } catch (error) {
        console.error(
          `[createTestRun] Error executing test run ${testRun.id}:`,
          error,
        );

        // Mark the test run as failed if it wasn't already updated
        await db.testRun
          .update({
            where: { id: testRun.id },
            data: {
              status: "FAILED",
              completedAt: new Date(),
            },
          })
          .catch((err) => {
            console.error(
              `[createTestRun] Failed to update test run status:`,
              err,
            );
          });
      }
    })();

    return {
      testRunId: testRun.id,
      status: testRun.status,
    };
  });
