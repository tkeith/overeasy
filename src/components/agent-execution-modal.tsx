import { Fragment, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth-store";
import { AgentExecutionViewer } from "./agent-execution-viewer";
import type { AgentExecutionStatus } from "~/schemas/agent-execution";

interface AgentExecutionModalProps {
  executionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentExecutionModal({
  executionId,
  isOpen,
  onClose,
}: AgentExecutionModalProps) {
  const trpc = useTRPC();
  const token = useAuthStore((state) => state.token);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevBlockCountRef = useRef<number>(0);

  // Fetch execution data with polling
  const { data: execution, isLoading } = useQuery(
    trpc.agents.getExecution.queryOptions(
      { token: token || "", executionId },
      {
        enabled: !!token && !!executionId && isOpen,
        // Poll every second while running, every 5 seconds otherwise
        refetchInterval: (query) => {
          const data = query.state.data;
          if (data?.status === "RUNNING") {
            return 1000; // 1 second
          }
          return 5000; // 5 seconds
        },
      },
    ),
  );

  // Auto-scroll when blocks change (new messages) or on initial load
  useEffect(() => {
    if (!execution?.blocks) return;

    const currentBlockCount = execution.blocks.length;
    const prevBlockCount = prevBlockCountRef.current;

    // Scroll if this is the first load (prev was 0) or if block count increased
    if (prevBlockCount === 0 || currentBlockCount > prevBlockCount) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: prevBlockCount === 0 ? "instant" : "smooth",
        });
      }, 50);
    }

    // Update the previous count for next comparison
    prevBlockCountRef.current = currentBlockCount;
  }, [execution?.blocks]);

  const getStatusIcon = (status: AgentExecutionStatus) => {
    switch (status) {
      case "RUNNING":
        return <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />;
      case "SUCCEEDED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: AgentExecutionStatus) => {
    switch (status) {
      case "RUNNING":
        return "Running";
      case "SUCCEEDED":
        return "Completed";
      case "FAILED":
        return "Failed";
      default:
        return status;
    }
  };

  const getStatusColor = (status: AgentExecutionStatus) => {
    switch (status) {
      case "RUNNING":
        return "text-amber-600 bg-amber-50";
      case "SUCCEEDED":
        return "text-green-600 bg-green-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Agent Execution
                      </Dialog.Title>
                      {execution && (
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-mono">
                            {execution.agentName}
                          </span>
                          <span>•</span>
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ${getStatusColor(execution.status)}`}
                          >
                            {getStatusIcon(execution.status)}
                            <span className="text-xs font-medium">
                              {getStatusText(execution.status)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div ref={scrollContainerRef} className="max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                    </div>
                  ) : execution?.blocks ? (
                    <AgentExecutionViewer blocks={execution.blocks} />
                  ) : (
                    <div className="px-6 py-12 text-center text-gray-500">
                      No execution data available
                    </div>
                  )}
                </div>

                {/* Footer */}
                {execution && (
                  <div className="border-t border-gray-200 px-6 py-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div>
                        Started:{" "}
                        {new Date(execution.startedAt).toLocaleString()}
                      </div>
                      {execution.completedAt && (
                        <div>
                          Completed:{" "}
                          {new Date(execution.completedAt).toLocaleString()}
                        </div>
                      )}
                      {execution.status === "RUNNING" && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Auto-refreshing...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
