/**
 * Constants for AI agent configuration
 */

// Model configuration
export const AI_MODEL = "claude-sonnet-4-20250514" as const;
export const AI_TEMPERATURE = 1;

// Agent-specific configurations
export const TESTING_AGENT_CONFIG = {
  model: AI_MODEL,
  temperature: AI_TEMPERATURE,
  maxSteps: 50,
} as const;

export const LEARNING_EXTRACTOR_CONFIG = {
  model: AI_MODEL,
  temperature: AI_TEMPERATURE,
  maxSteps: 20,
  thinking: {
    enabled: true,
    budgetTokens: 15000,
  },
} as const;
