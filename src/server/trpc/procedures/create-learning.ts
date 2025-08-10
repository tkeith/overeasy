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
    console.log(`[Create Learning] Creating learning record for URL: ${url}`);
    const learning = await db.learning.create({
      data: {
        projectId,
        url,
        status: "PENDING",
      },
    });
    console.log(`[Create Learning] Learning created with ID: ${learning.id}`);

    // Process the learning in the background using an immediately invoked async function
    console.log(`[Create Learning] Kicking off background extraction task...`);
    void (async () => {
      try {
        console.log(
          `[Create Learning] Background task started for learning ${learning.id}`,
        );
        await extractLearningsFromUrl(url, learning.id);
        console.log(
          `[Create Learning] Background task completed for learning ${learning.id}`,
        );
      } catch (error) {
        console.error(
          `[Create Learning] Background task failed for learning ${learning.id}:`,
          error,
        );
      }
    })();
    console.log(
      `[Create Learning] Background task kicked off, returning learning to client`,
    );

    return learning;
  });
