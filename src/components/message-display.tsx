import {
  UserIcon,
  BotIcon,
  TerminalIcon,
  FileCodeIcon,
  ActivityIcon,
  InboxIcon,
  BrainIcon,
} from "lucide-react";
import {
  unifiedMessageSchema,
  aiMessageDataSchema,
  userMessageDataSchema,
  requestMessageDataSchema,
  type UnifiedMessage,
  type AiMessageData,
} from "~/schemas/unified-messages";
import Markdown from "markdown-to-jsx";
import { AppBrand } from "~/components/app-brand";

interface MessageDisplayProps {
  message: {
    id: string;
    type: string;
    data: unknown;
    createdAt?: Date | string;
    timestamp?: Date | string;
  };
  showTimestamp?: boolean;
  compact?: boolean;
}

export function MessageDisplay({
  message,
  showTimestamp = true,
  compact = false,
}: MessageDisplayProps) {
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: compact ? undefined : "2-digit",
      hour12: false,
    });
  };

  const timestamp = message.timestamp || message.createdAt;

  // Parse the message type
  const messageType = message.type as "user" | "ai" | "request";

  switch (messageType) {
    case "user": {
      // Parse user message data
      const result = userMessageDataSchema.safeParse(message.data || {});
      if (!result.success) {
        return renderFallback("user", message.data, timestamp);
      }
      const data = result.data;

      return (
        <div className="flex items-start space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <UserIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-medium text-gray-900">You</span>
              {showTimestamp && timestamp && (
                <span className="text-xs text-gray-500">
                  {formatTime(timestamp)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-700">{data.content}</p>
          </div>
        </div>
      );
    }

    case "request": {
      // Parse request message data
      const result = requestMessageDataSchema.safeParse(message.data || {});
      if (!result.success) {
        return renderFallback("request", message.data, timestamp);
      }
      const data = result.data;

      return (
        <div className="flex items-start space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <InboxIcon className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-medium text-gray-900">Request</span>
              {showTimestamp && timestamp && (
                <span className="text-xs text-gray-500">
                  {formatTime(timestamp)}
                </span>
              )}
            </div>
            <div className="mt-1 rounded-md bg-purple-50 p-2">
              <div className="text-xs text-purple-900">
                {data.interactionType && (
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {data.interactionType}
                  </div>
                )}
                {data.elementId && (
                  <div>
                    <span className="font-medium">Element:</span>{" "}
                    {data.elementId}
                  </div>
                )}
                {data.payload && (
                  <div className="mt-1">
                    <span className="font-medium">Payload:</span>
                    <pre className="mt-1 text-xs text-purple-700">
                      {typeof data.payload === "object"
                        ? JSON.stringify(data.payload, null, 2)
                        : String(data.payload)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "ai": {
      // Parse AI message data
      const result = aiMessageDataSchema.safeParse(message.data || {});
      if (!result.success) {
        return renderFallback("ai", message.data, timestamp);
      }
      const data = result.data;

      return renderAiMessage(data, timestamp, showTimestamp, compact);
    }

    default:
      return renderFallback(messageType, message.data, timestamp);
  }

  function renderAiMessage(
    data: AiMessageData,
    timestamp: Date | string | undefined,
    showTimestamp: boolean,
    compact: boolean,
  ) {
    switch (data.type) {
      case "text":
        return (
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              <BotIcon className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-sm">
                  <AppBrand />
                </span>
                {showTimestamp && timestamp && (
                  <span className="text-xs text-gray-500">
                    {formatTime(timestamp)}
                  </span>
                )}
              </div>
              <article className="prose prose-sm mt-1 max-w-none">
                <Markdown>{data.content}</Markdown>
              </article>
            </div>
          </div>
        );

      case "tool_call":
        return (
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <TerminalIcon className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div
                className={`rounded-md bg-indigo-50 ${compact ? "p-2" : "p-3"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-indigo-900">
                      Tool Call: {data.toolName}
                    </span>
                    {showTimestamp && timestamp && (
                      <span className="text-xs text-indigo-700">
                        {formatTime(timestamp)}
                      </span>
                    )}
                  </div>
                </div>
                {data.args !== undefined && (
                  <div className="mt-2">
                    <pre className="text-xs text-indigo-700">
                      {formatToolArgs(data.toolName, data.args)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "tool_result":
        return (
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <FileCodeIcon className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div
                className={`rounded-md bg-green-50 ${compact ? "p-2" : "p-3"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-green-900">
                      Tool Result: {data.toolName}
                    </span>
                    {showTimestamp && timestamp && (
                      <span className="text-xs text-green-700">
                        {formatTime(timestamp)}
                      </span>
                    )}
                  </div>
                </div>
                {data.result !== undefined && !compact && (
                  <div className="mt-2 max-h-40 overflow-auto">
                    <pre className="text-xs text-green-700">
                      {formatToolResult(data.result)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "reasoning":
        return (
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
              <BrainIcon className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="rounded-md border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-3">
                <div className="mb-2 flex items-baseline space-x-2">
                  <span className="text-xs font-semibold text-purple-900">
                    Reasoning
                  </span>
                  {showTimestamp && timestamp && (
                    <span className="text-xs text-purple-600">
                      {formatTime(timestamp)}
                    </span>
                  )}
                </div>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-purple-800">
                    {data.content}
                  </div>
                </div>
                {!compact && (
                  <div className="mt-2 border-t border-purple-200 pt-2">
                    <span className="text-xs italic text-purple-600">
                      This shows the AI's internal reasoning process
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return renderFallback("ai", data, timestamp);
    }
  }

  function renderFallback(
    type: string,
    data: unknown,
    timestamp: Date | string | undefined,
  ) {
    return (
      <div className="flex items-start space-x-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          <ActivityIcon className="h-4 w-4 text-gray-600" />
        </div>
        <div className="flex-1">
          <div className="rounded-md bg-gray-50 p-3">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <ActivityIcon className="h-3 w-3" />
              <span>{type}</span>
              {showTimestamp && timestamp && (
                <span>{formatTime(timestamp)}</span>
              )}
            </div>
            <div className="mt-1 max-h-40 overflow-auto">
              <pre className="text-xs text-gray-600">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Helper function to format tool arguments in a readable way
function formatToolArgs(toolName: string, args: unknown): string {
  if (typeof args === "string") return args;

  // Handle common VM tool patterns
  if (toolName === "runCommand" && typeof args === "object" && args) {
    const a = args as { command?: string };
    return a.command || JSON.stringify(args, null, 2);
  }

  if (toolName === "readFile" && typeof args === "object" && args) {
    const a = args as { path?: string };
    return `Reading: ${a.path || "unknown"}`;
  }

  if (toolName === "writeFile" && typeof args === "object" && args) {
    const a = args as { path?: string; content?: string };
    const lines = a.content?.split("\n").length || 0;
    return `Writing to: ${a.path || "unknown"} (${lines} lines)`;
  }

  if (toolName === "listDirectory" && typeof args === "object" && args) {
    const a = args as { path?: string };
    return `Listing: ${a.path || "unknown"}`;
  }

  return JSON.stringify(args, null, 2);
}

// Helper function to format tool results
function formatToolResult(result: unknown): string {
  if (typeof result === "string") {
    // Truncate very long results
    if (result.length > 500) {
      return result.substring(0, 500) + "\n... (truncated)";
    }
    return result;
  }

  // Handle arrays (like directory listings)
  if (Array.isArray(result)) {
    return result.join("\n");
  }

  return JSON.stringify(result, null, 2);
}
