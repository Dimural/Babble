import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';
import {
  getAllLessons,
  isLessonUnlocked,
  lessonModules,
  LessonStep,
} from '@/data/lessons';
import { useProgress } from '@/hooks/use-progress';

type LessonPreview = {
  id: string;
  title: string;
  steps: LessonStep[];
};

const isQuizStep = (step: LessonStep) =>
  step.type === 'choice' || step.type === 'true_false';

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredCurrentStep, setAnsweredCurrentStep] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const { loading, progress, completeLesson } = useProgress();

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
            prompt: 'Each step is short, practical, and designed to build confidence.',
          },
        ],
      }
    );
  }, [lessonId]);

  const allLessons = useMemo(() => getAllLessons(), []);
  const isUnlocked = useMemo(() => {
    if (!progress) {
      return false;
    }
    return isLessonUnlocked(lesson.id, progress.completedLessonIds);
  }, [lesson.id, progress]);

  const totalSteps = lesson.steps.length;
  const quizStepCount = useMemo(
    () => lesson.steps.filter((step) => isQuizStep(step)).length,
    [lesson.steps],
  );
  const isComplete = stepIndex >= totalSteps;
  const step = lesson.steps[stepIndex];

  useEffect(() => {
    setStepIndex(0);
    setSelectedAnswer(null);
    setAnsweredCurrentStep(false);
    setCorrectAnswers(0);
  }, [lesson.id]);

  useEffect(() => {
    setSelectedAnswer(null);
    setAnsweredCurrentStep(false);
  }, [stepIndex]);

  const handleAnswer = (answer: string) => {
    if (!step || !isQuizStep(step) || answeredCurrentStep) {
      return;
    }

    setSelectedAnswer(answer);
    setAnsweredCurrentStep(true);

    if (step.correctAnswer && answer === step.correctAnswer) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (isComplete) {
      router.replace('/(tabs)');
      return;
    }

    if (stepIndex >= totalSteps - 1) {
      await completeLesson(lesson.id);
      setStepIndex(totalSteps);
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const getAnswerState = (option: string) => {
    if (!answeredCurrentStep || !step || !isQuizStep(step)) {
      return 'idle';
    }

    const correctAnswer = step.correctAnswer;

    if (option === correctAnswer) {
      return 'correct';
    }

    if (option === selectedAnswer && selectedAnswer !== correctAnswer) {
      return 'incorrect';
    }

    return 'idle';
  };

  const scorePercent = quizStepCount
    ? Math.round((correctAnswers / quizStepCount) * 100)
    : 100;
  const scoreMessage =
    scorePercent >= 90
      ? 'Excellent retention.'
      : scorePercent >= 70
        ? 'Strong progress. Review any missed points once more.'
        : 'Good start. A quick replay will lock these skills in.';

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isUnlocked) {
    const lessonOrder = allLessons.findIndex((item) => item.id === lesson.id);
    const previousLessonId = lessonOrder > 0 ? allLessons[lessonOrder - 1]?.id : null;

    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lesson locked</Text>
            <Text style={styles.cardBody}>
              Finish the previous lesson first to unlock this one.
            </Text>
            {previousLessonId ? (
              <Pressable
                onPress={() => router.replace(`/lesson/${previousLessonId}`)}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Go to previous lesson</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.replace('/(tabs)')} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Back to Home</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  }

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
              Quiz score: {correctAnswers}/{quizStepCount} ({scorePercent}%)
            </Text>
            <Text style={styles.feedbackBody}>{scoreMessage}</Text>
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
                {step.options?.map((option) => {
                  const answerState = getAnswerState(option);
                  return (
                    <Pressable
                      key={option}
                      onPress={() => handleAnswer(option)}
                      disabled={answeredCurrentStep}
                      style={[
                        styles.choiceChip,
                        answerState === 'correct' && styles.choiceChipCorrect,
                        answerState === 'incorrect' && styles.choiceChipIncorrect,
                        answeredCurrentStep && styles.choiceChipDisabled,
                      ]}
                    >
                      <Text style={styles.choiceText}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {step.type === 'true_false' && (
              <View style={styles.choiceList}>
                {['True', 'False'].map((option) => {
                  const answerState = getAnswerState(option);
                  return (
                    <Pressable
                      key={option}
                      onPress={() => handleAnswer(option)}
                      disabled={answeredCurrentStep}
                      style={[
                        styles.choiceChip,
                        answerState === 'correct' && styles.choiceChipCorrect,
                        answerState === 'incorrect' && styles.choiceChipIncorrect,
                        answeredCurrentStep && styles.choiceChipDisabled,
                      ]}
                    >
                      <Text style={styles.choiceText}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {isQuizStep(step) && answeredCurrentStep && (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>
                  {selectedAnswer === step.correctAnswer ? 'Correct' : 'Not quite'}
                </Text>
                <Text style={styles.feedbackBody}>
                  {step.explanation ?? 'Review the guidance and continue.'}
                </Text>
              </View>
            )}

            {(step.type === 'intro' || step.type === 'tap') && (
              <Pressable onPress={handleNext} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Tap to continue</Text>
              </Pressable>
            )}

            {isQuizStep(step) && (
              <Pressable
                onPress={handleNext}
                disabled={!answeredCurrentStep}
                style={[
                  styles.primaryButton,
                  !answeredCurrentStep && styles.primaryButtonDisabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Pressable>
            )}
          </View>
        )}
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
  choiceChipCorrect: {
    borderColor: '#78b89b',
    backgroundColor: '#ecfbf2',
  },
  choiceChipIncorrect: {
    borderColor: '#e08d8d',
    backgroundColor: '#fff1f1',
  },
  choiceChipDisabled: {
    opacity: 0.9,
  },
  choiceText: {
    fontSize: 14,
    color: babbleColors.text,
  },
  feedbackCard: {
    borderRadius: babbleRadii.card,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    backgroundColor: '#fffaf6',
    padding: 14,
    gap: 6,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: babbleColors.text,
  },
  feedbackBody: {
    fontSize: 13,
    lineHeight: 19,
    color: babbleColors.muted,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: babbleRadii.pill,
    backgroundColor: babbleColors.primary,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.55,
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
