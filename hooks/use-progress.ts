import { useEffect, useState } from 'react';

import {
  loadProgress,
  markLessonComplete,
  ProgressState,
  resetProgress,
  saveProgress,
} from '@/lib/progress';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadProgress().then((next) => {
      if (mounted) {
        setProgress(next);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const updateProgress = async (next: ProgressState) => {
    const saved = await saveProgress(next);
    setProgress(saved);
  };

  const completeLesson = async (lessonId: string) => {
    const saved = await markLessonComplete(lessonId);
    setProgress(saved);
  };

  const clearProgress = async () => {
    const saved = await resetProgress();
    setProgress(saved);
  };

  return {
    progress,
    loading,
    setProgress: updateProgress,
    completeLesson,
    resetProgress: clearProgress,
  };
}
