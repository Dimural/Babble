import AsyncStorage from '@react-native-async-storage/async-storage';

export type ProgressState = {
  completedLessonIds: string[];
};

const STORAGE_KEY = 'babble.progress.v1';

const defaultProgress: ProgressState = {
  completedLessonIds: [],
};

const normalizeProgress = (progress: ProgressState | null): ProgressState => {
  if (!progress || !Array.isArray(progress.completedLessonIds)) {
    return { ...defaultProgress };
  }
  const unique = Array.from(new Set(progress.completedLessonIds));
  return {
    completedLessonIds: unique,
  };
};

export const loadProgress = async (): Promise<ProgressState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProgress));
      return { ...defaultProgress };
    }
    const parsed = JSON.parse(raw) as ProgressState;
    const normalized = normalizeProgress(parsed);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return { ...defaultProgress };
  }
};

export const saveProgress = async (progress: ProgressState): Promise<ProgressState> => {
  const normalized = normalizeProgress(progress);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
};

export const markLessonComplete = async (lessonId: string): Promise<ProgressState> => {
  const progress = await loadProgress();
  if (progress.completedLessonIds.includes(lessonId)) {
    return progress;
  }
  const next = {
    completedLessonIds: [...progress.completedLessonIds, lessonId],
  };
  return saveProgress(next);
};

export const resetProgress = async (): Promise<ProgressState> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProgress));
  return { ...defaultProgress };
};
