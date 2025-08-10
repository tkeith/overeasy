import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  sampleProjects,
  sampleTestRuns,
  sampleVulnerabilities,
  simulateStartTestRun,
} from "~/data/placeholder-data";
import {
  Play,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const Route = createFileRoute("/app/projects/$projectId/")({
  component: ProjectTestRuns,
});

function ProjectTestRuns() {
  const { projectId } = useParams({ from: "/app/projects/$projectId/" });
  const project = sampleProjects.find((p) => p.id === projectId);
  const projectTestRuns = sampleTestRuns.filter(
    (run) => run.projectId === projectId,
  );
  const [testRuns, setTestRuns] = useState(projectTestRuns);
  const [isStartingTest, setIsStartingTest] = useState(false);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  const handleStartTest = async () => {
    if (!project) return;
    setIsStartingTest(true);
    const newRun = await simulateStartTestRun(project.id);
    setTestRuns([newRun, ...testRuns]);
    setIsStartingTest(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "running":
        return <Loader className="h-5 w-5 animate-spin text-amber-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Test Runs</h2>
        <button
          onClick={() => void handleStartTest()}
          disabled={isStartingTest}
          className="inline-flex items-center rounded-md border border-transparent bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isStartingTest ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Starting Test...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start New Test
            </>
          )}
        </button>
      </div>

      {/* Test Runs List */}
      {testRuns.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm border border-amber-100/30">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No test runs yet
          </h3>
          <p className="mb-4 text-gray-500">
            Start your first security test to identify vulnerabilities
          </p>
          <button
            onClick={() => void handleStartTest()}
            disabled={isStartingTest}
            className="inline-flex items-center rounded-md border border-transparent bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 transition-colors"
          >
            <Play className="mr-2 h-4 w-4" />
            Start First Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {testRuns.map((run) => {
            const runVulnerabilities = sampleVulnerabilities.filter(
              (v) => v.testRunId === run.id,
            );
            const isExpanded = expandedRun === run.id;

            return (
              <div
                key={run.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm border border-amber-100/20 hover:border-amber-100/40 transition-all"
              >
                <div
                  className="cursor-pointer p-6 hover:bg-amber-50/30 transition-colors"
                  onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(run.status)}
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            Test Run #{run.id.slice(-6)}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(run.startedAt).toLocaleString()}
                          </span>
                        </div>
                        {run.duration && (
                          <p className="mt-1 text-sm text-gray-500">
                            Duration: {Math.round(run.duration / 60000)} minutes
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {runVulnerabilities.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {runVulnerabilities.length} vulnerabilities
                          </span>
                        </div>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Vulnerability Details */}
                {isExpanded && runVulnerabilities.length > 0 && (
                  <div className="border-t bg-gray-50 px-6 py-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-900">
                      Vulnerabilities Found
                    </h4>
                    <div className="space-y-2">
                      {runVulnerabilities.map((vuln) => (
                        <div
                          key={vuln.id}
                          className="rounded-md border border-gray-200 bg-white p-4"
                        >
                          <p className="text-sm text-gray-700">{vuln.detail}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            Found at: {new Date(vuln.foundAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
