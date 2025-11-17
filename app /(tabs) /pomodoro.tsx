import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import Colors from "@/constants/colors";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react-native";

const WORK_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type TimerMode = "work" | "shortBreak" | "longBreak";

export default function PomodoroScreen() {
  const [timeLeft, setTimeLeft] = useState<number>(WORK_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (mode === "work") {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      if (newSessions % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(LONG_BREAK);
      } else {
        setMode("shortBreak");
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setMode("work");
      setTimeLeft(WORK_TIME);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === "work") {
      setTimeLeft(WORK_TIME);
    } else if (mode === "shortBreak") {
      setTimeLeft(SHORT_BREAK);
    } else {
      setTimeLeft(LONG_BREAK);
    }
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "work") {
      setTimeLeft(WORK_TIME);
    } else if (newMode === "shortBreak") {
      setTimeLeft(SHORT_BREAK);
    } else {
      setTimeLeft(LONG_BREAK);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime = mode === "work" ? WORK_TIME : mode === "shortBreak" ? SHORT_BREAK : LONG_BREAK;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const getBackgroundColor = () => {
    switch (mode) {
      case "work":
        return Colors.primary;
      case "shortBreak":
        return Colors.success;
      case "longBreak":
        return Colors.accent;
    }
  };

  const getModeInfo = () => {
    switch (mode) {
      case "work":
        return { label: "Focus Time", icon: Brain };
      case "shortBreak":
        return { label: "Short Break", icon: Coffee };
      case "longBreak":
        return { label: "Long Break", icon: Coffee };
    }
  };

  const modeInfo = getModeInfo();
  const ModeIcon = modeInfo.icon;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Pomodoro Timer</Text>
        <Text style={styles.subtitle}>Stay focused, stay productive</Text>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === "work" && styles.modeButtonActive]}
          onPress={() => switchMode("work")}
        >
          <Text style={[styles.modeButtonText, mode === "work" && styles.modeButtonTextActive]}>
            Focus
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === "shortBreak" && styles.modeButtonActive]}
          onPress={() => switchMode("shortBreak")}
        >
          <Text
            style={[styles.modeButtonText, mode === "shortBreak" && styles.modeButtonTextActive]}
          >
            Short Break
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === "longBreak" && styles.modeButtonActive]}
          onPress={() => switchMode("longBreak")}
        >
          <Text
            style={[styles.modeButtonText, mode === "longBreak" && styles.modeButtonTextActive]}
          >
            Long Break
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.timerContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.timerCircle}>
          <View style={styles.progressRing}>
            <View
              style={[
                styles.progressFill,
                {
                  borderColor: getBackgroundColor(),
                  borderLeftColor: "transparent",
                  borderBottomColor: "transparent",
                  transform: [{ rotate: `${progress * 3.6}deg` }],
                },
              ]}
            />
          </View>
          <View style={styles.timerContent}>
            <View style={styles.modeIndicator}>
              <ModeIcon size={28} color={getBackgroundColor()} />
              <Text style={[styles.modeLabel, { color: getBackgroundColor() }]}>
                {modeInfo.label}
              </Text>
            </View>
            <Text style={styles.timerText}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </Text>
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
                <RotateCcw size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mainButton, { backgroundColor: getBackgroundColor() }]}
                onPress={toggleTimer}
              >
                {isRunning ? (
                  <Pause size={32} color="#FFFFFF" />
                ) : (
                  <Play size={32} color="#FFFFFF" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{sessionsCompleted}</Text>
          <Text style={styles.statLabel}>Sessions Today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.floor(sessionsCompleted * 25)}</Text>
          <Text style={styles.statLabel}>Minutes Focused</Text>
        </View>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Pomodoro Tips</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>• Work in focused 25-minute intervals</Text>
          <Text style={styles.tipText}>• Take short 5-minute breaks between sessions</Text>
          <Text style={styles.tipText}>• After 4 sessions, take a longer 15-minute break</Text>
          <Text style={styles.tipText}>• Eliminate distractions during focus time</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modeSelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  modeButtonTextActive: {
    color: "#FFFFFF",
  },
  timerContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  timerCircle: {
    width: 320,
    height: 320,
    position: "relative",
  },
  progressRing: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 160,
    borderWidth: 8,
    borderColor: Colors.borderLight,
  },
  progressFill: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 160,
    borderWidth: 8,
  },
  timerContent: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modeIndicator: {
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  timerText: {
    fontSize: 64,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 24,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  statsSection: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 48,
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  tipsSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  tipText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
