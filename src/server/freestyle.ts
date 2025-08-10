import { env } from "~/server/env";

export interface CreateVmResponse {
  id: string;
  short_id: string;
  guest_ip: string;
  host_ip: string;
  netns: string;
  ingress_ip: string;
  ingress_ipv6: string;
}

export interface CreateVmRequest {
  forkVmId?: string | null;
  idleTimeoutSeconds?: number | null;
  readySignalTimeoutSeconds?: number | null;
  waitForReadySignal?: boolean | null;
  workdir?: string | null;
}

/**
 * Create a new VM using the Freestyle API
 */
export async function createFreestyleVm(
  options: CreateVmRequest = {},
): Promise<CreateVmResponse> {
  const defaultOptions: CreateVmRequest = {
    idleTimeoutSeconds: 300, // 5 minutes default
    waitForReadySignal: false,
    workdir: "/",
    ...options,
  };

  const response = await fetch(`${env.FREESTYLE_API_URL}/vms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(defaultOptions),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create VM: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as CreateVmResponse;
  return data;
}

/**
 * Execute a command in a VM and wait for the result
 */
export async function execInVm(
  vmId: string,
  command: string,
): Promise<{ stdout: string; stderr: string; status_code: number | null }> {
  const response = await fetch(
    `${env.FREESTYLE_API_URL}/vms/${vmId}/exec-await`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to execute command in VM: ${response.status} - ${errorText}`,
    );
  }

  return response.json() as Promise<{
    stdout: string;
    stderr: string;
    status_code: number | null;
  }>;
}

/**
 * Write a file to a VM
 */
export async function writeFileToVm(
  vmId: string,
  filepath: string,
  content: string,
): Promise<void> {
  // Ensure filepath doesn't start with / for the URL
  const cleanPath = filepath.startsWith("/") ? filepath.slice(1) : filepath;

  const response = await fetch(
    `${env.FREESTYLE_API_URL}/vms/${vmId}/files/${cleanPath}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to write file to VM: ${response.status} - ${errorText}`,
    );
  }
}

/**
 * Read a file from a VM
 */
export async function readFileFromVm(
  vmId: string,
  filepath: string,
): Promise<string> {
  // Ensure filepath doesn't start with / for the URL
  const cleanPath = filepath.startsWith("/") ? filepath.slice(1) : filepath;

  const response = await fetch(
    `${env.FREESTYLE_API_URL}/vms/${vmId}/files/${cleanPath}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to read file from VM: ${response.status} - ${errorText}`,
    );
  }

  // The API returns the file content as JSON with a content field
  const data = (await response.json()) as { content: string };
  return data.content;
}

/**
 * List files in a directory in a VM
 */
export async function listFilesInVm(
  vmId: string,
  dirpath: string,
): Promise<Array<{ name: string; isDirectory: boolean; size?: number }>> {
  // Ensure dirpath doesn't start with / for the URL
  const cleanPath = dirpath.startsWith("/") ? dirpath.slice(1) : dirpath;

  // Add trailing slash to indicate directory listing
  const pathWithSlash = cleanPath.endsWith("/") ? cleanPath : `${cleanPath}/`;

  const response = await fetch(
    `${env.FREESTYLE_API_URL}/vms/${vmId}/files/${pathWithSlash}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to list files in VM: ${response.status} - ${errorText}`,
    );
  }

  interface FileInfo {
    name?: string;
    path?: string;
    type?: string;
    isDirectory?: boolean;
    size?: number;
  }

  const data = (await response.json()) as { files: Array<FileInfo> };

  // Transform the response to a simpler format
  return data.files.map((file) => ({
    name: file.name || file.path || "",
    isDirectory: file.type === "directory" || file.isDirectory || false,
    size: file.size,
  }));
}

/**
 * Get the console URL for a VM
 */
export function getVmConsoleUrl(vmId: string): string {
  return `https://${vmId}.vm.freestyle.sh/__console/`;
}
