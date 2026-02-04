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
              <View style={styles.pathList}>
                {module.lessons.map((lesson, index) => {
                  const completed = progress.completedLessonIds.includes(lesson.id);
                  const lessonLocked = isLocked || lesson.locked === true;
                  const isLeft = index % 2 === 0;
                  return (
                    <View key={lesson.id} style={styles.pathItem}>
                      <Pressable
                        disabled={lessonLocked}
                        onPress={() => router.push(`/lesson/${lesson.id}`)}
                        style={({ pressed }) => [
                          styles.stepCard,
                          isLeft ? styles.stepCardLeft : styles.stepCardRight,
                          lessonLocked && styles.stepCardLocked,
                          pressed && !lessonLocked && styles.stepCardPressed,
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
                      {index < module.lessons.length - 1 && (
                        <View
                          style={[
                            styles.footstepTrail,
                            isLeft ? styles.trailToRight : styles.trailToLeft,
                          ]}
                        >
                          {Array.from({ length: 4 }).map((_, stepIndex) => {
                            const flip = stepIndex % 2 === 0;
                            return (
                              <View
                                key={`${lesson.id}-step-${stepIndex}`}
                                style={[
                                  styles.footprint,
                                  flip ? styles.footprintRight : styles.footprintLeft,
                                ]}
                              >
                                <View style={styles.footprintHeel} />
                                <View
                                  style={[
                                    styles.footprintToe,
                                    flip ? styles.footprintToeRight : styles.footprintToeLeft,
                                  ]}
                                />
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
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
                  start path
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
  pathList: {
    gap: 10,
    paddingTop: 8,
  },
  pathItem: {
    gap: 8,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#fffaf7',
    borderWidth: 1,
    borderColor: babbleColors.outline,
    shadowColor: babbleColors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    width: '86%',
    maxWidth: 340,
  },
  stepCardLeft: {
    alignSelf: 'flex-start',
  },
  stepCardRight: {
    alignSelf: 'flex-end',
  },
  stepCardLocked: {
    opacity: 0.7,
  },
  stepCardPressed: {
    transform: [{ scale: 0.98 }],
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
  footstepTrail: {
    width: '70%',
    gap: 6,
    paddingHorizontal: 24,
  },
  trailToRight: {
    alignSelf: 'flex-end',
  },
  trailToLeft: {
    alignSelf: 'flex-start',
  },
  footprint: {
    width: 18,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footprintLeft: {
    alignSelf: 'flex-start',
    transform: [{ rotate: '-18deg' }],
  },
  footprintRight: {
    alignSelf: 'flex-end',
    transform: [{ rotate: '18deg' }],
  },
  footprintHeel: {
    width: 14,
    height: 9,
    borderRadius: 7,
    backgroundColor: '#f1d6c9',
  },
  footprintToe: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#efcbbd',
    top: -1,
  },
  footprintToeLeft: {
    left: 1,
  },
  footprintToeRight: {
    right: 1,
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
