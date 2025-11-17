import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useStudy } from "@/providers/study-provider";
import Colors from "@/constants/colors";
import { Crown, TrendingUp, Target, Calendar, Settings, BookOpen } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const { progress } = useStudy();

  const stats = [
    {
      icon: BookOpen,
      label: "Cards Reviewed",
      value: progress.totalCardsReviewed.toString(),
      color: Colors.primary,
    },
    {
      icon: TrendingUp,
      label: "Current Streak",
      value: `${progress.currentStreak} days`,
      color: Colors.accent,
    },
    {
      icon: Target,
      label: "Longest Streak",
      value: `${progress.longestStreak} days`,
      color: Colors.success,
    },
    {
      icon: Calendar,
      label: "Study Time",
      value: `${Math.floor(progress.totalStudyTime / 60)}h`,
      color: Colors.warning,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>📚</Text>
          </View>
        </View>
        <Text style={styles.name}>Exam Warrior</Text>
        <Text style={styles.email}>Keep pushing forward!</Text>
      </View>

      <LinearGradient
        colors={[Colors.premium, "#F97316"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.premiumCard}
      >
        <View style={styles.premiumHeader}>
          <Crown size={32} color="#FFFFFF" />
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
        </View>
        <Text style={styles.premiumTitle}>Unlock Premium Features</Text>
        <Text style={styles.premiumDescription}>
          Get access to Static GK, Current Affairs, and 1000+ flashcards
        </Text>
        <View style={styles.premiumFeatures}>
          <Text style={styles.premiumFeature}>✓ All Premium Decks</Text>
          <Text style={styles.premiumFeature}>✓ Advanced Analytics</Text>
          <Text style={styles.premiumFeature}>✓ Custom Study Plans</Text>
          <Text style={styles.premiumFeature}>✓ Ad-free Experience</Text>
        </View>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
          <Text style={styles.upgradeButtonPrice}>₹499/year</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
                  <Icon size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Target size={20} color={Colors.textSecondary} />
              <Text style={styles.settingText}>Daily Goal</Text>
            </View>
            <Text style={styles.settingValue}>{progress.dailyGoal} cards</Text>
          </TouchableOpacity>
          <View style={styles.settingDivider} />
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Settings size={20} color={Colors.textSecondary} />
              <Text style={styles.settingText}>App Settings</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
        <Text style={styles.footerText}>Made with ❤️ for exam warriors</Text>
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
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  avatarText: {
    fontSize: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  premiumCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  premiumBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 20,
    lineHeight: 24,
  },
  premiumFeatures: {
    marginBottom: 24,
    gap: 8,
  },
  premiumFeature: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "500" as const,
  },
  upgradeButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.premium,
  },
  upgradeButtonPrice: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 32,
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
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  settingValue: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
});
