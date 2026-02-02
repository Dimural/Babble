import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';
import { lessonModules } from '@/data/lessons';
import { useProgress } from '@/hooks/use-progress';

export default function LessonsScreen() {
  const router = useRouter();
  const { progress, loading } = useProgress();

  if (loading || !progress) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lessons</Text>
        <Text style={styles.subtitle}>
          Follow the path at your own pace. Each lesson takes just a few minutes.
        </Text>
        {lessonModules.map((module) => {
          const isLocked = module.locked ?? false;
          const firstLesson = module.lessons.find((lesson) => !lesson.locked) ?? module.lessons[0];
          return (
            <View
              key={module.id}
              style={[styles.moduleCard, isLocked && styles.moduleCardLocked]}
            >
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={[styles.moduleTag, isLocked ? styles.tagLocked : styles.tagOpen]}>
                  {isLocked ? 'Locked' : 'Open'}
                </Text>
              </View>
              <Text style={styles.moduleDescription}>{module.description}</Text>
              <View style={styles.lessonList}>
                <View style={styles.pathLine} />
                <View style={styles.pathCap}>
                  <View style={styles.pathHandle} />
                  <View style={styles.pathWheel} />
                  <View style={styles.pathWheel} />
                </View>
                {module.lessons.map((lesson, index) => {
                  const completed = progress.completedLessonIds.includes(lesson.id);
                  const lessonLocked = isLocked || lesson.locked === true;
                  return (
                    <Pressable
                      key={lesson.id}
                      disabled={lessonLocked}
                      onPress={() => router.push(`/lesson/${lesson.id}`)}
                      style={[
                        styles.lessonRow,
                        lessonLocked && styles.lessonRowLocked,
                      ]}
                    >
                      <View
                        style={[
                          styles.lessonNode,
                          completed && styles.lessonNodeDone,
                          lessonLocked && styles.lessonNodeLocked,
                          !completed && !lessonLocked && styles.lessonNodeActive,
                        ]}
                      >
                        <Text style={styles.lessonNodeText}>
                          {completed ? 'Done' : lessonLocked ? 'Lock' : index + 1}
                        </Text>
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text
                          style={[
                            styles.lessonTitle,
                            lessonLocked && styles.lessonTitleLocked,
                          ]}
                        >
                          {lesson.title}
                        </Text>
                        <Text style={styles.lessonMeta}>{lesson.duration}</Text>
                      </View>
                      <Text
                        style={[
                          styles.lessonTag,
                          completed && styles.lessonTagDone,
                          lessonLocked && styles.lessonTagLocked,
                          !completed && !lessonLocked && styles.lessonTagNext,
                        ]}
                      >
                        {completed ? 'Done' : lessonLocked ? 'Locked' : 'Up next'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                onPress={() => router.push(`/lesson/${firstLesson?.id ?? 'lesson-1'}`)}
                style={[
                  styles.moduleButton,
                  isLocked && styles.moduleButtonDisabled,
                ]}
                disabled={isLocked}
              >
                <Text
                  style={[
                    styles.moduleButtonText,
                    isLocked && styles.moduleButtonTextDisabled,
                  ]}
                >
                  start journey
                </Text>
              </Pressable>
            </View>
          );
        })}
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
  moduleCard: {
    borderRadius: babbleRadii.card,
    padding: 18,
    backgroundColor: babbleColors.card,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    gap: 14,
    ...babbleShadow,
  },
  moduleCardLocked: {
    opacity: 0.7,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: babbleColors.text,
  },
  moduleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: babbleRadii.pill,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagOpen: {
    backgroundColor: babbleColors.chip,
    color: babbleColors.primaryText,
  },
  tagLocked: {
    backgroundColor: '#f2ece8',
    color: babbleColors.muted,
  },
  moduleDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: babbleColors.muted,
  },
  lessonList: {
    position: 'relative',
    paddingLeft: 18,
    gap: 12,
    paddingTop: 20,
  },
  pathLine: {
    position: 'absolute',
    left: 10,
    top: 24,
    bottom: 12,
    width: 4,
    borderRadius: 4,
    backgroundColor: '#f1e2dc',
    borderWidth: 1,
    borderColor: babbleColors.outline,
  },
  pathCap: {
    position: 'absolute',
    left: -2,
    top: -2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pathHandle: {
    width: 30,
    height: 10,
    borderRadius: 10,
    backgroundColor: babbleColors.primary,
  },
  pathWheel: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: babbleColors.primaryText,
    backgroundColor: babbleColors.card,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonRowLocked: {
    opacity: 0.7,
  },
  lessonNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f0',
    borderWidth: 1,
    borderColor: babbleColors.outline,
    shadowColor: babbleColors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  lessonNodeActive: {
    backgroundColor: babbleColors.primary,
    borderColor: babbleColors.primary,
  },
  lessonNodeDone: {
    backgroundColor: babbleColors.secondary,
    borderColor: babbleColors.secondary,
  },
  lessonNodeLocked: {
    backgroundColor: '#f2ece8',
    borderColor: '#eaded7',
  },
  lessonNodeText: {
    fontSize: 11,
    fontWeight: '600',
    color: babbleColors.primaryText,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.text,
  },
  lessonTitleLocked: {
    color: babbleColors.muted,
  },
  lessonMeta: {
    marginTop: 2,
    fontSize: 12,
    color: babbleColors.muted,
  },
  lessonTag: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  lessonTagDone: {
    color: babbleColors.secondaryText,
  },
  lessonTagLocked: {
    color: babbleColors.muted,
  },
  lessonTagNext: {
    color: babbleColors.primaryText,
  },
  moduleButton: {
    paddingVertical: 12,
    borderRadius: babbleRadii.pill,
    backgroundColor: babbleColors.primary,
    alignItems: 'center',
  },
  moduleButtonDisabled: {
    backgroundColor: '#f2ece8',
  },
  moduleButtonText: {
    color: babbleColors.primaryText,
    fontWeight: '600',
    letterSpacing: 0.4,
    fontSize: 13,
  },
  moduleButtonTextDisabled: {
    color: babbleColors.muted,
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
    right: -70,
  },
  blobBottom: {
    width: 260,
    height: 260,
    backgroundColor: '#d9f0f1',
    bottom: -130,
    left: -90,
  },
});
