import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Home as HomeIcon, TrendingUp, Target, Calendar } from "lucide-react-native";
import { useStudy } from "@/providers/study-provider";
import { DECKS } from "@/data/decks";
import { INITIAL_FLASHCARDS } from "@/data/flashcards";
import Colors from "@/constants/colors";
import { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const { progress, flashcards, initializeCards } = useStudy();

  useEffect(() => {
    if (flashcards.length === 0) {
      console.log("Initializing flashcards...");
      initializeCards(INITIAL_FLASHCARDS);
    }
  }, [flashcards.length, initializeCards]);

  const getDeckStats = (deckId: string) => {
    const deckCards = flashcards.filter((c) => c.deckId === deckId);
    const now = new Date().toISOString();
    const dueCards = deckCards.filter((c) => c.nextReviewDate <= now);
    const newCards = deckCards.filter((c) => c.repetitions === 0);

    return {
      total: deckCards.length,
      due: dueCards.length,
      new: newCards.length,
    };
  };

  const goalProgress = progress.dailyGoal > 0 
    ? Math.min((progress.todayCardsReviewed / progress.dailyGoal) * 100, 100) 
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.subtitle}>Ready to ace your exams?</Text>
        </View>
      </View>

      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.streakCard}
      >
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <TrendingUp size={28} color="#FFF" />
            <Text style={styles.streakNumber}>{progress.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.streakItem}>
            <Target size={28} color="#FFF" />
            <Text style={styles.streakNumber}>{progress.todayCardsReviewed}/{progress.dailyGoal}</Text>
            <Text style={styles.streakLabel}>Daily Goal</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
          <Text style={styles.progressPercent}>{Math.round(goalProgress)}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${goalProgress}%` }]} />
        </View>
        <Text style={styles.progressSubtext}>
          {progress.dailyGoal - progress.todayCardsReviewed > 0
            ? `${progress.dailyGoal - progress.todayCardsReviewed} cards left to reach your goal`
            : "You&apos;ve reached your daily goal! 🎉"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Calendar size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{progress.totalCardsReviewed}</Text>
            <Text style={styles.statLabel}>Cards Reviewed</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color={Colors.accent} />
            <Text style={styles.statNumber}>{progress.longestStreak}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Decks</Text>
        <View style={styles.decksContainer}>
          {DECKS.map((deck) => {
            const stats = getDeckStats(deck.id);
            return (
              <TouchableOpacity
                key={deck.id}
                style={styles.deckCard}
                onPress={() => {
                  if (deck.isPremium) {
                    router.push("/(tabs)/profile");
                  } else {
                    router.push({
                      pathname: "/(tabs)/study",
                      params: { deckId: deck.id }
                    });
                  }
                }}
              >
                <View style={[styles.deckIcon, { backgroundColor: deck.color + "20" }]}>
                  <HomeIcon size={24} color={deck.color} />
                </View>
                <View style={styles.deckInfo}>
                  <View style={styles.deckHeader}>
                    <Text style={styles.deckName}>{deck.name}</Text>
                    {deck.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumText}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.deckDescription}>{deck.description}</Text>
                  <View style={styles.deckStats}>
                    <Text style={styles.deckStatText}>
                      {stats.due > 0 ? `${stats.due} due` : "No cards due"}
                      {stats.new > 0 ? ` • ${stats.new} new` : ""}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  streakCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  streakItem: {
    alignItems: "center",
    flex: 1,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginTop: 8,
  },
  streakLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  progressSection: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  decksContainer: {
    gap: 12,
  },
  deckCard: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  deckIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  deckInfo: {
    flex: 1,
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deckName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  premiumBadge: {
    backgroundColor: Colors.premiumLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.premium,
  },
  deckDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  deckStats: {
    marginTop: 8,
  },
  deckStatText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
});
