# LLM Router Configuration

```typescript
// packages/ai/src/router.config.ts
export interface ModelConfig {
  id: string;
  provider: "openrouter";
  model: string;
  costPer1kTokens: number;
  maxTokens: number;
}

export interface RoutingRule {
  task: "flashcard" | "quiz" | "summary" | "explain" | "classify";
  condition?: string; // e.g., "complexity > 0.7"
  model: string;
}

export interface RouterConfig {
  classifier: ModelConfig;
  models: Record<string, ModelConfig>;
  defaultModel: string;
  fallbackChain: string[];
  rules: RoutingRule[];
}

export const routerConfig: RouterConfig = {
  classifier: {
    id: "classifier",
    provider: "openrouter",
    model: "deepseek/deepseek-chat",
    costPer1kTokens: 0.0001,
    maxTokens: 100,
  },

  models: {
    "deepseek-v3": {
      id: "deepseek-v3",
      provider: "openrouter",
      model: "deepseek/deepseek-chat-v3",
      costPer1kTokens: 0.0002,
      maxTokens: 8192,
    },
    "deepseek-r1": {
      id: "deepseek-r1",
      provider: "openrouter",
      model: "deepseek/deepseek-r1",
      costPer1kTokens: 0.001,
      maxTokens: 8192,
    },
    "claude-haiku": {
      id: "claude-haiku",
      provider: "openrouter",
      model: "anthropic/claude-3-haiku",
      costPer1kTokens: 0.00025,
      maxTokens: 4096,
    },
    "claude-sonnet": {
      id: "claude-sonnet",
      provider: "openrouter",
      model: "anthropic/claude-3.5-sonnet",
      costPer1kTokens: 0.003,
      maxTokens: 8192,
    },
  },

  defaultModel: "deepseek-v3",

  fallbackChain: ["deepseek-v3", "claude-haiku", "claude-sonnet"],

  rules: [
    { task: "classify", model: "deepseek-v3" },
    { task: "flashcard", model: "deepseek-v3" },
    { task: "quiz", model: "deepseek-v3" },
    { task: "summary", model: "deepseek-v3" },
    { task: "explain", condition: "complexity > 0.7", model: "claude-sonnet" },
    { task: "explain", model: "deepseek-v3" },
  ],
};
```
