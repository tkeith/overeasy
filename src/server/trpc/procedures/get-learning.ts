import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const getLearning = baseProcedure
  .input(
    z.object({
      token: z.string(),
      learningId: z.string(),
    }),
  )
  .query(async ({ input }) => {
    const { token, learningId } = input;

    // Verify the token and get user
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Get the learning with project info to verify ownership
    const learning = await db.learning.findFirst({
      where: {
        id: learningId,
        project: {
          userId: user.id,
        },
      },
      include: {
        project: true,
      },
    });

    if (!learning) {
      throw new Error("Learning not found");
    }

    return learning;
  });
