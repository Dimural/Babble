import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';
import { lessonModules, LessonStep } from '@/data/lessons';

type LessonPreview = {
  id: string;
  title: string;
  steps: LessonStep[];
};

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const [stepIndex, setStepIndex] = useState(0);

  const lesson = useMemo<LessonPreview>(() => {
    const allLessons = lessonModules.flatMap((module) => module.lessons);
    const found = allLessons.find((item) => item.id === lessonId);
    return (
      found ?? {
        id: 'lesson-1',
        title: 'Care basics',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Welcome to your lesson',
            prompt: 'Each step is short and friendly.',
          },
        ],
      }
    );
  }, [lessonId]);

  const totalSteps = lesson.steps.length;
  const isComplete = stepIndex >= totalSteps;
  const step = lesson.steps[stepIndex];

  const handleNext = () => {
    if (isComplete) {
      router.replace('/(tabs)');
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            {Math.min(stepIndex + 1, totalSteps)}/{totalSteps}
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isComplete ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lesson complete</Text>
            <Text style={styles.cardBody}>
              You finished another step on your parenting journey. Great work.
            </Text>
            <Pressable onPress={() => router.replace('/(tabs)')} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Back to Home</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{step.title}</Text>
            {step.prompt ? <Text style={styles.cardBody}>{step.prompt}</Text> : null}
            {step.type === 'choice' && (
              <View style={styles.choiceList}>
                {step.options?.map((option) => (
                  <Pressable key={option} onPress={handleNext} style={styles.choiceChip}>
                    <Text style={styles.choiceText}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {step.type === 'true_false' && (
              <View style={styles.choiceList}>
                {['True', 'False'].map((option) => (
                  <Pressable key={option} onPress={handleNext} style={styles.choiceChip}>
                    <Text style={styles.choiceText}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {(step.type === 'intro' || step.type === 'tap') && (
              <Pressable onPress={handleNext} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Tap to continue</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: babbleColors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: babbleRadii.pill,
    backgroundColor: babbleColors.chip,
  },
  backText: {
    fontSize: 12,
    fontWeight: '600',
    color: babbleColors.primaryText,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: babbleColors.text,
    fontFamily: babbleTypography.heading,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: babbleRadii.pill,
    backgroundColor: '#fffaf6',
    borderWidth: 1,
    borderColor: babbleColors.outline,
  },
  stepBadgeText: {
    fontSize: 12,
    color: babbleColors.muted,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    borderRadius: babbleRadii.card,
    backgroundColor: babbleColors.card,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    gap: 16,
    ...babbleShadow,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: babbleColors.text,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    color: babbleColors.muted,
  },
  choiceList: {
    gap: 10,
  },
  choiceChip: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: babbleRadii.pill,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    backgroundColor: '#fffaf6',
  },
  choiceText: {
    fontSize: 14,
    color: babbleColors.text,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: babbleRadii.pill,
    backgroundColor: babbleColors.primary,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.primaryText,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 200,
    height: 200,
    backgroundColor: '#fde2d5',
    top: -70,
    left: -70,
  },
  blobBottom: {
    width: 240,
    height: 240,
    backgroundColor: '#d9f0f1',
    bottom: -120,
    right: -90,
  },
});
