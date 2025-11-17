import { StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import { useState, useRef, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStudy } from "@/providers/study-provider";
import { DECKS } from "@/data/decks";
import Colors from "@/constants/colors";
import { X, RotateCw } from "lucide-react-native";
import type { Flashcard, CardDifficulty } from "@/types/flashcard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StudyScreen() {
  const params = useLocalSearchParams<{ deckId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { flashcards, updateCard } = useStudy();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const deckId = params.deckId || "";
  const deck = DECKS.find((d) => d.id === deckId);

  const dueCards = flashcards.filter((card) => {
    const now = new Date().toISOString();
    return card.deckId === deckId && card.nextReviewDate <= now;
  });

  const currentCard: Flashcard | undefined = dueCards[currentIndex];

  const flipCard = useCallback(() => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  }, [isFlipped, flipAnimation]);

  const handleAnswer = useCallback((difficulty: CardDifficulty) => {
    if (!currentCard) return;

    updateCard({ cardId: currentCard.id, difficulty });

    setIsFlipped(false);
    flipAnimation.setValue(0);

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back();
    }
  }, [currentCard, updateCard, currentIndex, dueCards.length, flipAnimation, router]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  if (!deck) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Deck not found</Text>
      </View>
    );
  }

  if (dueCards.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🎉 All Done!</Text>
          <Text style={styles.emptySubtitle}>No cards due for review right now.</Text>
          <Text style={styles.emptyText}>Come back later or study a different deck.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{deck.name}</Text>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {currentIndex + 1}/{dueCards.length}
          </Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={flipCard}
          style={styles.cardTouchable}
        >
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { transform: [{ rotateY: frontInterpolate }] },
              isFlipped && styles.cardHidden,
            ]}
          >
            <Text style={styles.cardLabel}>Question</Text>
            <Text style={styles.cardText}>{currentCard?.front}</Text>
            <View style={styles.tapHint}>
              <RotateCw size={16} color={Colors.textTertiary} />
              <Text style={styles.tapHintText}>Tap to flip</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { transform: [{ rotateY: backInterpolate }] },
              !isFlipped && styles.cardHidden,
            ]}
          >
            <Text style={styles.cardLabel}>Answer</Text>
            <Text style={styles.cardText}>{currentCard?.back}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {isFlipped && (
        <View style={styles.answerSection}>
          <Text style={styles.answerTitle}>How well did you know this?</Text>
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[styles.answerButton, styles.answerButtonAgain]}
              onPress={() => handleAnswer("again")}
            >
              <Text style={styles.answerButtonText}>Again</Text>
              <Text style={styles.answerButtonSubtext}>&lt;1m</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerButton, styles.answerButtonHard]}
              onPress={() => handleAnswer("hard")}
            >
              <Text style={styles.answerButtonText}>Hard</Text>
              <Text style={styles.answerButtonSubtext}>1d</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerButton, styles.answerButtonGood]}
              onPress={() => handleAnswer("good")}
            >
              <Text style={styles.answerButtonText}>Good</Text>
              <Text style={styles.answerButtonSubtext}>6d</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.answerButton, styles.answerButtonEasy]}
              onPress={() => handleAnswer("easy")}
            >
              <Text style={styles.answerButtonText}>Easy</Text>
              <Text style={styles.answerButtonSubtext}>10d+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  progressBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "center",
  },
  cardTouchable: {
    flex: 1,
    maxHeight: 500,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardFront: {},
  cardBack: {},
  cardHidden: {
    opacity: 0,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 36,
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 24,
  },
  tapHintText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  answerSection: {
    padding: 20,
    paddingBottom: 32,
  },
  answerTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  answerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  answerButtonAgain: {
    backgroundColor: Colors.error,
  },
  answerButtonHard: {
    backgroundColor: Colors.warning,
  },
  answerButtonGood: {
    backgroundColor: Colors.success,
  },
  answerButtonEasy: {
    backgroundColor: Colors.primary,
  },
  answerButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  answerButtonSubtext: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: "center",
  },
});
