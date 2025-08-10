import { z } from "zod";
import { tool } from "ai";
import {
  readFileFromVm,
  writeFileToVm,
  execInVm,
  listFilesInVm,
} from "~/server/freestyle";

/**
 * Creates a set of VM tools for AI agents to interact with the virtual machine.
 *
 * @param vmId - The VM ID to interact with
 */
export function createVmTools(vmId: string) {
  return {
    read_file: tool({
      description:
        "Read the contents of a file from the VM. All paths must be absolute.",
      parameters: z.object({
        path: z
          .string()
          .describe(
            "The absolute path to the file to read (must start with /)",
          ),
      }),
      execute: async ({ path }) => {
        try {
          // Read the file from the VM
          const content = await readFileFromVm(vmId, path);

          const result = {
            path,
            content,
            success: true,
          };

          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          const result = {
            path,
            success: false,
            error: errorMessage,
          };

          return result;
        }
      },
    }),

    write_file: tool({
      description:
        "Write or update a file in the VM. All paths must be absolute.",
      parameters: z.object({
        path: z
          .string()
          .describe(
            "The absolute path to the file to write (must start with /)",
          ),
        content: z
          .string()
          .describe("The complete content to write to the file"),
      }),
      execute: async ({ path, content }) => {
        try {
          // Write the file to the VM
          await writeFileToVm(vmId, path, content);

          const result = {
            path,
            success: true,
          };

          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          const result = {
            path,
            success: false,
            error: errorMessage,
          };

          return result;
        }
      },
    }),

    list_files: tool({
      description: "List all files in a directory. All paths must be absolute.",
      parameters: z.object({
        path: z
          .string()
          .default("/app")
          .describe("The absolute path to list files from (must start with /)"),
      }),
      execute: async ({ path = "/app" }) => {
        try {
          // List files from the VM
          const files = await listFilesInVm(vmId, path);

          const result = {
            path,
            files,
            success: true,
          };

          return result;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          const result = {
            path,
            files: [],
            success: false,
            error: errorMessage,
          };

          return result;
        }
      },
    }),

    run_command: tool({
      description:
        "Execute a shell command in the VM. Commands run from the /app directory by default.",
      parameters: z.object({
        command: z.string().describe("The shell command to execute"),
        workingDirectory: z
          .string()
          .optional()
          .describe("Optional working directory (defaults to /app)"),
      }),
      execute: async ({ command, workingDirectory = "/app" }) => {
        try {
          // If a working directory is specified, cd to it first
          const fullCommand =
            workingDirectory !== "/app"
              ? `cd ${workingDirectory} && ${command}`
              : command;

          // Execute the command in the VM
          const result = await execInVm(vmId, fullCommand);

          const commandResult = {
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.status_code ?? 0,
            success: result.status_code === 0 || result.status_code === null,
          };

          return commandResult;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          const result = {
            stdout: "",
            stderr: errorMessage,
            exitCode: -1,
            success: false,
            error: errorMessage,
          };

          return result;
        }
      },
    }),
  };
}
