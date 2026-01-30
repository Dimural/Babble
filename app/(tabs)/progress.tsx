import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';
import { lessonModules } from '@/data/lessons';
import { useProgress } from '@/hooks/use-progress';

export default function ProgressScreen() {
  const { progress, loading } = useProgress();

  if (loading || !progress) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  const lessons = lessonModules.flatMap((module) => module.lessons);
  const completedLessons = lessons.filter((lesson) =>
    progress.completedLessonIds.includes(lesson.id),
  ).length;
  const totalLessons = lessons.length;
  const completionRate = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const modulesCompleted = lessonModules.filter((module) =>
    module.lessons.every((lesson) => progress.completedLessonIds.includes(lesson.id)),
  ).length;

  const streakDays = 3;

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Keep it gentle and steady. Small steps add up.</Text>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryWarm]}>
            <Text style={styles.summaryValue}>{streakDays}</Text>
            <Text style={styles.summaryLabel}>Day streak</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCool]}>
            <Text style={styles.summaryValue}>{completedLessons}</Text>
            <Text style={styles.summaryLabel}>Lessons done</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryNeutral]}>
            <Text style={styles.summaryValue}>{modulesCompleted}</Text>
            <Text style={styles.summaryLabel}>Modules done</Text>
          </View>
        </View>
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Overall completion</Text>
          <Text style={styles.cardValue}>{completionRate}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
          <Text style={styles.cardHint}>
            You have completed {completedLessons} of {totalLessons} lessons.
          </Text>
        </View>
        <View style={styles.moduleSection}>
          <Text style={styles.sectionTitle}>Modules</Text>
          {lessonModules.map((module) => {
            const moduleTotal = module.lessons.length;
            const moduleDone = module.lessons.filter((lesson) =>
              progress.completedLessonIds.includes(lesson.id),
            ).length;
            const moduleRate = moduleTotal ? Math.round((moduleDone / moduleTotal) * 100) : 0;
            return (
              <View key={module.id} style={styles.moduleCard}>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleValue}>{moduleRate}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${moduleRate}%` }]} />
                </View>
                <Text style={styles.moduleHint}>
                  {moduleDone} of {moduleTotal} lessons complete
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: babbleColors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: babbleColors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    gap: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: babbleColors.text,
    fontFamily: babbleTypography.heading,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: babbleColors.muted,
    fontFamily: babbleTypography.body,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: babbleRadii.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: babbleColors.outline,
  },
  summaryWarm: {
    backgroundColor: '#fff1e9',
  },
  summaryCool: {
    backgroundColor: '#eff8f8',
  },
  summaryNeutral: {
    backgroundColor: '#fffaf6',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: babbleColors.text,
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    color: babbleColors.muted,
  },
  overviewCard: {
    padding: 18,
    borderRadius: babbleRadii.card,
    backgroundColor: babbleColors.card,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    gap: 10,
    ...babbleShadow,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.text,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '700',
    color: babbleColors.primaryText,
  },
  cardHint: {
    fontSize: 12,
    color: babbleColors.muted,
  },
  progressBar: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#f1e2dc',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: babbleColors.secondary,
  },
  moduleSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: babbleColors.text,
  },
  moduleCard: {
    padding: 16,
    borderRadius: babbleRadii.card,
    backgroundColor: '#fffaf6',
    borderWidth: 1,
    borderColor: babbleColors.outline,
    gap: 8,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: babbleColors.text,
  },
  moduleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.primaryText,
  },
  moduleHint: {
    fontSize: 12,
    color: babbleColors.muted,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 210,
    height: 210,
    backgroundColor: '#fde2d5',
    top: -80,
    left: -80,
  },
});
