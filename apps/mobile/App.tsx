import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { APP_NAME, GOAL_TYPES, SLOGAN } from '@onward/contracts';
import { colors, radii, spacing, typography } from '@onward/design-tokens';
import { calculateCompletionRate } from '@onward/domain';

const sampleCompletionRate = Math.round(calculateCompletionRate(4, 5) * 100);

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Milestone 0</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>{SLOGAN}</Text>
        <Text style={styles.copy}>
          React Native 앱 골격이 준비되었습니다. 다음 단계에서는 오늘 화면과
          빠른 기록 UX를 우선 구현합니다.
        </Text>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{sampleCompletionRate}%</Text>
            <Text style={styles.metricLabel}>sample completion</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{GOAL_TYPES.length}</Text>
            <Text style={styles.metricLabel}>goal types</Text>
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    padding: spacing.lg,
  },
  card: {
    borderRadius: radii.lg,
    backgroundColor: colors.panel,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  eyebrow: {
    color: colors.accentStrong,
    fontSize: typography.eyebrow,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.accentStrong,
    fontSize: typography.body,
    fontWeight: '600',
  },
  copy: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  metricCard: {
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: '#f8fafc',
    padding: spacing.md,
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: typography.eyebrow,
    marginTop: spacing.xs,
  },
});
