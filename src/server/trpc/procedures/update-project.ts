import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";

export const updateProject = baseProcedure
  .input(
    z.object({
      token: z.string(),
      projectId: z.string(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().nullable().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const { token, projectId, name, description } = input;

    // Verify the token and get user
    const user = await verifyToken(token);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Verify the project belongs to the user
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId: user.id,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Update the project
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return updatedProject;
  });
