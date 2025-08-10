import { createTRPCRouter } from "~/server/trpc/main";
import { createProject } from "~/server/trpc/procedures/create-project";
import { getProjects } from "~/server/trpc/procedures/get-projects";
import { getProject } from "~/server/trpc/procedures/get-project";
import { updateProject } from "~/server/trpc/procedures/update-project";
import { deleteProject } from "~/server/trpc/procedures/delete-project";

export const projectsRouter = createTRPCRouter({
  create: createProject,
  list: getProjects,
  get: getProject,
  update: updateProject,
  delete: deleteProject,
});
