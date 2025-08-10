import { createTRPCRouter } from "~/server/trpc/main";
import { createLearning } from "~/server/trpc/procedures/create-learning";
import { getLearnings } from "~/server/trpc/procedures/get-learnings";
import { getLearning } from "~/server/trpc/procedures/get-learning";
import { deleteLearning } from "~/server/trpc/procedures/delete-learning";

export const learningsRouter = createTRPCRouter({
  create: createLearning,
  list: getLearnings,
  get: getLearning,
  delete: deleteLearning,
});
