/**
 * Tests for LLM Router
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LLMRouter, RouterError, createRouter } from "./router.js";

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

describe("LLMRouter", () => {
  let router: LLMRouter;

  beforeEach(() => {
    router = new LLMRouter({
      apiKey: "test-api-key",
      siteUrl: "https://test.com",
      siteName: "Test Site",
    });
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create router with required options", () => {
      const r = new LLMRouter({ apiKey: "test-key" });
      expect(r).toBeInstanceOf(LLMRouter);
    });

    it("should create router with all options", () => {
      const r = new LLMRouter({
        apiKey: "test-key",
        siteUrl: "https://example.com",
        siteName: "Example",
      });
      expect(r).toBeInstanceOf(LLMRouter);
    });
  });

  describe("route", () => {
    it("should make request to OpenRouter API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Test response" } }],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15,
          },
          model: "deepseek/deepseek-chat-v3",
        }),
      });

      const response = await router.route({
        task: "flashcard",
        messages: [{ role: "user", content: "Test prompt" }],
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(response.content).toBe("Test response");
      expect(response.usedFallback).toBe(false);
    });

    it("should include correct headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Test" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          model: "test",
        }),
      });

      await router.route({
        task: "flashcard",
        messages: [{ role: "user", content: "Test" }],
      });

      const [url, options] = mockFetch.mock.calls[0]!;
      expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
      expect(options.headers.Authorization).toBe("Bearer test-api-key");
      expect(options.headers["HTTP-Referer"]).toBe("https://test.com");
      expect(options.headers["X-Title"]).toBe("Test Site");
    });

    it("should return usage statistics", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Test" } }],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
          model: "test",
        }),
      });

      const response = await router.route({
        task: "quiz",
        messages: [{ role: "user", content: "Test" }],
      });

      expect(response.usage.promptTokens).toBe(100);
      expect(response.usage.completionTokens).toBe(50);
      expect(response.usage.totalTokens).toBe(150);
    });

    it("should throw RouterError on API failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      // Also mock fallback failures
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(
        router.route({
          task: "flashcard",
          messages: [{ role: "user", content: "Test" }],
        }),
      ).rejects.toThrow(RouterError);
    });

    it("should use fallback on primary model failure", async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Error",
      });

      // Fallback succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Fallback response" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          model: "fallback-model",
        }),
      });

      const response = await router.route({
        task: "flashcard",
        messages: [{ role: "user", content: "Test" }],
      });

      expect(response.content).toBe("Fallback response");
      expect(response.usedFallback).toBe(true);
      expect(response.originalModel).toBe("deepseek-v3");
    });

    it("should respect model override", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Response" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          model: "anthropic/claude-3.5-sonnet",
        }),
      });

      await router.route({
        task: "flashcard",
        messages: [{ role: "user", content: "Test" }],
        modelOverride: "claude-sonnet",
      });

      const [, options] = mockFetch.mock.calls[0]!;
      const body = JSON.parse(options.body);
      expect(body.model).toBe("anthropic/claude-3.5-sonnet");
    });

    it("should throw on invalid model override", async () => {
      await expect(
        router.route({
          task: "flashcard",
          messages: [{ role: "user", content: "Test" }],
          modelOverride: "invalid-model",
        }),
      ).rejects.toThrow("Unknown model override");
    });

    it("should not fallback when model override is specified", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Error",
      });

      await expect(
        router.route({
          task: "flashcard",
          messages: [{ role: "user", content: "Test" }],
          modelOverride: "claude-sonnet",
        }),
      ).rejects.toThrow(RouterError);

      // Should only be called once (no fallback)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should use complexity for routing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Response" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          model: "test",
        }),
      });

      await router.route({
        task: "explain",
        messages: [{ role: "user", content: "Complex topic" }],
        complexity: 0.8,
      });

      const [, options] = mockFetch.mock.calls[0]!;
      const body = JSON.parse(options.body);
      // High complexity should route to claude-sonnet for explain task
      expect(body.model).toBe("anthropic/claude-3.5-sonnet");
    });
  });

  describe("complete", () => {
    it("should send system and user messages", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Response" } }],
          usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
          model: "test",
        }),
      });

      const result = await router.complete(
        "flashcard",
        "You are a helpful assistant.",
        "Create flashcards.",
      );

      expect(result).toBe("Response");

      const [, options] = mockFetch.mock.calls[0]!;
      const body = JSON.parse(options.body);
      expect(body.messages).toHaveLength(2);
      expect(body.messages[0].role).toBe("system");
      expect(body.messages[1].role).toBe("user");
    });
  });
});

describe("createRouter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should create router with explicit API key", () => {
    const router = createRouter({ apiKey: "explicit-key" });
    expect(router).toBeInstanceOf(LLMRouter);
  });

  it("should use environment variable for API key", () => {
    process.env.OPENROUTER_API_KEY = "env-key";
    const router = createRouter();
    expect(router).toBeInstanceOf(LLMRouter);
  });

  it("should throw if no API key available", () => {
    delete process.env.OPENROUTER_API_KEY;
    expect(() => createRouter()).toThrow("OPENROUTER_API_KEY is required");
  });

  it("should use PUBLIC_APP_URL from environment", () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.PUBLIC_APP_URL = "https://app.example.com";
    const router = createRouter();
    expect(router).toBeInstanceOf(LLMRouter);
  });
});

describe("RouterError", () => {
  it("should include status code", () => {
    const error = new RouterError("Test error", 500, "model-id");
    expect(error.statusCode).toBe(500);
    expect(error.modelId).toBe("model-id");
    expect(error.name).toBe("RouterError");
  });

  it("should be instanceof Error", () => {
    const error = new RouterError("Test");
    expect(error).toBeInstanceOf(Error);
  });
});
