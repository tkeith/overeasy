import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const createProject = baseProcedure
  .input(
    z.object({
      token: z.string(),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const { token, name, description } = input;

    // Verify the token and get user
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Create the project
    const project = await db.project.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });

    return project;
  });
