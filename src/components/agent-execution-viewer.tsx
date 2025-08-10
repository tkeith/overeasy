import { Fragment } from "react";
import {
  MessageSquare,
  Brain,
  Wrench,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Markdown from "markdown-to-jsx";
import type { AgentBlock, AgentBlockType } from "~/schemas/agent-execution";
import { FEATURES } from "~/constants";

interface AgentExecutionViewerProps {
  blocks: AgentBlock[];
}

export function AgentExecutionViewer({ blocks }: AgentExecutionViewerProps) {
  const getBlockIcon = (type: AgentBlockType) => {
    switch (type) {
      case "TEXT":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "REASONING":
        return <Brain className="h-4 w-4 text-purple-500" />;
      case "TOOL_CALL":
        return <Wrench className="h-4 w-4 text-amber-500" />;
      case "TOOL_RESULT":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getBlockTitle = (type: AgentBlockType) => {
    switch (type) {
      case "TEXT":
        return "Response";
      case "REASONING":
        return "Reasoning";
      case "TOOL_CALL":
        return "Tool Call";
      case "TOOL_RESULT":
        return "Tool Result";
      default:
        return "Unknown";
    }
  };

  const renderBlockContent = (block: AgentBlock) => {
    const content = block.content as Record<string, unknown>;

    switch (block.blockType) {
      case "TEXT": {
        // Text blocks have a 'text' field and optional 'isError' field
        const textContent = content as { text?: unknown; isError?: boolean };
        const textValue =
          typeof textContent.text === "string"
            ? textContent.text
            : textContent.text
              ? JSON.stringify(textContent.text)
              : "";

        if (FEATURES.ENABLE_MARKDOWN_RENDERING) {
          return (
            <div
              className={
                textContent.isError
                  ? "prose prose-sm max-w-none text-red-600"
                  : "prose prose-sm max-w-none"
              }
            >
              <Markdown>{textValue}</Markdown>
            </div>
          );
        } else {
          return (
            <div
              className={textContent.isError ? "text-red-600" : "text-gray-700"}
            >
              <p className="whitespace-pre-wrap">{textValue}</p>
            </div>
          );
        }
      }

      case "REASONING": {
        // Reasoning blocks have a 'reasoning' field
        const reasoningContent = content as { reasoning?: unknown };
        const reasoningValue =
          typeof reasoningContent.reasoning === "string"
            ? reasoningContent.reasoning
            : reasoningContent.reasoning
              ? JSON.stringify(reasoningContent.reasoning)
              : "";

        if (FEATURES.ENABLE_MARKDOWN_RENDERING) {
          return (
            <div className="prose prose-sm max-w-none italic text-purple-700">
              <Markdown>{reasoningValue}</Markdown>
            </div>
          );
        } else {
          return (
            <div className="italic text-purple-700">
              <p className="whitespace-pre-wrap">{reasoningValue}</p>
            </div>
          );
        }
      }

      case "TOOL_CALL": {
        // Tool calls have toolName, args, and optional toolCallId
        const toolCallContent = content as {
          toolName?: unknown;
          args?: unknown;
          toolCallId?: unknown;
        };
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-600">Tool:</span>{" "}
              <span className="font-mono text-amber-600">
                {typeof toolCallContent.toolName === "string"
                  ? toolCallContent.toolName
                  : "unknown"}
              </span>
            </div>
            {toolCallContent.toolCallId ? (
              <div className="text-xs text-gray-500">
                ID:{" "}
                {typeof toolCallContent.toolCallId === "string"
                  ? toolCallContent.toolCallId
                  : JSON.stringify(toolCallContent.toolCallId)}
              </div>
            ) : null}
            {toolCallContent.args ? (
              <div>
                <div className="mb-1 text-sm font-medium text-gray-600">
                  Arguments:
                </div>
                <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                  {JSON.stringify(toolCallContent.args, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        );
      }

      case "TOOL_RESULT": {
        // Tool results have toolName, result, and optional toolCallId
        const toolResultContent = content as {
          toolName?: unknown;
          result?: unknown;
          toolCallId?: unknown;
        };
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-600">Tool:</span>{" "}
              <span className="font-mono text-green-600">
                {typeof toolResultContent.toolName === "string"
                  ? toolResultContent.toolName
                  : "unknown"}
              </span>
            </div>
            {toolResultContent.toolCallId ? (
              <div className="text-xs text-gray-500">
                ID:{" "}
                {typeof toolResultContent.toolCallId === "string"
                  ? toolResultContent.toolCallId
                  : JSON.stringify(toolResultContent.toolCallId)}
              </div>
            ) : null}
            {toolResultContent.result ? (
              <div>
                <div className="mb-1 text-sm font-medium text-gray-600">
                  Result:
                </div>
                <pre className="max-h-64 overflow-x-auto overflow-y-auto rounded bg-gray-50 p-2 text-xs">
                  {typeof toolResultContent.result === "string"
                    ? toolResultContent.result
                    : JSON.stringify(toolResultContent.result, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        );
      }

      default:
        // Fallback for unknown block types
        return (
          <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs">
            {JSON.stringify(content, null, 2)}
          </pre>
        );
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No execution blocks recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <Fragment key={block.id}>
          {index > 0 && <div className="border-t border-gray-100" />}
          <div className="px-4 py-3">
            <div className="mb-2 flex items-center gap-2">
              {getBlockIcon(block.blockType)}
              <span className="text-sm font-medium text-gray-700">
                {getBlockTitle(block.blockType)}
              </span>
              <span className="ml-auto text-xs text-gray-400">
                {new Date(block.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="pl-6">{renderBlockContent(block)}</div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
