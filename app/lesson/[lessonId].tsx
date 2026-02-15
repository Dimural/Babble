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

type LearningMode = 'understand' | 'example' | 'recap';

type StructuredSectionTone = 'focus' | 'watch' | 'action' | 'teach' | 'detail';

type StructuredSection = {
  heading: string;
  body: string;
  tone: StructuredSectionTone;
};

const isQuizStep = (step: LessonStep) =>
  step.type === 'choice' || step.type === 'true_false' || step.type === 'scenario';

const isInteractivePracticeStep = (step: LessonStep) =>
  step.type === 'scenario' || step.type === 'checklist' || step.type === 'flashcards';

const reflectionOptions: { id: LearningMode; label: string }[] = [
  { id: 'understand', label: 'I get it' },
  { id: 'example', label: 'Show example' },
  { id: 'recap', label: 'Quick recap' },
];

const getSectionTone = (heading: string): StructuredSectionTone => {
  const normalized = heading.toLowerCase();

  if (
    normalized.includes('why this matters')
    || normalized.includes('focus')
    || normalized.includes('decision lens')
    || normalized.includes('deep check')
  ) {
    return 'focus';
  }
  if (normalized.includes('watch') || normalized.includes('friction')) {
    return 'watch';
  }
  if (normalized.includes('try this now') || normalized.includes('action') || normalized.includes('micro-drill')) {
    return 'action';
  }
  if (
    normalized.includes('teach-back')
    || normalized.includes('retention')
    || normalized.includes('commitment')
    || normalized.includes('after-action')
  ) {
    return 'teach';
  }

  return 'detail';
};

const parseStructuredText = (raw?: string) => {
  if (!raw) {
    return { lead: undefined as string | undefined, sections: [] as StructuredSection[] };
  }

  const parts = raw
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const [lead, ...rest] = parts;
  const sections: StructuredSection[] = rest.map((part) => {
    const match = part.match(/^([^:]{2,40}):\s*([\s\S]+)$/);
    const heading = match ? match[1].trim() : 'Detail';
    const body = match ? match[2].trim() : part;
    return {
      heading,
      body,
      tone: getSectionTone(heading),
    };
  });

  return { lead, sections };
};

const getReflectionResponse = (mode: LearningMode, step: LessonStep, lessonTitle: string) => {
  if (mode === 'understand') {
    return [
      `Connection: "${step.title}" is not a stand-alone fact. It supports the full routine in ${lessonTitle}.`,
      'Action check: Name the first thing you will do when this situation appears again.',
      'Self-check: If you had to explain this to another caregiver in 20 seconds, could you?',
    ].join('\n\n');
  }

  if (mode === 'example') {
    return [
      'Real moment: You are tired, the room is noisy, and baby cues are changing quickly.',
      'Best move: Pause, scan cues, and do the safest lowest-risk action first.',
      `Practice line: "For ${step.title}, I will act early and stay consistent instead of waiting for escalation."`,
    ].join('\n\n');
  }

  return [
    `Core idea: ${step.title}.`,
    'Remember this sequence: observe early -> choose low-risk response -> reassess within minutes.',
    'Retention tip: Repeat the same sequence twice today so it becomes automatic under stress.',
  ].join('\n\n');
};

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
  const [learningMode, setLearningMode] = useState<LearningMode | null>(null);
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
    setLearningMode(null);
  }, [lesson.id]);

  useEffect(() => {
    setSelectedAnswer(null);
    setAnsweredCurrentStep(false);
    setChecklistState({});
    setRevealedCards({});
    setViewedCards({});
    setLearningMode(null);

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
      return learningMode !== null;
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

  const promptContent = parseStructuredText(step?.prompt);
  const scenarioPromptContent = step?.type === 'scenario'
    ? parseStructuredText(step?.scenarioPrompt)
    : { lead: undefined as string | undefined, sections: [] as StructuredSection[] };
  const reflectionContent = step
    && (step.type === 'intro' || step.type === 'tap')
    && learningMode
    ? parseStructuredText(getReflectionResponse(learningMode, step, lesson.title))
    : { lead: undefined as string | undefined, sections: [] as StructuredSection[] };

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
            {step.prompt ? (
              <View style={styles.narrativeStack}>
                {promptContent.lead ? (
                  <Text style={styles.narrativeLead}>{promptContent.lead}</Text>
                ) : null}
                {promptContent.sections.map((section, index) => (
                  <View
                    key={`${step.id}-prompt-${section.heading}-${index}`}
                    style={[
                      styles.narrativeSection,
                      section.tone === 'focus' && styles.narrativeSectionFocus,
                      section.tone === 'watch' && styles.narrativeSectionWatch,
                      section.tone === 'action' && styles.narrativeSectionAction,
                      section.tone === 'teach' && styles.narrativeSectionTeach,
                    ]}
                  >
                    <Text style={styles.narrativeSectionHeading}>{section.heading}</Text>
                    <Text style={styles.narrativeSectionBody}>{section.body}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {(step.type === 'intro' || step.type === 'tap') && (
              <View style={styles.reflectionCard}>
                <Text style={styles.interactiveMeta}>Pause and choose a learning mode to continue</Text>
                <View style={styles.reflectionChoices}>
                  {reflectionOptions.map((option) => (
                    <Pressable
                      key={option.id}
                      onPress={() => setLearningMode(option.id)}
                      style={[
                        styles.reflectionChoice,
                        learningMode === option.id && styles.reflectionChoiceActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.reflectionChoiceText,
                          learningMode === option.id && styles.reflectionChoiceTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {learningMode ? (
                  <View style={styles.reflectionResponse}>
                    {reflectionContent.lead ? (
                      <Text style={styles.reflectionLead}>{reflectionContent.lead}</Text>
                    ) : null}
                    {reflectionContent.sections.map((section, index) => (
                      <View
                        key={`${step.id}-reflection-${section.heading}-${index}`}
                        style={styles.reflectionSection}
                      >
                        <Text style={styles.reflectionSectionHeading}>{section.heading}</Text>
                        <Text style={styles.reflectionSectionBody}>{section.body}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            )}

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
                  <View style={styles.narrativeStack}>
                    {scenarioPromptContent.lead ? (
                      <Text style={styles.scenarioPrompt}>{scenarioPromptContent.lead}</Text>
                    ) : null}
                    {scenarioPromptContent.sections.map((section, index) => (
                      <View
                        key={`${step.id}-scenario-${section.heading}-${index}`}
                        style={[
                          styles.narrativeSection,
                          section.tone === 'focus' && styles.narrativeSectionFocus,
                          section.tone === 'watch' && styles.narrativeSectionWatch,
                          section.tone === 'action' && styles.narrativeSectionAction,
                          section.tone === 'teach' && styles.narrativeSectionTeach,
                        ]}
                      >
                        <Text style={styles.narrativeSectionHeading}>{section.heading}</Text>
                        <Text style={styles.narrativeSectionBody}>{section.body}</Text>
                      </View>
                    ))}
                  </View>
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
  narrativeStack: {
    gap: 10,
  },
  narrativeLead: {
    fontSize: 17,
    lineHeight: 25,
    color: '#3c2d27',
    fontWeight: '600',
    fontFamily: babbleTypography.body,
  },
  narrativeSection: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    backgroundColor: '#fffaf6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  narrativeSectionFocus: {
    backgroundColor: '#fdf3df',
    borderColor: '#f0d2a2',
  },
  narrativeSectionWatch: {
    backgroundColor: '#fff0ea',
    borderColor: '#f0c5b8',
  },
  narrativeSectionAction: {
    backgroundColor: '#eaf7f7',
    borderColor: '#b8dfe0',
  },
  narrativeSectionTeach: {
    backgroundColor: '#f0f3ff',
    borderColor: '#cad3f0',
  },
  narrativeSectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#5f4640',
  },
  narrativeSectionBody: {
    fontSize: 14,
    lineHeight: 21,
    color: babbleColors.text,
  },
  reflectionCard: {
    borderRadius: babbleRadii.card,
    borderWidth: 1,
    borderColor: '#cfdae8',
    backgroundColor: '#f5f8ff',
    padding: 14,
    gap: 10,
  },
  reflectionChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reflectionChoice: {
    borderRadius: babbleRadii.pill,
    borderWidth: 1,
    borderColor: '#c6d1e5',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  reflectionChoiceActive: {
    borderColor: '#7f99c2',
    backgroundColor: '#e9f0ff',
  },
  reflectionChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3c4f73',
  },
  reflectionChoiceTextActive: {
    color: '#2c3f63',
  },
  reflectionResponse: {
    gap: 8,
  },
  reflectionLead: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2d3e5e',
    fontWeight: '600',
  },
  reflectionSection: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccd7ec',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 3,
  },
  reflectionSectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
    color: '#50658c',
  },
  reflectionSectionBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#30405f',
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
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
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
