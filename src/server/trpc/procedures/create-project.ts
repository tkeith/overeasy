import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const createProject = baseProcedure
  .input(
    z.object({
      token: z.string(),
      name: z.string().min(1).max(255),
      url: z.string().url(),
    }),
  )
  .mutation(async ({ input }) => {
    const { token, name, url } = input;

    // Verify the token and get user
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Create the project
    const project = await db.project.create({
      data: {
        name,
        url,
        userId: user.id,
      },
    });

    return project;
  });
