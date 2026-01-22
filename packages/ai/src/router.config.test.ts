/**
 * Tests for LLM Router Configuration
 */

import { describe, it, expect } from "vitest";
import { routerConfig, getModelConfig, getModelForTask, type TaskType } from "./router.config.js";

describe("routerConfig", () => {
  it("should have a classifier model defined", () => {
    expect(routerConfig.classifier).toBeDefined();
    expect(routerConfig.classifier.id).toBe("classifier");
    expect(routerConfig.classifier.provider).toBe("openrouter");
    expect(routerConfig.classifier.model).toContain("deepseek");
  });

  it("should have models defined", () => {
    expect(Object.keys(routerConfig.models).length).toBeGreaterThan(0);
    expect(routerConfig.models["deepseek-v3"]).toBeDefined();
    expect(routerConfig.models["claude-haiku"]).toBeDefined();
    expect(routerConfig.models["claude-sonnet"]).toBeDefined();
  });

  it("should have a valid default model", () => {
    expect(routerConfig.defaultModel).toBe("deepseek-v3");
    expect(routerConfig.models[routerConfig.defaultModel]).toBeDefined();
  });

  it("should have fallback chain with valid models", () => {
    expect(routerConfig.fallbackChain.length).toBeGreaterThan(0);
    for (const modelId of routerConfig.fallbackChain) {
      expect(routerConfig.models[modelId]).toBeDefined();
    }
  });

  it("should have routing rules defined", () => {
    expect(routerConfig.rules.length).toBeGreaterThan(0);
  });

  it("should have valid models in routing rules", () => {
    for (const rule of routerConfig.rules) {
      expect(routerConfig.models[rule.model]).toBeDefined();
    }
  });
});

describe("getModelConfig", () => {
  it("should return model config for valid id", () => {
    const config = getModelConfig("deepseek-v3");
    expect(config).toBeDefined();
    expect(config?.id).toBe("deepseek-v3");
    expect(config?.provider).toBe("openrouter");
  });

  it("should return undefined for invalid id", () => {
    const config = getModelConfig("nonexistent-model");
    expect(config).toBeUndefined();
  });

  it("should return all model properties", () => {
    const config = getModelConfig("claude-sonnet");
    expect(config).toHaveProperty("id");
    expect(config).toHaveProperty("provider");
    expect(config).toHaveProperty("model");
    expect(config).toHaveProperty("costPer1kTokens");
    expect(config).toHaveProperty("maxTokens");
  });
});

describe("getModelForTask", () => {
  it("should return model for flashcard task", () => {
    const model = getModelForTask("flashcard");
    expect(model).toBeDefined();
    expect(model.id).toBe("deepseek-v3");
  });

  it("should return model for quiz task", () => {
    const model = getModelForTask("quiz");
    expect(model).toBeDefined();
    expect(model.id).toBe("deepseek-v3");
  });

  it("should return model for summary task", () => {
    const model = getModelForTask("summary");
    expect(model).toBeDefined();
    expect(model.id).toBe("deepseek-v3");
  });

  it("should return model for classify task", () => {
    const model = getModelForTask("classify");
    expect(model).toBeDefined();
    expect(model.id).toBe("deepseek-v3");
  });

  it("should return default model for explain with low complexity", () => {
    const model = getModelForTask("explain", 0.3);
    expect(model).toBeDefined();
    expect(model.id).toBe("deepseek-v3");
  });

  it("should return claude-sonnet for explain with high complexity", () => {
    const model = getModelForTask("explain", 0.8);
    expect(model).toBeDefined();
    expect(model.id).toBe("claude-sonnet");
  });

  it("should use default model for explain without complexity", () => {
    const model = getModelForTask("explain");
    expect(model).toBeDefined();
    // Without complexity, should fall through to the unconditional explain rule
    expect(model.id).toBe("deepseek-v3");
  });

  it("should handle boundary complexity values", () => {
    // Exactly 0.7 should NOT trigger "> 0.7" condition
    const modelAt07 = getModelForTask("explain", 0.7);
    expect(modelAt07.id).toBe("deepseek-v3");

    // Just above 0.7 should trigger "> 0.7" condition
    const modelAbove07 = getModelForTask("explain", 0.71);
    expect(modelAbove07.id).toBe("claude-sonnet");
  });

  it("should return default model for unknown task types", () => {
    // @ts-expect-error - Testing with invalid task type
    const model = getModelForTask("unknown-task");
    expect(model).toBeDefined();
    expect(model.id).toBe(routerConfig.defaultModel);
  });
});

describe("Model configurations", () => {
  it("should have valid cost values", () => {
    for (const [id, model] of Object.entries(routerConfig.models)) {
      expect(model.costPer1kTokens).toBeGreaterThan(0);
      expect(model.costPer1kTokens).toBeLessThan(1); // Reasonable upper bound
    }
  });

  it("should have valid max token values", () => {
    for (const [id, model] of Object.entries(routerConfig.models)) {
      expect(model.maxTokens).toBeGreaterThan(0);
      expect(model.maxTokens).toBeLessThanOrEqual(100000); // Reasonable upper bound
    }
  });

  it("should have valid OpenRouter model identifiers", () => {
    for (const [id, model] of Object.entries(routerConfig.models)) {
      // OpenRouter model IDs follow pattern: provider/model-name
      expect(model.model).toMatch(/^[\w-]+\/[\w.-]+$/);
    }
  });
});

describe("Routing rules", () => {
  const taskTypes: TaskType[] = [
    "flashcard",
    "quiz",
    "summary",
    "notes",
    "explain",
    "classify",
    "chat",
  ];

  it("should have rules for common task types", () => {
    const ruledTasks = new Set(routerConfig.rules.map((r) => r.task));
    // At least flashcard, quiz, summary should be covered
    expect(ruledTasks.has("flashcard")).toBe(true);
    expect(ruledTasks.has("quiz")).toBe(true);
    expect(ruledTasks.has("summary")).toBe(true);
  });

  it("should have valid condition syntax", () => {
    for (const rule of routerConfig.rules) {
      if (rule.condition) {
        // Condition should be parseable (complexity > number)
        expect(rule.condition).toMatch(/complexity\s*[><=]+\s*[\d.]+/);
      }
    }
  });
});
