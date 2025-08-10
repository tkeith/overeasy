import { z } from "zod";

// Project schemas
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const projectWithCountSchema = projectSchema.extend({
  _count: z.object({
    learnings: z.number(),
  }),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;
export type ProjectWithCount = z.infer<typeof projectWithCountSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
