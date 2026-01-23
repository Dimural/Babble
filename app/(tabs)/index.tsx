import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { babbleColors, babbleRadii, babbleShadow, babbleTypography } from '@/constants/babble-theme';
import { lessonModules } from '@/data/lessons';
import { firebase } from '@/lib/firebase';

type LessonPreview = {
  id: string;
  title: string;
  duration: string;
  moduleTitle: string;
  completed: boolean;
  locked?: boolean;
  moduleLocked: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setEmail(user?.email ?? null);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  if (!authReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!email) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const lessons: LessonPreview[] = lessonModules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleTitle: module.title,
      moduleLocked: module.locked ?? false,
    })),
  );

  const completedCount = lessons.filter((lesson) => lesson.completed).length;
  const totalCount = lessons.length;
  const completionRate = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const modulesCompleted = lessonModules.filter((module) =>
    module.lessons.every((lesson) => lesson.completed),
  ).length;

  const nextLesson =
    lessons.find((lesson) => !lesson.completed && !lesson.locked && !lesson.moduleLocked) ??
    lessons[0];

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>babble</Text>
          <View style={styles.streakBadge}>
            <Text style={styles.streakLabel}>Streak</Text>
            <Text style={styles.streakValue}>3</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Welcome back, {email ?? ''}</Text>
        <Text style={styles.title}>Daily lesson</Text>
        <View style={[styles.card, styles.dailyCard]}>
          <Text style={styles.cardEyebrow}>Up next</Text>
          <Text style={styles.cardTitle}>{nextLesson?.title ?? 'Start your journey'}</Text>
          <Text style={styles.cardMeta}>
            {nextLesson?.duration ?? '3 min'} - {nextLesson?.moduleTitle ?? 'Getting Started'}
          </Text>
          <Pressable
            onPress={() => router.push(`/lesson/${nextLesson?.id ?? 'lesson-1'}`)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Continue Lesson</Text>
          </Pressable>
        </View>
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your progress</Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressCard, styles.progressCardWarm]}>
              <Text style={styles.progressValue}>{completionRate}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
            <View style={[styles.progressCard, styles.progressCardCool]}>
              <Text style={styles.progressValue}>{completedCount}</Text>
              <Text style={styles.progressLabel}>Lessons</Text>
            </View>
            <View style={[styles.progressCard, styles.progressCardNeutral]}>
              <Text style={styles.progressValue}>{modulesCompleted}</Text>
              <Text style={styles.progressLabel}>Modules</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
          </View>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>{"Today's gentle tip"}</Text>
          <Text style={styles.tipBody}>
            Keep baby close during diaper changes and narrate each step. It builds calm and trust.
          </Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 34,
    color: babbleColors.primaryText,
    letterSpacing: 1.2,
    fontFamily: babbleTypography.brand,
  },
  streakBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: babbleRadii.pill,
    backgroundColor: babbleColors.chip,
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: babbleColors.muted,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '700',
    color: babbleColors.primaryText,
  },
  subtitle: {
    marginTop: 12,
    color: babbleColors.muted,
    fontSize: 14,
    fontFamily: babbleTypography.body,
  },
  title: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '600',
    color: babbleColors.text,
    fontFamily: babbleTypography.heading,
  },
  card: {
    borderRadius: babbleRadii.card,
    padding: 18,
    backgroundColor: babbleColors.card,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    ...babbleShadow,
  },
  dailyCard: {
    marginTop: 16,
    backgroundColor: '#fff7f2',
  },
  cardEyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: babbleColors.muted,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: babbleColors.text,
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 13,
    color: babbleColors.muted,
  },
  primaryButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: babbleRadii.pill,
    backgroundColor: babbleColors.primary,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: babbleColors.primaryText,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  progressSection: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: babbleColors.text,
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: babbleRadii.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: babbleColors.outline,
  },
  progressCardWarm: {
    backgroundColor: '#fff1e9',
  },
  progressCardCool: {
    backgroundColor: '#eff8f8',
  },
  progressCardNeutral: {
    backgroundColor: '#fffaf6',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
    color: babbleColors.text,
  },
  progressLabel: {
    marginTop: 4,
    fontSize: 12,
    color: babbleColors.muted,
  },
  progressBar: {
    marginTop: 12,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#f1e2dc',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: babbleColors.secondary,
  },
  tipCard: {
    marginTop: 20,
    padding: 18,
    borderRadius: babbleRadii.card,
    backgroundColor: '#fffaf6',
    borderWidth: 1,
    borderColor: babbleColors.outline,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.text,
  },
  tipBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: babbleColors.muted,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 220,
    height: 220,
    backgroundColor: '#fde2d5',
    top: -80,
    left: -80,
  },
  blobBottom: {
    width: 260,
    height: 260,
    backgroundColor: '#d9f0f1',
    bottom: -120,
    right: -100,
  },
});
