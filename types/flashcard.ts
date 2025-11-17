export type CardDifficulty = "again" | "hard" | "good" | "easy";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate?: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPremium: boolean;
  totalCards: number;
  newCards: number;
  reviewCards: number;
  category: string;
}

export interface StudySession {
  date: string;
  cardsReviewed: number;
  timeSpent: number;
  deckId: string;
}

export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalCardsReviewed: number;
  totalStudyTime: number;
  lastStudyDate?: string;
  dailyGoal: number;
  todayCardsReviewed: number;
}
