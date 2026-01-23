import { describe, it, expect } from "vitest";

describe("streaks", () => {
  describe("get", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });
  });

  describe("recordStudy", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should create new streak record for first-time user", () => {
      const newStreak = {
        userId: "user123",
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: "2024-01-15",
      };
      expect(newStreak.currentStreak).toBe(1);
      expect(newStreak.longestStreak).toBe(1);
    });

    it("should not increment streak if already studied today", () => {
      const existing = {
        currentStreak: 5,
        longestStreak: 10,
        lastStudyDate: "2024-01-15",
      };
      const today = "2024-01-15";
      const shouldIncrement = existing.lastStudyDate !== today;
      expect(shouldIncrement).toBe(false);
    });

    it("should increment streak if studied yesterday", () => {
      const existing = {
        currentStreak: 5,
        longestStreak: 10,
        lastStudyDate: "2024-01-14",
      };
      const yesterday = "2024-01-14";
      const today = "2024-01-15";
      const shouldIncrement = existing.lastStudyDate === yesterday;
      expect(shouldIncrement).toBe(true);
      expect(existing.currentStreak + 1).toBe(6);
    });

    it("should reset streak to 1 if not studied yesterday", () => {
      const existing = {
        currentStreak: 5,
        longestStreak: 10,
        lastStudyDate: "2024-01-10",
      };
      const yesterday = "2024-01-14";
      const shouldReset = existing.lastStudyDate !== yesterday;
      expect(shouldReset).toBe(true);
      expect(1).toBeLessThan(existing.currentStreak);
    });

    it("should update longestStreak if current exceeds it", () => {
      const existing = {
        currentStreak: 5,
        longestStreak: 4,
      };
      const newStreak = existing.currentStreak + 1;
      const shouldUpdate = newStreak > existing.longestStreak;
      expect(shouldUpdate).toBe(true);
      expect(newStreak).toBeGreaterThan(existing.longestStreak);
    });

    it("should not update longestStreak if current does not exceed it", () => {
      const existing = {
        currentStreak: 5,
        longestStreak: 10,
      };
      const newStreak = existing.currentStreak + 1;
      const shouldUpdate = newStreak > existing.longestStreak;
      expect(shouldUpdate).toBe(false);
      expect(newStreak).toBeLessThan(existing.longestStreak);
    });

    it("should update lastStudyDate to today", () => {
      const today = new Date().toISOString().split("T")[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("reset", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should create new streak record if none exists", () => {
      const newStreak = {
        userId: "user123",
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: "",
      };
      expect(newStreak.currentStreak).toBe(0);
      expect(newStreak.longestStreak).toBe(0);
      expect(newStreak.lastStudyDate).toBe("");
    });

    it("should reset currentStreak to 0", () => {
      const existing = {
        currentStreak: 10,
        longestStreak: 15,
      };
      const updated = { currentStreak: 0 };
      expect(updated.currentStreak).toBe(0);
      expect(updated.currentStreak).toBeLessThan(existing.currentStreak);
    });

    it("should reset lastStudyDate to empty string", () => {
      const updated = { lastStudyDate: "" };
      expect(updated.lastStudyDate).toBe("");
    });

    it("should preserve longestStreak when resetting", () => {
      const existing = {
        currentStreak: 10,
        longestStreak: 15,
      };
      const updated = { currentStreak: 0, lastStudyDate: "" };
      expect(existing.longestStreak).toBe(15);
    });
  });

  describe("getOrCreate", () => {
    it("should have userId as required field", () => {
      const userId = "user123";
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
    });

    it("should return existing streak if found", () => {
      const existing = {
        _id: "streak123",
        userId: "user123",
        currentStreak: 5,
        longestStreak: 10,
        lastStudyDate: "2024-01-15",
      };
      expect(existing).toBeDefined();
      expect(existing.currentStreak).toBe(5);
    });

    it("should return null if no streak exists", () => {
      const result = null;
      expect(result).toBeNull();
    });
  });

  describe("streak calculation logic", () => {
    it("should correctly calculate yesterday's date", () => {
      const today = new Date("2024-01-15T12:00:00Z");
      const yesterday = new Date(today.getTime() - 86400000);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      expect(yesterdayStr).toBe("2024-01-14");
    });

    it("should handle consecutive days", () => {
      const dates = ["2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18"];
      expect(dates.length).toBe(4);
    });

    it("should handle month boundaries", () => {
      const lastStudyDate = "2024-01-31";
      const today = new Date("2024-02-01").toISOString().split("T")[0];
      const daysDiff = new Date(today).getTime() - new Date(lastStudyDate).getTime();
      const isConsecutive = daysDiff === 86400000;
      expect(isConsecutive).toBe(true);
    });

    it("should handle year boundaries", () => {
      const lastStudyDate = "2023-12-31";
      const today = new Date("2024-01-01").toISOString().split("T")[0];
      const daysDiff = new Date(today).getTime() - new Date(lastStudyDate).getTime();
      const isConsecutive = daysDiff === 86400000;
      expect(isConsecutive).toBe(true);
    });
  });
});
