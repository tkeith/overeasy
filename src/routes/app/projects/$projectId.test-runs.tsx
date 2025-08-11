import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth-store";
import {
  PlayIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  Activity,
  Trash2,
} from "lucide-react";
import { AgentExecutionModal } from "~/components/agent-execution-modal";
import type { TestRunStatus, VulnerabilitySeverity } from "@prisma/client";

export const Route = createFileRoute("/app/projects/$projectId/test-runs")({
  component: TestRunsPage,
});

function TestRunsPage() {
  const { projectId } = Route.useParams();
  const token = useAuthStore((state) => state.token);
  const trpc = useTRPC();
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(
    null,
  );
  const [selectedTestRunId, setSelectedTestRunId] = useState<string | null>(
    null,
  );

  // Fetch test runs
  const { data: testRuns, refetch: refetchTestRuns } = useQuery(
    trpc.testRuns.getMany.queryOptions(
      { token: token!, projectId },
      { enabled: !!token },
    ),
  );

  // Fetch selected test run details
  const { data: selectedTestRun } = useQuery(
    trpc.testRuns.getOne.queryOptions(
      { token: token!, testRunId: selectedTestRunId! },
      { enabled: !!token && !!selectedTestRunId },
    ),
  );

  // Create test run mutation
  const createTestRunMutation = useMutation(
    trpc.testRuns.create.mutationOptions({
      onSuccess: () => {
        void refetchTestRuns();
      },
      onError: (error) => {
        console.error("Failed to create test run:", error);
        alert(`Failed to start test run: ${error.message}`);
      },
    }),
  );

  // Delete test run mutation
  const deleteTestRunMutation = useMutation(
    trpc.testRuns.delete.mutationOptions({
      onSuccess: () => {
        void refetchTestRuns();
        if (selectedTestRunId) {
          setSelectedTestRunId(null);
        }
      },
      onError: (error) => {
        console.error("Failed to delete test run:", error);
        alert(`Failed to delete test run: ${error.message}`);
      },
    }),
  );

  // Auto-refresh for running tests
  useEffect(() => {
    const hasRunningTests = testRuns?.some((tr) => tr.status === "RUNNING");
    if (hasRunningTests) {
      const interval = setInterval(() => {
        void refetchTestRuns();
      }, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [testRuns, refetchTestRuns]);

  const handleStartTestRun = () => {
    if (!token) return;
    createTestRunMutation.mutate({ token, projectId });
  };

  const handleDeleteTestRun = (testRunId: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this test run?")) return;
    deleteTestRunMutation.mutate({ token, testRunId });
  };

  const getStatusIcon = (status: TestRunStatus) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case "RUNNING":
        return <RefreshCwIcon className="h-4 w-4 animate-spin text-blue-500" />;
      case "COMPLETED":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const getSeverityBadge = (severity: VulnerabilitySeverity) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (severity) {
      case "CRITICAL":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "HIGH":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "MEDIUM":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "LOW":
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  const formatDuration = (
    start: Date | string | null,
    end: Date | string | null,
  ) => {
    if (!start || !end) return "—";
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Security Test Runs
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Run automated security tests based on your project's learnings
          </p>
        </div>
        <button
          onClick={handleStartTestRun}
          disabled={
            createTestRunMutation.isPending ||
            testRuns?.some((tr) => tr.status === "RUNNING")
          }
          className="inline-flex items-center rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlayIcon className="mr-2 h-4 w-4" />
          {createTestRunMutation.isPending
            ? "Starting..."
            : "Start New Test Run"}
        </button>
      </div>

      {/* Test Runs List */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Test History
          </h3>

          {!testRuns || testRuns.length === 0 ? (
            <div className="py-12 text-center">
              <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No test runs yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start your first test run to check for vulnerabilities
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testRuns.map((testRun) => (
                <div
                  key={testRun.id}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50"
                  onClick={() => setSelectedTestRunId(testRun.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(testRun.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            Test Run
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(testRun.createdAt)}
                          </span>
                        </div>

                        {testRun.status === "COMPLETED" && (
                          <div className="mt-2 flex items-center space-x-4 text-sm">
                            {testRun.vulnerabilityCounts.total > 0 ? (
                              <>
                                <span className="flex items-center text-red-600">
                                  <ShieldAlertIcon className="mr-1 h-4 w-4" />
                                  {testRun.vulnerabilityCounts.total}{" "}
                                  vulnerabilities found
                                </span>
                                {testRun.vulnerabilityCounts.critical > 0 && (
                                  <span className="font-medium text-red-700">
                                    {testRun.vulnerabilityCounts.critical}{" "}
                                    Critical
                                  </span>
                                )}
                                {testRun.vulnerabilityCounts.high > 0 && (
                                  <span className="font-medium text-orange-600">
                                    {testRun.vulnerabilityCounts.high} High
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="flex items-center text-green-600">
                                <ShieldCheckIcon className="mr-1 h-4 w-4" />
                                No vulnerabilities found
                              </span>
                            )}
                          </div>
                        )}

                        {testRun.status === "RUNNING" && (
                          <div className="mt-1 text-sm text-blue-600">
                            Test in progress...
                          </div>
                        )}

                        {testRun.status === "FAILED" && (
                          <div className="mt-1 text-sm text-red-600">
                            Test failed to complete
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {testRun.completedAt && testRun.startedAt && (
                        <span className="text-sm text-gray-500">
                          Duration:{" "}
                          {formatDuration(
                            testRun.startedAt,
                            testRun.completedAt,
                          )}
                        </span>
                      )}

                      {testRun.agentExecutionId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedExecutionId(testRun.agentExecutionId);
                          }}
                          className="inline-flex items-center rounded-md p-1.5 text-amber-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                          title="View Agent Activity"
                        >
                          <Activity className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTestRun(testRun.id);
                        }}
                        className="inline-flex items-center rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete Test Run"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Test Run Details */}
      {selectedTestRun && (
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Test Run Details
              </h3>
              <button
                onClick={() => setSelectedTestRunId(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            {/* Test Run Info */}
            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium">
                  {selectedTestRun.status}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Target URL:</span>
                <span className="ml-2 font-medium">
                  {selectedTestRun.project.url}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Started:</span>
                <span className="ml-2">
                  {formatDate(selectedTestRun.startedAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Completed:</span>
                <span className="ml-2">
                  {formatDate(selectedTestRun.completedAt)}
                </span>
              </div>
            </div>

            {/* Vulnerability Statistics */}
            {selectedTestRun.stats.totalVulnerabilities > 0 && (
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-medium text-gray-900">
                  Vulnerability Summary
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-red-50 p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedTestRun.stats.bySeverity.critical}
                    </div>
                    <div className="text-xs text-red-800">Critical</div>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedTestRun.stats.bySeverity.high}
                    </div>
                    <div className="text-xs text-orange-800">High</div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedTestRun.stats.bySeverity.medium}
                    </div>
                    <div className="text-xs text-yellow-800">Medium</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedTestRun.stats.bySeverity.low}
                    </div>
                    <div className="text-xs text-blue-800">Low</div>
                  </div>
                </div>
              </div>
            )}

            {/* Vulnerabilities List */}
            {selectedTestRun.vulnerabilities.length > 0 ? (
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-900">
                  Vulnerabilities Found
                </h4>
                <div className="space-y-3">
                  {selectedTestRun.vulnerabilities.map((vulnerability) => (
                    <div
                      key={vulnerability.id}
                      className="rounded-lg border p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <h5 className="font-medium text-gray-900">
                          {vulnerability.name}
                        </h5>
                        <div className="flex items-center space-x-2">
                          {vulnerability.category && (
                            <span className="text-xs text-gray-500">
                              {vulnerability.category}
                            </span>
                          )}
                          <span
                            className={getSeverityBadge(vulnerability.severity)}
                          >
                            {vulnerability.severity}
                          </span>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-gray-600">
                        {vulnerability.details}
                      </p>
                      {vulnerability.evidence && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                            View Evidence
                          </summary>
                          <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-3 text-xs">
                            {JSON.stringify(vulnerability.evidence, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedTestRun.status === "COMPLETED" ? (
              <div className="py-8 text-center">
                <ShieldCheckIcon className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-2 text-sm text-gray-600">
                  No vulnerabilities detected in this test run
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Agent Execution Modal */}
      {selectedExecutionId && (
        <AgentExecutionModal
          isOpen={!!selectedExecutionId}
          executionId={selectedExecutionId}
          onClose={() => setSelectedExecutionId(null)}
        />
      )}
    </div>
  );
}
