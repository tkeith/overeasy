// Placeholder data for frontend development
// This will be replaced with real backend data later

export type TestRunStatus = "queued" | "running" | "completed" | "failed";
export type LearningStatus = "processing" | "processed" | "failed";

export interface Vulnerability {
  id: string;
  testRunId: string;
  detail: string;
  foundAt: Date;
}

export interface TestRun {
  id: string;
  projectId: string;
  status: TestRunStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // in milliseconds
}

export interface Learning {
  id: string;
  projectId?: string; // Optional, can be global
  url: string;
  summary: string;
  content?: string;
  status: LearningStatus;
  addedAt: Date;
  processedAt?: Date;
  metadata?: {
    author?: string;
    publishedDate?: string;
    tags?: string[];
  };
}

export interface Project {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
}

// Sample Data
export const sampleProjects: Project[] = [
  {
    id: "proj-1",
    name: "E-Commerce Platform",
    url: "https://shop.example.com",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "proj-2",
    name: "Banking Dashboard",
    url: "https://bank.example.com",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "proj-3",
    name: "Healthcare Portal",
    url: "https://health.example.com",
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "proj-4",
    name: "Social Media App",
    url: "https://social.example.com",
    createdAt: new Date("2024-03-01"),
  },
];

export const sampleTestRuns: TestRun[] = [
  // E-Commerce Platform test runs
  {
    id: "run-1",
    projectId: "proj-1",
    status: "completed",
    startedAt: new Date("2024-03-20T10:30:00"),
    completedAt: new Date("2024-03-20T10:45:00"),
    duration: 900000, // 15 minutes
  },
  {
    id: "run-2",
    projectId: "proj-1",
    status: "running",
    startedAt: new Date("2024-03-21T11:00:00"),
  },
  {
    id: "run-3",
    projectId: "proj-1",
    status: "completed",
    startedAt: new Date("2024-03-19T15:20:00"),
    completedAt: new Date("2024-03-19T15:35:00"),
    duration: 900000, // 15 minutes
  },
  // Banking Dashboard test runs
  {
    id: "run-4",
    projectId: "proj-2",
    status: "completed",
    startedAt: new Date("2024-03-19T14:15:00"),
    completedAt: new Date("2024-03-19T14:28:00"),
    duration: 780000, // 13 minutes
  },
  {
    id: "run-5",
    projectId: "proj-2",
    status: "failed",
    startedAt: new Date("2024-03-18T09:00:00"),
    completedAt: new Date("2024-03-18T09:05:00"),
    duration: 300000, // 5 minutes
  },
  // Healthcare Portal test runs
  {
    id: "run-6",
    projectId: "proj-3",
    status: "completed",
    startedAt: new Date("2024-03-21T09:00:00"),
    completedAt: new Date("2024-03-21T09:12:00"),
    duration: 720000, // 12 minutes
  },
  {
    id: "run-7",
    projectId: "proj-3",
    status: "queued",
    startedAt: new Date("2024-03-21T11:30:00"),
  },
];

export const sampleVulnerabilities: Vulnerability[] = [
  {
    id: "vuln-1",
    testRunId: "run-1",
    detail:
      "SQL Injection vulnerability found in login form at /api/auth/login. The username field is vulnerable to SQL injection attacks allowing authentication bypass.",
    foundAt: new Date("2024-03-20T10:32:00"),
  },
  {
    id: "vuln-2",
    testRunId: "run-1",
    detail:
      "Hardcoded API keys exposed in client-side JavaScript file /js/config.js. Third-party service credentials are accessible to attackers.",
    foundAt: new Date("2024-03-20T10:35:00"),
  },
  {
    id: "vuln-3",
    testRunId: "run-1",
    detail:
      "Cross-Site Scripting (XSS) vulnerability in search feature. User input is not properly sanitized allowing reflected XSS attacks.",
    foundAt: new Date("2024-03-20T10:37:00"),
  },
  {
    id: "vuln-4",
    testRunId: "run-1",
    detail:
      "Insecure Direct Object Reference at /user/profile/{id}. User profiles accessible by incrementing IDs without authorization checks.",
    foundAt: new Date("2024-03-20T10:40:00"),
  },
  {
    id: "vuln-5",
    testRunId: "run-1",
    detail:
      "Missing CSRF protection on state-changing operations at /api/user/update. Application vulnerable to cross-site request forgery.",
    foundAt: new Date("2024-03-20T10:42:00"),
  },
  {
    id: "vuln-6",
    testRunId: "run-1",
    detail:
      "Weak password policy at /register. Application allows weak passwords without complexity requirements.",
    foundAt: new Date("2024-03-20T10:43:00"),
  },
  {
    id: "vuln-7",
    testRunId: "run-1",
    detail:
      "Information disclosure in error messages. Stack traces and implementation details exposed to users.",
    foundAt: new Date("2024-03-20T10:44:00"),
  },
  {
    id: "vuln-8",
    testRunId: "run-4",
    detail:
      "Session fixation vulnerability at /api/auth/login. Session IDs not regenerated after authentication.",
    foundAt: new Date("2024-03-19T14:18:00"),
  },
  {
    id: "vuln-9",
    testRunId: "run-4",
    detail:
      "Missing security headers. X-Frame-Options and X-Content-Type-Options headers not implemented.",
    foundAt: new Date("2024-03-19T14:20:00"),
  },
  {
    id: "vuln-10",
    testRunId: "run-4",
    detail:
      "Outdated dependencies in package.json with known security vulnerabilities.",
    foundAt: new Date("2024-03-19T14:25:00"),
  },
];

export const sampleLearnings: Learning[] = [
  {
    id: "learn-1",
    projectId: "proj-1",
    url: "https://owasp.org/www-project-top-ten/",
    summary:
      "The OWASP Top 10 is a standard awareness document for developers and web application security. It represents a broad consensus about the most critical security risks to web applications.",
    content:
      "Full content of OWASP Top 10 documentation would be extracted and stored here...",
    status: "processed",
    addedAt: new Date("2024-03-15T10:00:00"),
    processedAt: new Date("2024-03-15T10:05:00"),
    metadata: {
      author: "OWASP Foundation",
      publishedDate: "2021",
      tags: ["security", "owasp", "vulnerabilities", "best-practices"],
    },
  },
  {
    id: "learn-2",
    projectId: "proj-1",
    url: "https://portswigger.net/web-security/sql-injection",
    summary:
      "Comprehensive guide on preventing SQL injection attacks, including parameterized queries, stored procedures, and input validation techniques.",
    content: "Detailed SQL injection prevention techniques and examples...",
    status: "processed",
    addedAt: new Date("2024-03-16T14:30:00"),
    processedAt: new Date("2024-03-16T14:35:00"),
    metadata: {
      author: "PortSwigger",
      tags: ["sql-injection", "database-security", "prevention"],
    },
  },
  {
    id: "learn-3",
    projectId: "proj-2",
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
    summary:
      "Guidelines for implementing secure session management, including session ID generation, storage, and lifecycle management.",
    content: "Session management best practices and implementation guide...",
    status: "processed",
    addedAt: new Date("2024-03-17T09:00:00"),
    processedAt: new Date("2024-03-17T09:10:00"),
    metadata: {
      author: "OWASP",
      tags: ["session", "authentication", "security"],
    },
  },
  {
    id: "learn-4",
    url: "https://developer.mozilla.org/en-US/docs/Web/Security/CSP",
    summary:
      "An added layer of security that helps detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks.",
    status: "processing",
    addedAt: new Date("2024-03-20T16:00:00"),
    metadata: {
      author: "MDN Web Docs",
      tags: ["csp", "xss-prevention", "headers"],
    },
  },
  {
    id: "learn-5",
    projectId: "proj-3",
    url: "https://example.com/invalid-url",
    summary: "Unable to retrieve content from the provided URL.",
    status: "failed",
    addedAt: new Date("2024-03-21T08:30:00"),
  },
  {
    id: "learn-6",
    url: "https://nvd.nist.gov/vuln",
    summary:
      "The NVD is the U.S. government repository of standards-based vulnerability management data. It includes databases of security checklist references, security-related software flaws, misconfigurations, product names, and impact metrics.",
    content:
      "Comprehensive vulnerability database information and search capabilities...",
    status: "processed",
    addedAt: new Date("2024-03-18T11:00:00"),
    processedAt: new Date("2024-03-18T11:15:00"),
    metadata: {
      author: "NIST",
      tags: ["vulnerability-database", "cve", "security-research"],
    },
  },
];

// Helper functions to get data
export function getProjectById(id: string): Project | undefined {
  return sampleProjects.find((p) => p.id === id);
}

export function getTestRunsByProjectId(projectId: string): TestRun[] {
  return sampleTestRuns.filter((run) => run.projectId === projectId);
}

export function getVulnerabilitiesByTestRunId(
  testRunId: string,
): Vulnerability[] {
  return sampleVulnerabilities.filter((vuln) => vuln.testRunId === testRunId);
}

export function getLearningsByProjectId(projectId?: string): Learning[] {
  if (projectId) {
    return sampleLearnings.filter((l) => l.projectId === projectId);
  }
  return sampleLearnings.filter((l) => !l.projectId); // Global learnings
}

export function getAllLearnings(): Learning[] {
  return sampleLearnings;
}

// Simulate async operations
export async function simulateCreateProject(data: {
  name: string;
  url: string;
}): Promise<Project> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    name: data.name,
    url: data.url,
    createdAt: new Date(),
  };
  sampleProjects.push(newProject);
  return newProject;
}

export async function simulateUpdateProject(
  id: string,
  updates: Partial<Project>,
): Promise<Project> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const projectIndex = sampleProjects.findIndex((p) => p.id === id);
  if (projectIndex === -1) throw new Error("Project not found");

  const existingProject = sampleProjects[projectIndex];
  if (!existingProject) throw new Error("Project not found");

  const updatedProject: Project = {
    ...existingProject,
    ...updates,
  };

  sampleProjects[projectIndex] = updatedProject;
  return updatedProject;
}

export async function simulateDeleteProject(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = sampleProjects.findIndex((p) => p.id === id);
  if (index !== -1) {
    sampleProjects.splice(index, 1);
  }
}

export async function simulateStartTestRun(
  projectId: string,
): Promise<TestRun> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newRun: TestRun = {
    id: `run-${Date.now()}`,
    projectId,
    status: "running",
    startedAt: new Date(),
  };
  sampleTestRuns.push(newRun);

  // Simulate completion after some time
  setTimeout(() => {
    const run = sampleTestRuns.find((r) => r.id === newRun.id);
    if (run && run.status === "running") {
      run.status = "completed";
      run.completedAt = new Date();
      run.duration = run.completedAt.getTime() - run.startedAt.getTime();

      // Add some random vulnerabilities
      const vulnerabilityCount = Math.floor(Math.random() * 5);
      for (let i = 0; i < vulnerabilityCount; i++) {
        sampleVulnerabilities.push({
          id: `vuln-${Date.now()}-${i}`,
          testRunId: run.id,
          detail: `Vulnerability ${i + 1} found during automated scan.`,
          foundAt: new Date(),
        });
      }
    }
  }, 10000); // Complete after 10 seconds

  return newRun;
}

export async function simulateAddLearning(data: {
  url: string;
  projectId?: string;
}): Promise<Learning> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const newLearning: Learning = {
    id: `learn-${Date.now()}`,
    projectId: data.projectId,
    url: data.url,
    summary: "Processing content from the provided URL...",
    status: "processing",
    addedAt: new Date(),
  };
  sampleLearnings.push(newLearning);

  // Simulate processing
  setTimeout(() => {
    const learning = sampleLearnings.find((l) => l.id === newLearning.id);
    if (learning) {
      learning.status = "processed";
      learning.processedAt = new Date();
      learning.summary =
        "Successfully extracted and processed content from the URL. The document contains valuable security insights and best practices.";
      learning.content =
        "Full extracted content from the URL would be stored here...";
      learning.metadata = {
        tags: ["security", "best-practices"],
      };
    }
  }, 3000);

  return newLearning;
}
