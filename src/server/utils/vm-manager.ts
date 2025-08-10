import { db } from "~/server/db";
import { createFreestyleVm, execInVm } from "~/server/freestyle";
import type { User } from "@prisma/client";

/**
 * Get or create a VM for a user
 *
 * @param userId - The user ID to get or create a VM for
 * @returns The VM ID
 */
export async function getOrCreateUserVm(userId: string): Promise<string> {
  // Check if user already has a VM
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { vmId: true },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // If user already has a VM, return it
  if (user.vmId) {
    console.log(`[VM Manager] User ${userId} already has VM: ${user.vmId}`);
    return user.vmId;
  }

  // Create a new VM for the user
  console.log(`[VM Manager] Creating new VM for user ${userId}...`);
  const vm = await createFreestyleVm({
    idleTimeoutSeconds: 600, // 10 minutes for test runs
    waitForReadySignal: false,
    workdir: "/app",
  });

  console.log(`[VM Manager] Created VM ${vm.id} for user ${userId}`);

  // Update user with VM ID
  await db.user.update({
    where: { id: userId },
    data: { vmId: vm.id },
  });

  // Initialize the VM with basic setup
  await initializeTestingVm(vm.id);

  return vm.id;
}

/**
 * Initialize a VM for testing purposes
 * Sets up the basic environment and installs necessary tools
 *
 * @param vmId - The VM ID to initialize
 */
async function initializeTestingVm(vmId: string): Promise<void> {
  console.log(`[VM Manager] Initializing VM ${vmId} for testing...`);

  try {
    // Create app directory
    await execInVm(vmId, "mkdir -p /app");

    // Install basic tools
    // Note: This is a minimal setup, you can add more tools as needed
    const setupCommands = [
      "apt-get update",
      "apt-get install -y curl wget git",
      "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -",
      "apt-get install -y nodejs",
      "npm install -g npm@latest",
      // Install Playwright dependencies
      "npm install -g playwright",
      "npx playwright install-deps chromium",
    ];

    for (const command of setupCommands) {
      console.log(`[VM Manager] Running: ${command}`);
      const result = await execInVm(vmId, command);
      if (result.status_code !== 0 && result.status_code !== null) {
        console.warn(
          `[VM Manager] Command failed with exit code ${result.status_code}: ${command}`,
        );
        console.warn(`[VM Manager] Stderr: ${result.stderr}`);
      }
    }

    console.log(`[VM Manager] VM ${vmId} initialized successfully`);
  } catch (error) {
    console.error(`[VM Manager] Failed to initialize VM ${vmId}:`, error);
    throw new Error(
      `Failed to initialize VM: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Clean up a user's VM (optional utility)
 * This doesn't delete the VM but resets it to a clean state
 *
 * @param vmId - The VM ID to clean up
 */
export async function cleanupVm(vmId: string): Promise<void> {
  console.log(`[VM Manager] Cleaning up VM ${vmId}...`);

  try {
    // Clean up the app directory
    await execInVm(vmId, "rm -rf /app/*");
    await execInVm(vmId, "rm -rf /app/.*");

    console.log(`[VM Manager] VM ${vmId} cleaned up successfully`);
  } catch (error) {
    console.error(`[VM Manager] Failed to clean up VM ${vmId}:`, error);
    throw new Error(
      `Failed to clean up VM: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Check if a VM is healthy and responsive
 *
 * @param vmId - The VM ID to check
 * @returns True if the VM is healthy, false otherwise
 */
export async function isVmHealthy(vmId: string): Promise<boolean> {
  try {
    const result = await execInVm(vmId, "echo 'health check'");
    return result.status_code === 0 || result.status_code === null;
  } catch (error) {
    console.error(`[VM Manager] VM ${vmId} health check failed:`, error);
    return false;
  }
}
