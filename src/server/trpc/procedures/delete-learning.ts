import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const deleteLearning = baseProcedure
  .input(
    z.object({
      token: z.string(),
      learningId: z.string(),
    }),
  )
  .mutation(async ({ input }) => {
    const { token, learningId } = input;

    // Verify the token and get user
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify the learning belongs to a project owned by the user
    const learning = await db.learning.findFirst({
      where: {
        id: learningId,
        project: {
          userId: user.id,
        },
      },
    });

    if (!learning) {
      throw new Error("Learning not found");
    }

    // Delete the learning
    await db.learning.delete({
      where: { id: learningId },
    });

    return { success: true };
  });
