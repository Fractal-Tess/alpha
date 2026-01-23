export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface QuizResults {
  score: number;
  total: number;
  correctAnswers: QuizAnswer[];
  wrongAnswers: QuizAnswer[];
}
