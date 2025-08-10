import { z } from "zod";
import type { JsonValue } from "@prisma/client/runtime/library";

// ============================
// Unified Message Schema
// ============================

// AI message data subtypes
export const aiTextDataSchema = z.object({
  type: z.literal("text"),
  content: z.string(),
});

export const toolCallDataSchema = z.object({
  type: z.literal("tool_call"),
  toolName: z.string(),
  args: z.any(),
  toolCallId: z.string().optional(),
});

export const toolResultDataSchema = z.object({
  type: z.literal("tool_result"),
  toolName: z.string(),
  result: z.any(),
  toolCallId: z.string().optional(),
});

export const aiReasoningDataSchema = z.object({
  type: z.literal("reasoning"),
  content: z.string(),
});

// Union of all AI message data types
export const aiMessageDataSchema = z.discriminatedUnion("type", [
  aiTextDataSchema,
  toolCallDataSchema,
  toolResultDataSchema,
  aiReasoningDataSchema,
]);

// User/Request message data schema
export const userMessageDataSchema = z.object({
  content: z.string(),
  metadata: z.record(z.any()).optional(), // For storing additional request context
});

// Request message data schema (for UI requests)
export const requestMessageDataSchema = z.object({
  interactionType: z.string().optional(),
  elementId: z.string().optional(),
  payload: z.any().optional(),
  metadata: z.record(z.any()).optional(),
});

// Main message types
export const messageTypeSchema = z.enum(["user", "ai", "request"]);

// Complete message schema for database storage
export const unifiedMessageSchema = z.object({
  id: z.string(),
  type: messageTypeSchema,
  data: z.union([
    aiMessageDataSchema,
    userMessageDataSchema,
    requestMessageDataSchema,
  ]),
  createdAt: z.date().or(z.string()),
  projectId: z.string().optional(),
  requestId: z.string().optional(),
});

// Type exports
export type AiTextData = z.infer<typeof aiTextDataSchema>;
export type ToolCallData = z.infer<typeof toolCallDataSchema>;
export type ToolResultData = z.infer<typeof toolResultDataSchema>;
export type AiReasoningData = z.infer<typeof aiReasoningDataSchema>;
export type AiMessageData = z.infer<typeof aiMessageDataSchema>;
export type UserMessageData = z.infer<typeof userMessageDataSchema>;
export type RequestMessageData = z.infer<typeof requestMessageDataSchema>;
export type MessageType = z.infer<typeof messageTypeSchema>;
export type UnifiedMessage = z.infer<typeof unifiedMessageSchema>;

// Helper function to create a user message
export function createUserMessage(
  content: string,
  metadata?: Record<string, unknown>,
): Omit<UnifiedMessage, "id" | "createdAt"> {
  return {
    type: "user",
    data: {
      content,
      metadata,
    },
  };
}

// Helper function to create an AI text message
export function createAiTextMessage(
  content: string,
): Omit<UnifiedMessage, "id" | "createdAt"> {
  return {
    type: "ai",
    data: {
      type: "text",
      content,
    },
  };
}

// Helper function to create a tool call message
export function createToolCallMessage(
  toolName: string,
  args: unknown,
  toolCallId?: string,
): Omit<UnifiedMessage, "id" | "createdAt"> {
  return {
    type: "ai",
    data: {
      type: "tool_call",
      toolName,
      args,
      toolCallId,
    },
  };
}

// Helper function to create a tool result message
export function createToolResultMessage(
  toolName: string,
  result: unknown,
  toolCallId?: string,
): Omit<UnifiedMessage, "id" | "createdAt"> {
  return {
    type: "ai",
    data: {
      type: "tool_result",
      toolName,
      result,
      toolCallId,
    },
  };
}

// Helper function to create a request message (for UI interactions)
export function createRequestMessage(
  data: RequestMessageData,
): Omit<UnifiedMessage, "id" | "createdAt"> {
  return {
    type: "request",
    data,
  };
}

// Helper function to create an AI reasoning message
export function createAiReasoningMessage(
  content: string,
): Omit<UnifiedMessage, "id" | "createdAt"> {
  return {
    type: "ai",
    data: {
      type: "reasoning",
      content,
    },
  };
}
