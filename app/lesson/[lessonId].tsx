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
  ScenarioOption,
} from '@/data/lessons';
import { useProgress } from '@/hooks/use-progress';

type LessonPreview = {
  id: string;
  title: string;
  steps: LessonStep[];
};

const isQuizStep = (step: LessonStep) =>
  step.type === 'choice' || step.type === 'true_false' || step.type === 'scenario';

const isInteractivePracticeStep = (step: LessonStep) =>
  step.type === 'scenario' || step.type === 'checklist' || step.type === 'flashcards';

export default function LessonScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredCurrentStep, setAnsweredCurrentStep] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [viewedCards, setViewedCards] = useState<Record<string, boolean>>({});
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
            prompt: 'Each step is practical and active. You will practice while you learn.',
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
  const isComplete = stepIndex >= totalSteps;
  const step = lesson.steps[stepIndex];

  const quizStepCount = useMemo(
    () => lesson.steps.filter((candidate) => isQuizStep(candidate)).length,
    [lesson.steps],
  );
  const interactivePracticeCount = useMemo(
    () => lesson.steps.filter((candidate) => isInteractivePracticeStep(candidate)).length,
    [lesson.steps],
  );

  useEffect(() => {
    setStepIndex(0);
    setSelectedAnswer(null);
    setAnsweredCurrentStep(false);
    setCorrectAnswers(0);
    setChecklistState({});
    setRevealedCards({});
    setViewedCards({});
  }, [lesson.id]);

  useEffect(() => {
    setSelectedAnswer(null);
    setAnsweredCurrentStep(false);
    setChecklistState({});
    setRevealedCards({});
    setViewedCards({});

    if (!step) {
      return;
    }

    if (step.type === 'checklist') {
      const initial = (step.checklistItems ?? []).reduce<Record<string, boolean>>((acc, item) => {
        acc[item] = false;
        return acc;
      }, {});
      setChecklistState(initial);
    }
  }, [step]);

  const markAnswered = (answer: string, isCorrect: boolean) => {
    if (answeredCurrentStep) {
      return;
    }

    setSelectedAnswer(answer);
    setAnsweredCurrentStep(true);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!step || !isQuizStep(step) || answeredCurrentStep) {
      return;
    }
    markAnswered(answer, step.correctAnswer === answer);
  };

  const handleScenarioChoice = (option: ScenarioOption) => {
    if (!step || step.type !== 'scenario' || answeredCurrentStep) {
      return;
    }
    markAnswered(option.text, option.text === step.correctAnswer);
  };

  const toggleChecklistItem = (item: string) => {
    if (!step || step.type !== 'checklist') {
      return;
    }
    setChecklistState((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleFlashcardPress = (cardId: string) => {
    if (!step || step.type !== 'flashcards') {
      return;
    }
    setRevealedCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
    setViewedCards((prev) => ({ ...prev, [cardId]: true }));
  };

  const checklistProgress = step?.type === 'checklist'
    ? (step.checklistItems ?? []).filter((item) => checklistState[item]).length
    : 0;
  const checklistTotal = step?.type === 'checklist' ? (step.checklistItems ?? []).length : 0;
  const checklistComplete = checklistTotal > 0 && checklistProgress === checklistTotal;

  const flashcardsSeen = step?.type === 'flashcards'
    ? (step.flashcards ?? []).filter((card) => viewedCards[card.id]).length
    : 0;
  const flashcardsTotal = step?.type === 'flashcards' ? (step.flashcards ?? []).length : 0;
  const flashcardsComplete = flashcardsTotal > 0 && flashcardsSeen === flashcardsTotal;

  const canContinue = (() => {
    if (!step) {
      return false;
    }
    if (step.type === 'intro' || step.type === 'tap') {
      return true;
    }
    if (isQuizStep(step)) {
      return answeredCurrentStep;
    }
    if (step.type === 'checklist') {
      return checklistComplete;
    }
    if (step.type === 'flashcards') {
      return flashcardsComplete;
    }
    return false;
  })();

  const selectedScenarioOption = step?.type === 'scenario'
    ? step.scenarioOptions?.find((option) => option.text === selectedAnswer)
    : undefined;

  const scorePercent = quizStepCount
    ? Math.round((correctAnswers / quizStepCount) * 100)
    : 100;
  const scoreMessage =
    scorePercent >= 90
      ? 'Excellent retention.'
      : scorePercent >= 70
        ? 'Strong progress. Run the lesson one more time to lock mastery.'
        : 'You are building the foundation. Replay this lesson and focus on scenario steps.';

  const handleNext = async () => {
    if (!isComplete && !canContinue) {
      return;
    }

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

    if (option === step.correctAnswer) {
      return 'correct';
    }

    if (option === selectedAnswer && selectedAnswer !== step.correctAnswer) {
      return 'incorrect';
    }

    return 'idle';
  };

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
            <Text style={styles.cardBody}>
              Practice rounds completed: {interactivePracticeCount}
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

            {step.type === 'scenario' && (
              <View style={styles.interactiveBlock}>
                {step.scenarioPrompt ? (
                  <Text style={styles.scenarioPrompt}>{step.scenarioPrompt}</Text>
                ) : null}
                <View style={styles.choiceList}>
                  {step.scenarioOptions?.map((option) => {
                    const answerState = getAnswerState(option.text);
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => handleScenarioChoice(option)}
                        disabled={answeredCurrentStep}
                        style={[
                          styles.choiceChip,
                          answerState === 'correct' && styles.choiceChipCorrect,
                          answerState === 'incorrect' && styles.choiceChipIncorrect,
                          answeredCurrentStep && styles.choiceChipDisabled,
                        ]}
                      >
                        <Text style={styles.choiceText}>{option.text}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {step.type === 'checklist' && (
              <View style={styles.interactiveBlock}>
                <Text style={styles.interactiveMeta}>
                  {checklistProgress}/{checklistTotal} complete
                </Text>
                <View style={styles.checklistList}>
                  {step.checklistItems?.map((item) => {
                    const checked = checklistState[item];
                    return (
                      <Pressable
                        key={item}
                        onPress={() => toggleChecklistItem(item)}
                        style={[styles.checklistItem, checked && styles.checklistItemDone]}
                      >
                        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                          <Text style={styles.checkboxText}>{checked ? '✓' : ''}</Text>
                        </View>
                        <Text style={styles.checklistText}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {step.type === 'flashcards' && (
              <View style={styles.interactiveBlock}>
                <Text style={styles.interactiveMeta}>
                  Cards revealed: {flashcardsSeen}/{flashcardsTotal}
                </Text>
                <View style={styles.flashcardList}>
                  {step.flashcards?.map((card) => {
                    const revealed = revealedCards[card.id];
                    return (
                      <Pressable
                        key={card.id}
                        onPress={() => handleFlashcardPress(card.id)}
                        style={[styles.flashcard, revealed && styles.flashcardRevealed]}
                      >
                        <Text style={styles.flashcardLabel}>
                          {revealed ? 'Answer' : 'Tap to reveal'}
                        </Text>
                        <Text style={styles.flashcardText}>
                          {revealed ? card.back : card.front}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {isQuizStep(step) && answeredCurrentStep && (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>
                  {selectedAnswer === step.correctAnswer ? 'Correct' : 'Not quite'}
                </Text>
                <Text style={styles.feedbackBody}>
                  {step.type === 'scenario' && selectedScenarioOption
                    ? selectedScenarioOption.feedback
                    : step.explanation ?? 'Review the guidance and continue.'}
                </Text>
                {step.type === 'scenario' && step.explanation ? (
                  <Text style={styles.feedbackBody}>{step.explanation}</Text>
                ) : null}
              </View>
            )}

            <Pressable
              onPress={handleNext}
              disabled={!canContinue}
              style={[
                styles.primaryButton,
                !canContinue && styles.primaryButtonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {canContinue ? 'Continue' : 'Complete activity to continue'}
              </Text>
            </Pressable>
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
  interactiveBlock: {
    gap: 10,
  },
  interactiveMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: babbleColors.primaryText,
  },
  scenarioPrompt: {
    fontSize: 14,
    lineHeight: 20,
    color: babbleColors.text,
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
  checklistList: {
    gap: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    borderRadius: babbleRadii.card,
    backgroundColor: '#fffaf6',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  checklistItemDone: {
    borderColor: '#78b89b',
    backgroundColor: '#ecfbf2',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    borderColor: '#78b89b',
    backgroundColor: '#d6f4e3',
  },
  checkboxText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2f6e54',
  },
  checklistText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: babbleColors.text,
  },
  flashcardList: {
    gap: 10,
  },
  flashcard: {
    borderWidth: 1,
    borderColor: babbleColors.outline,
    borderRadius: babbleRadii.card,
    backgroundColor: '#fffaf6',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 6,
  },
  flashcardRevealed: {
    borderColor: '#9ad5d6',
    backgroundColor: '#eff8f8',
  },
  flashcardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: babbleColors.muted,
  },
  flashcardText: {
    fontSize: 14,
    lineHeight: 19,
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
    textAlign: 'center',
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
