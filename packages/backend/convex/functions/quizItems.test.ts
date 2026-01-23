import { describe, it, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { modules } from "../test.setup";
import { api } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

describe("quizItems", () => {
  let t: ReturnType<typeof convexTest>;
  let testUserId: Id<"users">;
  let testSubjectId: Id<"subjects">;
  let testDocumentId: Id<"documents">;
  let testGenerationId: Id<"generations">;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    testUserId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        betterAuthId: "test-auth-id-quiz",
        email: "quiz@example.com",
        name: "Test User",
        plan: "paid",
        createdAt: Date.now(),
      });
    });

    testSubjectId = await t.run(async (ctx) => {
      return await ctx.db.insert("subjects", {
        userId: testUserId,
        name: "Test Subject",
        order: 0,
        createdAt: Date.now(),
      });
    });

    testDocumentId = await t.run(async (ctx) => {
      return await ctx.db.insert("documents", {
        userId: testUserId,
        subjectId: testSubjectId,
        name: "Test Document",
        storageId: "test-storage-id" as Id<"_storage">,
        mimeType: "application/pdf",
        size: 1000,
        status: "ready",
        extractedText: "This is test document content for quiz generation.",
        createdAt: Date.now(),
      });
    });

    testGenerationId = await t.run(async (ctx) => {
      return await ctx.db.insert("generations", {
        userId: testUserId,
        subjectId: testSubjectId,
        sourceDocumentIds: [testDocumentId],
        name: "Test Quiz",
        type: "quiz",
        status: "generating",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    });
  });

  describe("create", () => {
    it("should create a quiz item with valid data", async () => {
      const id = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctIndex: 2,
          explanation: "Paris is the capital and largest city of France.",
          order: 0,
          createdAt: Date.now(),
        });
      });

      const quizItem = await t.query(api.functions.quizItems.get, { id });

      expect(quizItem).toBeDefined();
      expect(quizItem?.question).toBe("What is the capital of France?");
      expect(quizItem?.options).toEqual(["London", "Berlin", "Paris", "Madrid"]);
      expect(quizItem?.correctIndex).toBe(2);
      expect(quizItem?.explanation).toBe("Paris is the capital and largest city of France.");
      expect(quizItem?.order).toBe(0);
      expect(quizItem?.generationId).toBe(testGenerationId);
      expect(quizItem?.userId).toBe(testUserId);
    });

    it("should create a quiz item without explanation", async () => {
      const id = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Test question?",
          options: ["Option A", "Option B"],
          correctIndex: 0,
          order: 0,
          createdAt: Date.now(),
        });
      });

      const quizItem = await t.query(api.functions.quizItems.get, { id });
      expect(quizItem?.explanation).toBeUndefined();
    });

    it("should create quiz item via API function with validation", async () => {
      const id = await t.mutation(api.functions.quizItems.create, {
        generationId: testGenerationId,
        userId: testUserId,
        question: "Test?",
        options: ["A", "B", "C"],
        correctIndex: 1,
        explanation: "Test explanation",
        order: 0,
      });

      const quizItem = await t.query(api.functions.quizItems.get, { id });
      expect(quizItem?.question).toBe("Test?");
      expect(quizItem?.correctIndex).toBe(1);
    });

    it("should throw error if generation is not quiz type", async () => {
      const flashcardGenId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId: testUserId,
          subjectId: testSubjectId,
          sourceDocumentIds: [testDocumentId],
          name: "Test Flashcards",
          type: "flashcards",
          status: "ready",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      await expect(
        t.mutation(api.functions.quizItems.create, {
          generationId: flashcardGenId,
          userId: testUserId,
          question: "Test?",
          options: ["A", "B"],
          correctIndex: 0,
          order: 0,
        }),
      ).rejects.toThrow("Generation is not a quiz generation");
    });

    it("should throw error if options array has fewer than 2 options", async () => {
      await expect(
        t.mutation(api.functions.quizItems.create, {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Test?",
          options: ["Only one option"],
          correctIndex: 0,
          order: 0,
        }),
      ).rejects.toThrow("Quiz must have at least 2 options");
    });

    it("should throw error if correctIndex is out of bounds", async () => {
      await expect(
        t.mutation(api.functions.quizItems.create, {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Test?",
          options: ["A", "B", "C"],
          correctIndex: 5,
          order: 0,
        }),
      ).rejects.toThrow("Correct index is out of bounds");

      await expect(
        t.mutation(api.functions.quizItems.create, {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Test?",
          options: ["A", "B"],
          correctIndex: -1,
          order: 0,
        }),
      ).rejects.toThrow("Correct index is out of bounds");
    });
  });

  describe("createBatch", () => {
    it("should create multiple quiz items", async () => {
      const ids = await t.mutation(api.functions.quizItems.createBatch, {
        generationId: testGenerationId,
        userId: testUserId,
        items: [
          {
            question: "Question 1?",
            options: ["A", "B", "C", "D"],
            correctIndex: 1,
            explanation: "Explanation 1",
          },
          {
            question: "Question 2?",
            options: ["X", "Y", "Z"],
            correctIndex: 2,
            explanation: "Explanation 2",
          },
          {
            question: "Question 3?",
            options: ["True", "False"],
            correctIndex: 0,
          },
        ],
      });

      expect(ids).toHaveLength(3);

      const allItems = await t.query(api.functions.quizItems.listByGeneration, {
        generationId: testGenerationId,
      });

      expect(allItems).toHaveLength(3);
      expect(allItems[0].question).toBe("Question 1?");
      expect(allItems[0].order).toBe(0);
      expect(allItems[1].question).toBe("Question 2?");
      expect(allItems[1].order).toBe(1);
      expect(allItems[2].question).toBe("Question 3?");
      expect(allItems[2].order).toBe(2);
      expect(allItems[2].explanation).toBeUndefined();
    });

    it("should throw error if any item has invalid options", async () => {
      await expect(
        t.mutation(api.functions.quizItems.createBatch, {
          generationId: testGenerationId,
          userId: testUserId,
          items: [
            {
              question: "Valid question?",
              options: ["A", "B"],
              correctIndex: 0,
            },
            {
              question: "Invalid question?",
              options: ["Only one"],
              correctIndex: 0,
            },
          ],
        }),
      ).rejects.toThrow("Quiz item 1 must have at least 2 options");
    });

    it("should throw error if any item has out of bounds correctIndex", async () => {
      await expect(
        t.mutation(api.functions.quizItems.createBatch, {
          generationId: testGenerationId,
          userId: testUserId,
          items: [
            {
              question: "Valid question?",
              options: ["A", "B"],
              correctIndex: 0,
            },
            {
              question: "Invalid question?",
              options: ["A", "B"],
              correctIndex: 5,
            },
          ],
        }),
      ).rejects.toThrow("Quiz item 1 has correct index out of bounds");
    });
  });

  describe("listByGeneration", () => {
    it("should return empty array for generation with no items", async () => {
      const items = await t.query(api.functions.quizItems.listByGeneration, {
        generationId: testGenerationId,
      });

      expect(items).toEqual([]);
    });

    it("should return all items for a generation", async () => {
      await t.run(async (ctx) => {
        await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Question 1",
          options: ["A", "B"],
          correctIndex: 0,
          order: 0,
          createdAt: Date.now(),
        });
        await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Question 2",
          options: ["X", "Y"],
          correctIndex: 1,
          order: 1,
          createdAt: Date.now(),
        });
        await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Question 3",
          options: ["True", "False"],
          correctIndex: 0,
          order: 2,
          createdAt: Date.now(),
        });
      });

      const items = await t.query(api.functions.quizItems.listByGeneration, {
        generationId: testGenerationId,
      });

      expect(items).toHaveLength(3);
      expect(items.map((item) => item.question)).toEqual([
        "Question 1",
        "Question 2",
        "Question 3",
      ]);
    });
  });

  describe("get", () => {
    it("should return a quiz item by ID", async () => {
      const id = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Test question?",
          options: ["A", "B", "C"],
          correctIndex: 1,
          order: 0,
          createdAt: Date.now(),
        });
      });

      const item = await t.query(api.functions.quizItems.get, { id });

      expect(item).toBeDefined();
      expect(item?._id).toBe(id);
      expect(item?.question).toBe("Test question?");
    });

    it("should return null for non-existent ID", async () => {
      const item = await t.query(api.functions.quizItems.get, {
        id: "non-existent-id" as Id<"quizItems">,
      });

      expect(item).toBeNull();
    });
  });

  describe("update", () => {
    let itemId: Id<"quizItems">;

    beforeEach(async () => {
      itemId = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Original question?",
          options: ["A", "B", "C"],
          correctIndex: 1,
          explanation: "Original explanation",
          order: 0,
          createdAt: Date.now(),
        });
      });
    });

    it("should update question", async () => {
      await t.mutation(api.functions.quizItems.update, {
        id: itemId,
        question: "Updated question?",
      });

      const item = await t.query(api.functions.quizItems.get, { id: itemId });
      expect(item?.question).toBe("Updated question?");
    });

    it("should update options", async () => {
      await t.mutation(api.functions.quizItems.update, {
        id: itemId,
        options: ["X", "Y", "Z", "W"],
      });

      const item = await t.query(api.functions.quizItems.get, { id: itemId });
      expect(item?.options).toEqual(["X", "Y", "Z", "W"]);
    });

    it("should update correctIndex", async () => {
      await t.mutation(api.functions.quizItems.update, {
        id: itemId,
        correctIndex: 2,
      });

      const item = await t.query(api.functions.quizItems.get, { id: itemId });
      expect(item?.correctIndex).toBe(2);
    });

    it("should update explanation", async () => {
      await t.mutation(api.functions.quizItems.update, {
        id: itemId,
        explanation: "New explanation",
      });

      const item = await t.query(api.functions.quizItems.get, { id: itemId });
      expect(item?.explanation).toBe("New explanation");
    });

    it("should remove explanation when set to undefined", async () => {
      await t.mutation(api.functions.quizItems.update, {
        id: itemId,
        explanation: undefined,
      });

      const item = await t.query(api.functions.quizItems.get, { id: itemId });
      expect(item?.explanation).toBeUndefined();
    });

    it("should update multiple fields", async () => {
      await t.mutation(api.functions.quizItems.update, {
        id: itemId,
        question: "New question?",
        options: ["1", "2", "3"],
        correctIndex: 0,
        explanation: "New explanation",
      });

      const item = await t.query(api.functions.quizItems.get, { id: itemId });
      expect(item?.question).toBe("New question?");
      expect(item?.options).toEqual(["1", "2", "3"]);
      expect(item?.correctIndex).toBe(0);
      expect(item?.explanation).toBe("New explanation");
    });

    it("should throw error if correctIndex is out of bounds with new options", async () => {
      await expect(
        t.mutation(api.functions.quizItems.update, {
          id: itemId,
          options: ["A", "B"],
          correctIndex: 5,
        }),
      ).rejects.toThrow("Correct index is out of bounds");
    });

    it("should throw error for non-existent item", async () => {
      await expect(
        t.mutation(api.functions.quizItems.update, {
          id: "non-existent" as Id<"quizItems">,
          question: "Test?",
        }),
      ).rejects.toThrow("Quiz item not found");
    });
  });

  describe("reorder", () => {
    let item1: Id<"quizItems">;
    let item2: Id<"quizItems">;
    let item3: Id<"quizItems">;

    beforeEach(async () => {
      item1 = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Question 1",
          options: ["A", "B"],
          correctIndex: 0,
          order: 0,
          createdAt: Date.now(),
        });
      });
      item2 = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Question 2",
          options: ["A", "B"],
          correctIndex: 0,
          order: 1,
          createdAt: Date.now(),
        });
      });
      item3 = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "Question 3",
          options: ["A", "B"],
          correctIndex: 0,
          order: 2,
          createdAt: Date.now(),
        });
      });
    });

    it("should reorder items", async () => {
      await t.mutation(api.functions.quizItems.reorder, {
        generationId: testGenerationId,
        orderedIds: [item3, item1, item2],
      });

      const items = await t.query(api.functions.quizItems.listByGeneration, {
        generationId: testGenerationId,
      });

      expect(items[0]._id).toBe(item3);
      expect(items[0].order).toBe(0);
      expect(items[1]._id).toBe(item1);
      expect(items[1].order).toBe(1);
      expect(items[2]._id).toBe(item2);
      expect(items[2].order).toBe(2);
    });

    it("should throw error for invalid item ID", async () => {
      await expect(
        t.mutation(api.functions.quizItems.reorder, {
          generationId: testGenerationId,
          orderedIds: [item1, "invalid-id" as Id<"quizItems">, item3],
        }),
      ).rejects.toThrow("Invalid quiz item");
    });

    it("should throw error for item from different generation", async () => {
      const otherGenId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId: testUserId,
          subjectId: testSubjectId,
          sourceDocumentIds: [testDocumentId],
          name: "Other Quiz",
          type: "quiz",
          status: "generating",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const otherItem = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: otherGenId,
          userId: testUserId,
          question: "Other?",
          options: ["A", "B"],
          correctIndex: 0,
          order: 0,
          createdAt: Date.now(),
        });
      });

      await expect(
        t.mutation(api.functions.quizItems.reorder, {
          generationId: testGenerationId,
          orderedIds: [item1, otherItem, item3],
        }),
      ).rejects.toThrow("Invalid quiz item");
    });
  });

  describe("remove", () => {
    it("should remove a quiz item", async () => {
      const id = await t.run(async (ctx) => {
        return await ctx.db.insert("quizItems", {
          generationId: testGenerationId,
          userId: testUserId,
          question: "To delete?",
          options: ["A", "B"],
          correctIndex: 0,
          order: 0,
          createdAt: Date.now(),
        });
      });

      const removedId = await t.mutation(api.functions.quizItems.remove, { id });
      expect(removedId).toBe(id);

      const item = await t.query(api.functions.quizItems.get, { id });
      expect(item).toBeNull();
    });

    it("should throw error for non-existent item", async () => {
      await expect(
        t.mutation(api.functions.quizItems.remove, {
          id: "non-existent" as Id<"quizItems">,
        }),
      ).rejects.toThrow("Quiz item not found");
    });
  });
});
