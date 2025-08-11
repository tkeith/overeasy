import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const deleteTestRun = baseProcedure
  .input(
    z.object({
      token: z.string(),
      testRunId: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { token, testRunId } = input;

    // Verify the token and get user
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify the test run belongs to a project owned by the user
    const testRun = await db.testRun.findFirst({
      where: {
        id: testRunId,
        project: {
          userId: user.id,
        },
      },
    });

    if (!testRun) {
      throw new Error("Test run not found");
    }

    // Delete the test run (vulnerabilities will be cascade deleted)
    await db.testRun.delete({
      where: { id: testRunId },
    });

    return { success: true };
  });
