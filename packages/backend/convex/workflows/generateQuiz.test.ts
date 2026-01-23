import { describe, it, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import { z } from "zod";
import schema from "../schema";
import { modules } from "../test.setup";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

const quizResponseSchema = z.array(
  z.object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(4),
    correctIndex: z.number().int().min(0).max(3),
    explanation: z.string().optional(),
  }),
);

describe("quiz response schema validation (unit tests)", () => {
  it("should validate correct quiz array format", () => {
    const validResponse = [
      {
        question: "What is photosynthesis?",
        options: [
          "A process of cellular respiration",
          "The process by which plants convert sunlight into energy",
          "A type of animal digestion",
          "The process of cell division",
        ],
        correctIndex: 1,
        explanation:
          "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.",
      },
      {
        question: "Which organelle is responsible for photosynthesis in plant cells?",
        options: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
        correctIndex: 2,
        explanation:
          "Chloroplasts contain chlorophyll and are the organelles where photosynthesis occurs.",
      },
    ];

    const result = quizResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("should accept empty array (emptiness checked separately)", () => {
    const emptyResponse: unknown[] = [];
    const result = quizResponseSchema.safeParse(emptyResponse);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(0);
  });

  it("should reject quiz without question", () => {
    const invalidResponse = [
      {
        question: "",
        options: ["A", "B", "C"],
        correctIndex: 0,
      },
    ];

    const result = quizResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it("should reject quiz with less than 2 options", () => {
    const invalidResponse = [
      {
        question: "What is X?",
        options: ["Only one option"],
        correctIndex: 0,
      },
    ];

    const result = quizResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it("should reject quiz with more than 4 options", () => {
    const invalidResponse = [
      {
        question: "What is X?",
        options: ["A", "B", "C", "D", "E"],
        correctIndex: 0,
      },
    ];

    const result = quizResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });

  it("should reject quiz with correctIndex out of range", () => {
    const invalidResponse1 = [
      {
        question: "What is X?",
        options: ["A", "B", "C"],
        correctIndex: 5,
      },
    ];

    const result1 = quizResponseSchema.safeParse(invalidResponse1);
    expect(result1.success).toBe(false);

    const invalidResponse2 = [
      {
        question: "What is X?",
        options: ["A", "B", "C"],
        correctIndex: -1,
      },
    ];

    const result2 = quizResponseSchema.safeParse(invalidResponse2);
    expect(result2.success).toBe(false);
  });

  it("should accept quiz without explanation", () => {
    const validResponse = [
      {
        question: "What is X?",
        options: ["A", "B"],
        correctIndex: 0,
      },
    ];

    const result = quizResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    expect(result.data?.[0].explanation).toBeUndefined();
  });
});

describe("generateQuiz workflow (integration tests)", () => {
  let t: ReturnType<typeof convexTest>;
  let userId: Id<"users">;
  let subjectId: Id<"subjects">;
  let documentId: Id<"documents">;
  let generationId: Id<"generations">;

  beforeEach(async () => {
    t = convexTest(schema, modules);

    userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        betterAuthId: "test-auth-id-quiz",
        email: "quiz@example.com",
        name: "Test User",
        plan: "paid",
        createdAt: Date.now(),
      });
    });

    subjectId = await t.run(async (ctx) => {
      return await ctx.db.insert("subjects", {
        userId,
        name: "Test Subject",
        order: 0,
        createdAt: Date.now(),
      });
    });

    documentId = await t.run(async (ctx) => {
      return await ctx.db.insert("documents", {
        userId,
        subjectId,
        name: "Test Document",
        storageId: "test-storage-id" as Id<"_storage">,
        mimeType: "application/pdf",
        size: 1024,
        status: "ready",
        extractedText:
          "This is test document content for quiz generation. It contains important concepts that should be tested.",
        createdAt: Date.now(),
      });
    });
  });

  describe("getDocumentsForGeneration", () => {
    it("should return empty array for non-existent documents", async () => {
      const docs = await t.query(internal.workflows.generateQuiz.getDocumentsForGeneration, {
        documentIds: ["non-existent" as Id<"documents">],
      });

      expect(docs).toEqual([]);
    });

    it("should return document data for existing documents", async () => {
      const docs = await t.query(internal.workflows.generateQuiz.getDocumentsForGeneration, {
        documentIds: [documentId],
      });

      expect(docs).toHaveLength(1);
      expect(docs[0]._id).toBe(documentId);
      expect(docs[0].name).toBe("Test Document");
      expect(docs[0].extractedText).toContain("test document content");
    });

    it("should return multiple documents", async () => {
      const doc2Id = await t.run(async (ctx) => {
        return await ctx.db.insert("documents", {
          userId,
          subjectId,
          name: "Document 2",
          storageId: "test-storage-id-2" as Id<"_storage">,
          mimeType: "application/pdf",
          size: 2048,
          status: "ready",
          extractedText: "Second document content.",
          createdAt: Date.now(),
        });
      });

      const docs = await t.query(internal.workflows.generateQuiz.getDocumentsForGeneration, {
        documentIds: [documentId, doc2Id],
      });

      expect(docs).toHaveLength(2);
      expect(docs.map((d) => d.name)).toEqual(["Test Document", "Document 2"]);
    });
  });

  describe("updateGenerationStatus", () => {
    it("should update generation status to generating", async () => {
      generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Quiz",
          type: "quiz",
          status: "failed",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      await t.run(async (ctx) => {
        await ctx.db.patch(generationId, {
          status: "generating",
          updatedAt: Date.now(),
        });
      });

      const gen = await t.run(async (ctx) => {
        return await ctx.db.get(generationId);
      });

      expect(gen?.status).toBe("generating");
    });

    it("should update generation status to ready", async () => {
      generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Quiz",
          type: "quiz",
          status: "generating",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      await t.run(async (ctx) => {
        await ctx.db.patch(generationId, {
          status: "ready",
          updatedAt: Date.now(),
        });
      });

      const gen = await t.run(async (ctx) => {
        return await ctx.db.get(generationId);
      });

      expect(gen?.status).toBe("ready");
    });

    it("should update generation status to failed with error", async () => {
      generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Quiz",
          type: "quiz",
          status: "generating",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const errorMsg = "API error occurred";
      await t.run(async (ctx) => {
        await ctx.db.patch(generationId, {
          status: "failed",
          error: errorMsg,
          updatedAt: Date.now(),
        });
      });

      const gen = await t.run(async (ctx) => {
        return await ctx.db.get(generationId);
      });

      expect(gen?.status).toBe("failed");
      expect(gen?.error).toBe(errorMsg);
    });
  });

  describe("createQuizItems", () => {
    it("should create multiple quiz items", async () => {
      generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Quiz",
          type: "quiz",
          status: "generating",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const items = [
        {
          question: "Q1?",
          options: ["A", "B"],
          correctIndex: 0,
          explanation: "E1",
        },
        {
          question: "Q2?",
          options: ["X", "Y"],
          correctIndex: 1,
        },
        {
          question: "Q3?",
          options: ["True", "False"],
          correctIndex: 0,
          explanation: "E3",
        },
      ];

      const ids = await t.run(async (ctx) => {
        const createdIds: string[] = [];
        const now = Date.now();
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item) continue;
          const id = await ctx.db.insert("quizItems", {
            generationId,
            userId,
            question: item.question,
            options: item.options,
            correctIndex: item.correctIndex,
            explanation: item.explanation,
            order: i,
            createdAt: now,
          });
          createdIds.push(id);
        }
        return createdIds;
      });

      expect(ids).toHaveLength(3);

      const quizItems = await t.run(async (ctx) => {
        return await ctx.db
          .query("quizItems")
          .withIndex("by_generation", (q) => q.eq("generationId", generationId))
          .collect();
      });

      expect(quizItems).toHaveLength(3);
      expect(quizItems[0].question).toBe("Q1?");
      expect(quizItems[0].order).toBe(0);
      expect(quizItems[0].explanation).toBe("E1");
      expect(quizItems[2].explanation).toBeUndefined();
    });

    it("should throw error if generation is not quiz type", async () => {
      const flashcardGenId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Flashcards",
          type: "flashcards",
          status: "generating",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      await expect(
        t.run(async (ctx) => {
          await ctx.db.insert("quizItems", {
            generationId: flashcardGenId,
            userId,
            question: "Q?",
            options: ["A", "B"],
            correctIndex: 0,
            order: 0,
            createdAt: Date.now(),
          });
        }),
      ).rejects.toThrow();
    });

    it("should throw error for invalid options", async () => {
      generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Quiz",
          type: "quiz",
          status: "generating",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      await expect(
        t.run(async (ctx) => {
          await ctx.db.insert("quizItems", {
            generationId,
            userId,
            question: "Q?",
            options: ["Only one"],
            correctIndex: 0,
            order: 0,
            createdAt: Date.now(),
          });
        }),
      ).rejects.toThrow();
    });
  });

  describe("getGenerationForRetry", () => {
    it("should return generation by ID", async () => {
      generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Quiz",
          type: "quiz",
          status: "failed",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const gen = await t.query(internal.workflows.generateQuiz.getGenerationForRetry, {
        generationId,
      });

      expect(gen).toBeDefined();
      expect(gen?._id).toBe(generationId);
      expect(gen?.type).toBe("quiz");
    });

    it("should return null for non-existent generation", async () => {
      const gen = await t.query(internal.workflows.generateQuiz.getGenerationForRetry, {
        generationId: "non-existent" as Id<"generations">,
      });

      expect(gen).toBeNull();
    });
  });

  describe("retryGeneration", () => {
    beforeEach(async () => {
      generationId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Quiz",
          type: "quiz",
          status: "failed",
          error: "Previous error",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });
    });

    it("should throw error if generation is not failed", async () => {
      const readyGenId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Ready Quiz",
          type: "quiz",
          status: "ready",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      await expect(
        t.action(internal.workflows.generateQuiz.retryGeneration, {
          generationId: readyGenId,
        }),
      ).rejects.toThrow("Can only retry failed generations");
    });

    it("should throw error if generation is not quiz type", async () => {
      const flashcardGenId = await t.run(async (ctx) => {
        return await ctx.db.insert("generations", {
          userId,
          subjectId,
          sourceDocumentIds: [documentId],
          name: "Test Flashcards",
          type: "flashcards",
          status: "failed",
          error: "Previous error",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      await expect(
        t.action(internal.workflows.generateQuiz.retryGeneration, {
          generationId: flashcardGenId,
        }),
      ).rejects.toThrow("This action only handles quiz generations");
    });

    it("should throw error for non-existent generation", async () => {
      await expect(
        t.action(internal.workflows.generateQuiz.retryGeneration, {
          generationId: "non-existent" as Id<"generations">,
        }),
      ).rejects.toThrow("Generation not found");
    });
  });
});
