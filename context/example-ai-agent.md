We want to follow this example for building AI agents in our app. Make sure to use the same model config and max steps as we use in this example.

```typescript
import { anthropic, type AnthropicProviderOptions } from "@ai-sdk/anthropic";
import { generateText } from "ai";

// Generate AI response with tool calling and reasoning
const { text, reasoning, steps } = await generateText({
  model: anthropic("claude-sonnet-4-20250514"),
  tools: [] // add tools,
  maxSteps: 20, // Allow up to 20 tool calls
  providerOptions: {
    anthropic: {
      thinking: { type: "enabled", budgetTokens: 15000 },
    } satisfies AnthropicProviderOptions,
  },
  headers: {
    "anthropic-beta": "interleaved-thinking-2025-05-14",
  },
  messages: [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userMessage,
    },
  ],
  onStepFinish: async (step) => {
    // Log reasoning first (if any) - this shows the thought process
    if (step.reasoning) {
      // Handle reasoning
    }

    // Log AI text second (if any) - this preserves the natural flow
    if (step.text) {
      // Handle text response
    }

    // Log tool calls third
    if (step.toolCalls && step.toolCalls.length > 0) {
      for (const toolCall of step.toolCalls) {
        // Handle tool call
      }
    }

    // Log tool results last
    if (step.toolResults && step.toolResults.length > 0) {
      for (const toolResult of step.toolResults) {
        // Handle tool result
      }
    }
  },
});

// Store the final reasoning if there wasn't one in the steps
if (reasoning && steps.length === 0) {
  // Handle final reasoning
}

// Store the final AI response if there wasn't one in the steps
if (text && steps.length === 0) {
  // Handle final text
}
```
