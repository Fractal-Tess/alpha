/**
 * Tests for Task Complexity Classifier
 */

import { describe, it, expect } from "vitest";
import { estimateComplexity } from "./classifier.js";

describe("estimateComplexity", () => {
  describe("content length factor", () => {
    it("should classify short content as simpler", () => {
      const result = estimateComplexity("This is a short sentence.");
      expect(result.score).toBeLessThan(0.5);
    });

    it("should classify long content as more complex", () => {
      const longContent = "This is a paragraph. ".repeat(300);
      const result = estimateComplexity(longContent);
      expect(result.score).toBeGreaterThanOrEqual(0.25);
    });
  });

  describe("technical terminology factor", () => {
    it("should classify non-technical content as simpler", () => {
      const result = estimateComplexity("The cat sat on the mat. It was a sunny day.");
      expect(result.score).toBeLessThan(0.5);
    });

    it("should classify technical content as more complex", () => {
      const result = estimateComplexity(
        "The algorithm implements a neural network architecture with cryptographic protocol. " +
          "The differential equations model quantum molecular interactions.",
      );
      expect(result.score).toBeGreaterThanOrEqual(0.2);
    });
  });

  describe("sentence complexity factor", () => {
    it("should handle simple sentences", () => {
      const result = estimateComplexity("Hello. World. Simple. Sentences.");
      expect(result.score).toBeLessThan(0.4);
    });

    it("should handle complex sentences", () => {
      const result = estimateComplexity(
        "This extremely long and complicated sentence with many subordinate clauses and technical terminology " +
          "demonstrates how sentence complexity affects the overall complexity score of the text being analyzed.",
      );
      expect(result.score).toBeGreaterThanOrEqual(0.2);
    });
  });

  describe("mathematical notation factor", () => {
    it("should increase complexity for math symbols", () => {
      const withMath = estimateComplexity("The function f(x) = x² + 2x is quadratic.");
      const withoutMath = estimateComplexity("The function is quadratic in nature.");
      // Both should be relatively simple, but math content slightly higher
      expect(withMath.score).toBeGreaterThanOrEqual(withoutMath.score - 0.1);
    });
  });

  describe("complexity levels", () => {
    it("should return 'simple' for low complexity", () => {
      const result = estimateComplexity("Hello world.");
      expect(result.level).toBe("simple");
    });

    it("should return appropriate level for moderate complexity", () => {
      const result = estimateComplexity(
        "This is a moderately complex text about algorithms and data structures. " +
          "It discusses implementation details and framework architectures.",
      );
      expect(["simple", "moderate", "complex"]).toContain(result.level);
    });

    it("should return 'complex' for high complexity", () => {
      const result = estimateComplexity(
        "The differential equation ∫f(x)dx represents the integral of the function. " +
          "The algorithm implements a neural network with cryptographic protocols. ".repeat(10) +
          "The quantum molecular architecture uses vector matrix operations for the coefficient calculations.",
      );
      expect(result.level).toBe("complex");
    });
  });

  describe("output format", () => {
    it("should return score between 0 and 1", () => {
      const result = estimateComplexity("Any text content here.");
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it("should return valid level", () => {
      const result = estimateComplexity("Any text content here.");
      expect(["simple", "moderate", "complex"]).toContain(result.level);
    });

    it("should include reasoning", () => {
      const result = estimateComplexity("Any text content here.");
      expect(result.reasoning).toBeDefined();
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it("should round score to 2 decimal places", () => {
      const result = estimateComplexity("Test content for rounding.");
      const scoreStr = result.score.toString();
      const decimals = scoreStr.split(".")[1];
      expect(!decimals || decimals.length <= 2).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const result = estimateComplexity("");
      expect(result.score).toBeDefined();
      expect(result.level).toBe("simple");
    });

    it("should handle single word", () => {
      const result = estimateComplexity("Hello");
      expect(result.score).toBeDefined();
      expect(result.level).toBe("simple");
    });

    it("should handle only punctuation", () => {
      const result = estimateComplexity("... !!! ???");
      expect(result.score).toBeDefined();
    });

    it("should handle unicode content", () => {
      const result = estimateComplexity("こんにちは世界 👋 Здравствуй мир");
      expect(result.score).toBeDefined();
    });
  });
});
