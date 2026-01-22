# SM-2 Spaced Repetition Algorithm

```typescript
// packages/convex/functions/flashcards.ts

interface SM2Input {
  quality: number; // 0-5 rating (0-2 = fail, 3-5 = pass)
  easeFactor: number; // Current ease factor
  interval: number; // Current interval in days
  repetitions: number; // Current repetition count
}

interface SM2Output {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: number; // Timestamp
}

function calculateSM2(input: SM2Input): SM2Output {
  const { quality, easeFactor, interval, repetitions } = input;

  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  const nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
  };
}
```
