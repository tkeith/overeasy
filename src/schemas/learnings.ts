import { z } from "zod";

// Learning status enum
export const learningStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

// Learning schemas
export const learningSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  url: z.string(),
  summary: z.string().nullable(),
  content: z.string().nullable(),
  processedAt: z.date().nullable(),
  status: learningStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const learningWithProjectSchema = learningSchema.extend({
  project: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    userId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

export const createLearningSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export type LearningStatus = z.infer<typeof learningStatusSchema>;
export type Learning = z.infer<typeof learningSchema>;
export type LearningWithProject = z.infer<typeof learningWithProjectSchema>;
export type CreateLearningInput = z.infer<typeof createLearningSchema>;
