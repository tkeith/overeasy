import { z } from "zod";
import { baseProcedure } from "~/server/trpc/main";
import { verifyToken } from "~/server/auth";
import { db } from "~/server/db";
import { extractLearningsFromUrl } from "~/server/ai/agents/learning-extractor";

export const createLearning = baseProcedure
  .input(
    z.object({
      token: z.string(),
      projectId: z.string(),
      url: z.string().url(),
    }),
  )
  .mutation(async ({ input }) => {
    const { token, projectId, url } = input;

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

    // Create the learning record
    const learning = await db.learning.create({
      data: {
        projectId,
        url,
        status: "PENDING",
      },
    });

    // Process the learning in the background using an immediately invoked async function
    void (async () => {
      try {
        await extractLearningsFromUrl(url, learning.id);
      } catch (error) {
        console.error(`Failed to process learning ${learning.id}:`, error);
      }
    })();

    return learning;
  });
