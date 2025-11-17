import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import type { Flashcard, UserProgress, CardDifficulty } from "@/types/flashcard";

const STORAGE_KEYS = {
  FLASHCARDS: "flashcards",
  PROGRESS: "user_progress",
  SESSIONS: "study_sessions",
} as const;

function calculateNextReview(
  card: Flashcard,
  difficulty: CardDifficulty
): { easeFactor: number; interval: number; repetitions: number; nextReviewDate: string } {
  let { easeFactor, interval, repetitions } = card;

  if (difficulty === "again") {
    repetitions = 0;
    interval = 1;
  } else {
    if (difficulty === "hard") {
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (difficulty === "good") {
      easeFactor = Math.max(1.3, easeFactor);
    } else if (difficulty === "easy") {
      easeFactor = easeFactor + 0.15;
    }

    repetitions += 1;

    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextDate.toISOString(),
  };
}

export const [StudyProvider, useStudy] = createContextHook(() => {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const flashcardsQuery = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const progressQuery = useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      return stored
        ? JSON.parse(stored)
        : {
            currentStreak: 0,
            longestStreak: 0,
            totalCardsReviewed: 0,
            totalStudyTime: 0,
            dailyGoal: 20,
            todayCardsReviewed: 0,
          };
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({
      cardId,
      difficulty,
    }: {
      cardId: string;
      difficulty: CardDifficulty;
    }) => {
      const cards: Flashcard[] = flashcardsQuery.data || [];
      const cardIndex = cards.findIndex((c) => c.id === cardId);

      if (cardIndex === -1) throw new Error("Card not found");

      const card = cards[cardIndex];
      const updates = calculateNextReview(card, difficulty);

      const updatedCard: Flashcard = {
        ...card,
        ...updates,
        lastReviewDate: new Date().toISOString(),
      };

      cards[cardIndex] = updatedCard;

      await AsyncStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));

      const progress: UserProgress = progressQuery.data || {
        currentStreak: 0,
        longestStreak: 0,
        totalCardsReviewed: 0,
        totalStudyTime: 0,
        dailyGoal: 20,
        todayCardsReviewed: 0,
      };

      const today = new Date().toDateString();
      const lastStudy = progress.lastStudyDate
        ? new Date(progress.lastStudyDate).toDateString()
        : null;

      if (lastStudy !== today) {
        progress.todayCardsReviewed = 0;
      }

      progress.todayCardsReviewed += 1;
      progress.totalCardsReviewed += 1;
      progress.lastStudyDate = new Date().toISOString();

      if (lastStudy === today) {
      } else if (
        lastStudy ===
        new Date(Date.now() - 86400000).toDateString()
      ) {
        progress.currentStreak += 1;
        progress.longestStreak = Math.max(
          progress.longestStreak,
          progress.currentStreak
        );
      } else {
        progress.currentStreak = 1;
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.PROGRESS,
        JSON.stringify(progress)
      );

      return { cards, progress };
    },
    onSuccess: (data) => {
      flashcardsQuery.refetch();
      progressQuery.refetch();
    },
  });

  const initializeMutation = useMutation({
    mutationFn: async (cards: Flashcard[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
      return cards;
    },
    onSuccess: () => {
      flashcardsQuery.refetch();
    },
  });

  const flashcards = flashcardsQuery.data || [];
  const progress: UserProgress = progressQuery.data || {
    currentStreak: 0,
    longestStreak: 0,
    totalCardsReviewed: 0,
    totalStudyTime: 0,
    dailyGoal: 20,
    todayCardsReviewed: 0,
  };

  const getDueCards = useCallback((deckId: string): Flashcard[] => {
    const now = new Date().toISOString();
    return flashcards.filter(
      (card) => card.deckId === deckId && card.nextReviewDate <= now
    );
  }, [flashcards]);

  const getNewCards = useCallback((deckId: string): Flashcard[] => {
    return flashcards.filter(
      (card) => card.deckId === deckId && card.repetitions === 0
    );
  }, [flashcards]);

  return useMemo(() => ({
    flashcards,
    progress,
    selectedDeckId,
    setSelectedDeckId,
    updateCard: updateCardMutation.mutate,
    initializeCards: initializeMutation.mutate,
    getDueCards,
    getNewCards,
    isLoading: flashcardsQuery.isLoading || progressQuery.isLoading,
  }), [
    flashcards,
    progress,
    selectedDeckId,
    setSelectedDeckId,
    updateCardMutation.mutate,
    initializeMutation.mutate,
    getDueCards,
    getNewCards,
    flashcardsQuery.isLoading,
    progressQuery.isLoading,
  ]);
});
