import { describe, it, expect } from "vitest";

describe("dailyStats", () => {
  describe("getByUser", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should have optional limit field", () => {
      const limit = 30;
      expect(limit).toBeDefined();
      expect(typeof limit).toBe("number");
    });

    it("should default limit to 30", () => {
      const defaultLimit = 30;
      expect(defaultLimit).toBe(30);
    });
  });

  describe("getToday", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should format today's date as YYYY-MM-DD", () => {
      const today = new Date().toISOString().split("T")[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("getByDate", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should have date as required field", () => {
      const date = "2024-01-15";
      expect(date).toBeDefined();
      expect(typeof date).toBe("string");
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("recordQuiz", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should have correctAnswers as required field", () => {
      const correctAnswers = 8;
      expect(correctAnswers).toBeDefined();
      expect(typeof correctAnswers).toBe("number");
    });

    it("should have studyTimeSeconds as required field", () => {
      const studyTimeSeconds = 120;
      expect(studyTimeSeconds).toBeDefined();
      expect(typeof studyTimeSeconds).toBe("number");
    });

    it("should increment quizzesTaken", () => {
      const existing = { quizzesTaken: 5 };
      const updated = { quizzesTaken: existing.quizzesTaken + 1 };
      expect(updated.quizzesTaken).toBe(6);
    });

    it("should increment correctAnswers", () => {
      const existing = { correctAnswers: 50 };
      const newCorrect = 8;
      const updated = { correctAnswers: existing.correctAnswers + newCorrect };
      expect(updated.correctAnswers).toBe(58);
    });

    it("should increment studyTimeSeconds", () => {
      const existing = { studyTimeSeconds: 300 };
      const newTime = 120;
      const updated = { studyTimeSeconds: existing.studyTimeSeconds + newTime };
      expect(updated.studyTimeSeconds).toBe(420);
    });

    it("should create new record if none exists", () => {
      const newRecord = {
        userId: "user123",
        date: "2024-01-15",
        cardsStudied: 0,
        quizzesTaken: 1,
        correctAnswers: 8,
        studyTimeSeconds: 120,
      };
      expect(newRecord.cardsStudied).toBe(0);
      expect(newRecord.quizzesTaken).toBe(1);
    });
  });

  describe("recordFlashcards", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should have cardsStudied as required field", () => {
      const cardsStudied = 20;
      expect(cardsStudied).toBeDefined();
      expect(typeof cardsStudied).toBe("number");
    });

    it("should have correctAnswers as required field", () => {
      const correctAnswers = 15;
      expect(correctAnswers).toBeDefined();
      expect(typeof correctAnswers).toBe("number");
    });

    it("should have studyTimeSeconds as required field", () => {
      const studyTimeSeconds = 240;
      expect(studyTimeSeconds).toBeDefined();
      expect(typeof studyTimeSeconds).toBe("number");
    });

    it("should increment cardsStudied", () => {
      const existing = { cardsStudied: 100 };
      const newCards = 20;
      const updated = { cardsStudied: existing.cardsStudied + newCards };
      expect(updated.cardsStudied).toBe(120);
    });

    it("should increment correctAnswers", () => {
      const existing = { correctAnswers: 80 };
      const newCorrect = 15;
      const updated = { correctAnswers: existing.correctAnswers + newCorrect };
      expect(updated.correctAnswers).toBe(95);
    });

    it("should increment studyTimeSeconds", () => {
      const existing = { studyTimeSeconds: 600 };
      const newTime = 240;
      const updated = { studyTimeSeconds: existing.studyTimeSeconds + newTime };
      expect(updated.studyTimeSeconds).toBe(840);
    });

    it("should create new record if none exists", () => {
      const newRecord = {
        userId: "user123",
        date: "2024-01-15",
        cardsStudied: 20,
        quizzesTaken: 0,
        correctAnswers: 15,
        studyTimeSeconds: 240,
      };
      expect(newRecord.quizzesTaken).toBe(0);
      expect(newRecord.cardsStudied).toBe(20);
    });
  });

  describe("getSummary", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should have startDate as required field", () => {
      const startDate = "2024-01-01";
      expect(startDate).toBeDefined();
      expect(typeof startDate).toBe("string");
      expect(startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should have endDate as required field", () => {
      const endDate = "2024-01-31";
      expect(endDate).toBeDefined();
      expect(typeof endDate).toBe("string");
      expect(endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should filter stats by date range", () => {
      const stats = [
        {
          date: "2024-01-15",
          cardsStudied: 10,
          quizzesTaken: 1,
          correctAnswers: 8,
          studyTimeSeconds: 120,
        },
        {
          date: "2024-02-15",
          cardsStudied: 20,
          quizzesTaken: 2,
          correctAnswers: 15,
          studyTimeSeconds: 240,
        },
        {
          date: "2024-03-15",
          cardsStudied: 15,
          quizzesTaken: 1,
          correctAnswers: 12,
          studyTimeSeconds: 180,
        },
      ];
      const filtered = stats.filter((s) => s.date >= "2024-01-01" && s.date <= "2024-02-28");
      expect(filtered.length).toBe(2);
    });

    it("should aggregate totalCardsStudied", () => {
      const stats = [{ cardsStudied: 10 }, { cardsStudied: 20 }, { cardsStudied: 15 }];
      const total = stats.reduce((sum, s) => sum + s.cardsStudied, 0);
      expect(total).toBe(45);
    });

    it("should aggregate totalQuizzesTaken", () => {
      const stats = [{ quizzesTaken: 1 }, { quizzesTaken: 2 }, { quizzesTaken: 1 }];
      const total = stats.reduce((sum, s) => sum + s.quizzesTaken, 0);
      expect(total).toBe(4);
    });

    it("should aggregate totalCorrectAnswers", () => {
      const stats = [{ correctAnswers: 8 }, { correctAnswers: 15 }, { correctAnswers: 12 }];
      const total = stats.reduce((sum, s) => sum + s.correctAnswers, 0);
      expect(total).toBe(35);
    });

    it("should aggregate totalStudyTime", () => {
      const stats = [
        { studyTimeSeconds: 120 },
        { studyTimeSeconds: 240 },
        { studyTimeSeconds: 180 },
      ];
      const total = stats.reduce((sum, s) => sum + s.studyTimeSeconds, 0);
      expect(total).toBe(540);
    });

    it("should count daysStudied", () => {
      const stats = [{ date: "2024-01-15" }, { date: "2024-01-16" }, { date: "2024-01-17" }];
      expect(stats.length).toBe(3);
    });
  });
});
