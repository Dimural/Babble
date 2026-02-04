import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';
import { lessonModules } from '@/data/lessons';
import { useProgress } from '@/hooks/use-progress';

const footprints = require('../../assets/images/footprints.png');

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
              <View style={styles.mapList}>
                {module.lessons.map((lesson, index) => {
                  const completed = progress.completedLessonIds.includes(lesson.id);
                  const lessonLocked = isLocked || lesson.locked === true;
                  const isLeft = index % 2 === 0;
                  return (
                    <View key={lesson.id} style={styles.mapItem}>
                      <Pressable
                        disabled={lessonLocked}
                        onPress={() => router.push(`/lesson/${lesson.id}`)}
                        style={({ pressed }) => [
                          styles.mapStop,
                          isLeft ? styles.mapStopLeft : styles.mapStopRight,
                          lessonLocked && styles.mapStopLocked,
                          pressed && !lessonLocked && styles.mapStopPressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.mapNode,
                            completed && styles.lessonNodeDone,
                            lessonLocked && styles.lessonNodeLocked,
                            !completed && !lessonLocked && styles.lessonNodeActive,
                          ]}
                        >
                          <Text style={styles.lessonNodeText}>
                            {completed ? 'Done' : lessonLocked ? 'Lock' : index + 1}
                          </Text>
                        </View>
                        <View style={styles.mapLabel}>
                          <Text
                            style={[
                              styles.lessonTitle,
                              lessonLocked && styles.lessonTitleLocked,
                            ]}
                          >
                            {lesson.title}
                          </Text>
                          <View style={styles.mapLabelRow}>
                            <Text style={styles.lessonMeta}>{lesson.duration}</Text>
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
                          </View>
                        </View>
                      </Pressable>
                      {index < module.lessons.length - 1 && (
                        <View
                          style={[
                            styles.mapConnector,
                            isLeft ? styles.connectorToRight : styles.connectorToLeft,
                          ]}
                        >
                          <Image source={footprints} style={[styles.footprint, styles.footprintOne]} />
                          <Image source={footprints} style={[styles.footprint, styles.footprintTwo]} />
                          <Image source={footprints} style={[styles.footprint, styles.footprintThree]} />
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
  mapList: {
    paddingTop: 10,
    gap: 18,
  },
  mapItem: {
    gap: 10,
  },
  mapStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: '100%',
  },
  mapStopLeft: {
    justifyContent: 'flex-start',
  },
  mapStopRight: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  mapStopLocked: {
    opacity: 0.7,
  },
  mapStopPressed: {
    transform: [{ scale: 0.98 }],
  },
  mapNode: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f0',
    borderWidth: 2,
    borderColor: babbleColors.outline,
    shadowColor: babbleColors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
  mapLabel: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#fffaf7',
    borderWidth: 1,
    borderColor: babbleColors.outline,
    maxWidth: '70%',
  },
  mapLabelRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 12,
    color: babbleColors.muted,
  },
  lessonTag: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  lessonTagDone: {
    color: babbleColors.secondaryText,
    backgroundColor: '#e7f4ef',
  },
  lessonTagLocked: {
    color: babbleColors.muted,
    backgroundColor: '#f2ece8',
  },
  lessonTagNext: {
    color: babbleColors.primaryText,
    backgroundColor: '#fde2d5',
  },
  mapConnector: {
    width: '70%',
    alignItems: 'center',
    gap: 6,
  },
  connectorToRight: {
    alignSelf: 'flex-end',
    paddingRight: 26,
  },
  connectorToLeft: {
    alignSelf: 'flex-start',
    paddingLeft: 26,
  },
  footprint: {
    width: 46,
    height: 46,
    opacity: 0.9,
    resizeMode: 'contain',
  },
  footprintOne: {
    transform: [{ rotate: '-12deg' }],
  },
  footprintTwo: {
    transform: [{ rotate: '8deg' }],
  },
  footprintThree: {
    transform: [{ rotate: '-6deg' }],
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
