import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AccessibilityInfo,
  Alert,
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';
import { getAllLessons, isLessonUnlocked } from '@/data/lessons';
import { useProgress } from '@/hooks/use-progress';

type LessonStatus = 'locked' | 'available' | 'completed';
type LessonNode = {
  id: string;
  title: string;
  status: LessonStatus;
  x: number; // map coordinates (content space)
  y: number;
  icon?: string; // emoji ok
  nextIds: string[];
};

const LESSON_ICONS = ['👶', '🧠', '🌙', '🏠', '🤱', '🍼', '🧼', '📈', '🩺', '❤️'];

const buildLessonNodes = (completedLessonIds: string[]): LessonNode[] => {
  const allLessons = getAllLessons();

  return allLessons.map((lesson, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const zigzagCol = row % 2 === 0 ? col : 3 - col;

    return {
      id: lesson.id,
      title: lesson.title,
      status: completedLessonIds.includes(lesson.id)
        ? 'completed'
        : isLessonUnlocked(lesson.id, completedLessonIds)
          ? 'available'
          : 'locked',
      x: 120 + zigzagCol * 255,
      y: 140 + row * 165 + (zigzagCol % 2 === 0 ? 0 : 26),
      icon: LESSON_ICONS[index % LESSON_ICONS.length],
      nextIds: index < allLessons.length - 1 ? [allLessons[index + 1].id] : [],
    };
  });
};

const NODE_WIDTH = 210;
const NODE_HEIGHT = 76;
const CONTENT_PADDING = 140;
const DRAG_THRESHOLD = 6;

export const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};

export const computeBounds = (
  contentWidth: number,
  contentHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  edgePadding = 40,
) => {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  const fitsHorizontally = contentWidth <= viewportWidth;
  const fitsVertically = contentHeight <= viewportHeight;

  const minX = fitsHorizontally
    ? (viewportWidth - contentWidth) / 2
    : viewportWidth - contentWidth - edgePadding;
  const maxX = fitsHorizontally
    ? (viewportWidth - contentWidth) / 2
    : edgePadding;

  const minY = fitsVertically
    ? (viewportHeight - contentHeight) / 2
    : viewportHeight - contentHeight - edgePadding;
  const maxY = fitsVertically
    ? (viewportHeight - contentHeight) / 2
    : edgePadding;

  return { minX, maxX, minY, maxY };
};

export const computeNodeCenters = (
  nodes: LessonNode[],
  offsetX = 0,
  offsetY = 0,
) => {
  const centers: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node) => {
    centers[node.id] = {
      x: node.x + offsetX + NODE_WIDTH / 2,
      y: node.y + offsetY + NODE_HEIGHT / 2,
    };
  });
  return centers;
};

const useReducedMotion = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReduceMotion(enabled),
    );

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  return reduceMotion;
};

const PathLayer = ({
  nodes,
  centers,
  width,
  height,
}: {
  nodes: LessonNode[];
  centers: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
}) => {
  const statusById = useMemo(() => {
    return nodes.reduce<Record<string, LessonStatus>>((acc, node) => {
      acc[node.id] = node.status;
      return acc;
    }, {});
  }, [nodes]);

  const segments = useMemo(() => {
    return nodes.flatMap((node) =>
      node.nextIds.map((nextId) => ({
        from: node.id,
        to: nextId,
        status: (
          statusById[nextId] === 'locked'
            ? 'locked'
            : node.status === 'completed'
              ? 'completed'
              : 'available'
        ) as LessonStatus,
      })),
    );
  }, [nodes, statusById]);

  return (
    <Svg
      width={width}
      height={height}
      style={styles.pathLayer}
      pointerEvents="none"
    >
      {segments.map((segment) => {
        const start = centers[segment.from];
        const end = centers[segment.to];
        if (!start || !end) return null;

        const { stroke, opacity, footprintOpacity } = getPathStyle(segment.status);

        const footprints = renderFootprints(
          start.x,
          start.y,
          end.x,
          end.y,
          stroke,
          footprintOpacity,
        );

        return (
          <React.Fragment key={`${segment.from}-${segment.to}`}>
            <Line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={stroke}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray="8 10"
              opacity={opacity}
            />
            {footprints}
          </React.Fragment>
        );
      })}
    </Svg>
  );
};

const LessonNodeButton = ({
  node,
  left,
  top,
  onPress,
  onLockedPress,
}: {
  node: LessonNode;
  left: number;
  top: number;
  onPress: (id: string) => void;
  onLockedPress: () => void;
}) => {
  const isLocked = node.status === 'locked';
  const isCompleted = node.status === 'completed';

  const handlePress = () => {
    if (isLocked) {
      onLockedPress();
      return;
    }
    onPress(node.id);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lesson: ${node.title}, ${node.status}`}
      accessibilityState={{ disabled: isLocked }}
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.node,
        { left, top },
        isLocked && styles.nodeLocked,
        isCompleted && styles.nodeCompleted,
        pressed && !isLocked && styles.nodePressed,
      ]}
    >
      <View style={styles.nodeIconWrap}>
        <Text style={styles.nodeIcon}>{node.icon ?? '⭐️'}</Text>
      </View>
      <View style={styles.nodeTextWrap}>
        <Text
          style={[styles.nodeTitle, isLocked && styles.nodeTitleLocked]}
          numberOfLines={2}
        >
          {node.title}
        </Text>
        <Text
          style={[
            styles.nodeStatus,
            isLocked && styles.nodeStatusLocked,
            isCompleted && styles.nodeStatusDone,
          ]}
        >
          {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Available'}
        </Text>
      </View>
      {isLocked ? (
        <View style={styles.badgeLocked}>
          <Text style={styles.badgeText}>🔒</Text>
        </View>
      ) : null}
      {isCompleted ? (
        <View style={styles.badgeDone}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

type LessonsMapScreenProps = {
  onOpenLesson?: (id: string) => void;
  startNodeId?: string;
};

export default function LessonsMapScreen({
  onOpenLesson,
  startNodeId: startNodeIdProp,
}: LessonsMapScreenProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { progress, loading } = useProgress();
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const lessonNodes = useMemo(
    () => buildLessonNodes(progress?.completedLessonIds ?? []),
    [progress?.completedLessonIds],
  );
  const startNodeId =
    startNodeIdProp ??
    lessonNodes.find((node) => node.status === 'available')?.id ??
    lessonNodes[0]?.id;

  const { contentWidth, contentHeight, offsetX, offsetY } = useMemo(() => {
    if (!lessonNodes.length) {
      return { contentWidth: 0, contentHeight: 0, offsetX: 0, offsetY: 0 };
    }

    const xs = lessonNodes.map((node) => node.x);
    const ys = lessonNodes.map((node) => node.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX + NODE_WIDTH + CONTENT_PADDING * 2;
    const height = maxY - minY + NODE_HEIGHT + CONTENT_PADDING * 2;

    return {
      contentWidth: width,
      contentHeight: height,
      offsetX: CONTENT_PADDING - minX,
      offsetY: CONTENT_PADDING - minY,
    };
  }, [lessonNodes]);

  const bounds = useMemo(
    () => computeBounds(contentWidth, contentHeight, viewport.width, viewport.height),
    [contentWidth, contentHeight, viewport],
  );

  const centers = useMemo(
    () => computeNodeCenters(lessonNodes, offsetX, offsetY),
    [lessonNodes, offsetX, offsetY],
  );

  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const translateRef = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const handleOpenLesson = useCallback(
    (id: string) => {
      if (onOpenLesson) {
        onOpenLesson(id);
        return;
      }
      router.push(`/lesson/${id}`);
    },
    [onOpenLesson, router],
  );

  const showLockedMessage = useCallback(() => {
    const message = 'Complete the previous lesson to unlock!';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
      return;
    }
    Alert.alert('Locked', message);
  }, []);

  const focusOnNode = useCallback(
    (nodeId: string, animated = true) => {
      const center = centers[nodeId];
      if (!center || viewport.width === 0 || viewport.height === 0) return;

      const targetX = viewport.width / 2 - center.x;
      const targetY = viewport.height / 2 - center.y;

      const clampedX = clamp(targetX, bounds.minX, bounds.maxX);
      const clampedY = clamp(targetY, bounds.minY, bounds.maxY);

      if (animated && !reduceMotion) {
        Animated.timing(translate, {
          toValue: { x: clampedX, y: clampedY },
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        translate.setValue({ x: clampedX, y: clampedY });
      }

      translateRef.current = { x: clampedX, y: clampedY };
    },
    [bounds, centers, reduceMotion, translate, viewport.height, viewport.width],
  );

  useEffect(() => {
    if (!startNodeId || viewport.width === 0 || viewport.height === 0) return;
    focusOnNode(startNodeId, false);
  }, [focusOnNode, startNodeId, viewport.height, viewport.width]);

  useEffect(() => {
    const clampedX = clamp(translateRef.current.x, bounds.minX, bounds.maxX);
    const clampedY = clamp(translateRef.current.y, bounds.minY, bounds.maxY);

    if (clampedX !== translateRef.current.x || clampedY !== translateRef.current.y) {
      translate.setValue({ x: clampedX, y: clampedY });
      translateRef.current = { x: clampedX, y: clampedY };
    }
  }, [bounds, translate]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD,
        onPanResponderGrant: () => {
          panStart.current = { ...translateRef.current };
        },
        onPanResponderMove: (_, gesture) => {
          const nextX = clamp(panStart.current.x + gesture.dx, bounds.minX, bounds.maxX);
          const nextY = clamp(panStart.current.y + gesture.dy, bounds.minY, bounds.maxY);

          translate.setValue({ x: nextX, y: nextY });
          translateRef.current = { x: nextX, y: nextY };
        },
        onPanResponderRelease: () => {},
        onPanResponderTerminationRequest: () => false,
      }),
    [bounds, translate],
  );

  if (loading || !progress) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lessons Map</Text>
        <Text style={styles.headerSubtitle}>
          Follow the path through {lessonNodes.length} newborn-care lessons.
        </Text>
      </View>

      <View
        style={styles.viewport}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setViewport({ width, height });
        }}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.mapContent,
            {
              width: contentWidth,
              height: contentHeight,
              transform: translate.getTranslateTransform(),
            },
          ]}
        >
          <View style={styles.mapBackdrop} pointerEvents="none">
            <View style={[styles.gradientBlob, styles.blobOne]} />
            <View style={[styles.gradientBlob, styles.blobTwo]} />
            <View style={[styles.gradientBlob, styles.blobThree]} />
            <View style={[styles.cloud, styles.cloudOne]} />
            <View style={[styles.cloud, styles.cloudTwo]} />
            <View style={[styles.cloud, styles.cloudThree]} />
            <View style={[styles.star, styles.starOne]} />
            <View style={[styles.star, styles.starTwo]} />
            <View style={[styles.star, styles.starThree]} />
            <View style={[styles.star, styles.starFour]} />
          </View>

          <PathLayer
            nodes={lessonNodes}
            centers={centers}
            width={contentWidth}
            height={contentHeight}
          />

          {lessonNodes.map((node) => (
            <LessonNodeButton
              key={node.id}
              node={node}
              left={node.x + offsetX}
              top={node.y + offsetY}
              onPress={handleOpenLesson}
              onLockedPress={showLockedMessage}
            />
          ))}
        </Animated.View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.recenterButton, pressed && styles.recenterPressed]}
        onPress={() => {
          if (startNodeId) {
            focusOnNode(startNodeId);
          }
        }}
        accessibilityRole="button"
        accessibilityLabel="Recenter map"
      >
        <Text style={styles.recenterText}>Recenter</Text>
      </Pressable>
    </View>
  );
}

const getPathStyle = (status: LessonStatus) => {
  if (status === 'completed') {
    return {
      stroke: '#f7b4a8',
      opacity: 1,
      footprintOpacity: 0.7,
    };
  }

  if (status === 'available') {
    return {
      stroke: '#9ad5d6',
      opacity: 0.9,
      footprintOpacity: 0.55,
    };
  }

  return {
    stroke: '#e7d9d4',
    opacity: 0.5,
    footprintOpacity: 0.35,
  };
};

const renderFootprints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  opacity: number,
) => {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const step = 38;
  const count = Math.max(3, Math.floor(distance / step));

  return Array.from({ length: count }).map((_, index) => {
    const t = (index + 1) / (count + 1);
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const radius = index % 2 === 0 ? 4.5 : 3.6;

    return (
      <Circle
        key={`${x}-${y}-${index}`}
        cx={x}
        cy={y}
        r={radius}
        fill={color}
        opacity={opacity}
      />
    );
  });
};

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
    paddingTop: 12,
    paddingBottom: 6,
    gap: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: babbleColors.text,
    fontFamily: babbleTypography.heading,
  },
  headerSubtitle: {
    fontSize: 14,
    color: babbleColors.muted,
    fontFamily: babbleTypography.body,
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  mapContent: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  mapBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff7f2',
    borderRadius: 32,
  },
  gradientBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.65,
  },
  blobOne: {
    width: 420,
    height: 420,
    left: -120,
    top: -80,
    backgroundColor: '#ffe4ec',
  },
  blobTwo: {
    width: 520,
    height: 520,
    right: -160,
    top: 140,
    backgroundColor: '#dff4f5',
  },
  blobThree: {
    width: 480,
    height: 480,
    left: 220,
    bottom: -200,
    backgroundColor: '#fff0d8',
  },
  cloud: {
    position: 'absolute',
    width: 140,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.75)',
    shadowColor: '#e9d7cf',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cloudOne: {
    left: 120,
    top: 90,
  },
  cloudTwo: {
    left: 540,
    top: 300,
    width: 120,
  },
  cloudThree: {
    left: 820,
    top: 120,
    width: 160,
  },
  star: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  starOne: { left: 260, top: 60 },
  starTwo: { left: 620, top: 120 },
  starThree: { left: 920, top: 260 },
  starFour: { left: 440, top: 380 },
  pathLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  node: {
    position: 'absolute',
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: babbleRadii.card,
    backgroundColor: '#fffdfb',
    borderWidth: 1,
    borderColor: '#f2d9cf',
    gap: 10,
    ...babbleShadow,
  },
  nodePressed: {
    transform: [{ scale: 0.98 }],
  },
  nodeLocked: {
    opacity: 0.6,
    backgroundColor: '#f9f3f1',
  },
  nodeCompleted: {
    borderColor: '#f1b5a5',
  },
  nodeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffe7df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeIcon: {
    fontSize: 22,
  },
  nodeTextWrap: {
    flex: 1,
    gap: 2,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.text,
    fontFamily: babbleTypography.body,
  },
  nodeTitleLocked: {
    color: '#9a8b86',
  },
  nodeStatus: {
    fontSize: 12,
    color: '#6a7a7a',
    fontFamily: babbleTypography.body,
  },
  nodeStatusLocked: {
    color: '#b1a4a0',
  },
  nodeStatusDone: {
    color: '#a36b5d',
  },
  badgeLocked: {
    position: 'absolute',
    right: 10,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3e6e1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ead6cf',
  },
  badgeDone: {
    position: 'absolute',
    right: 10,
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffe4dc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f4c9bb',
  },
  badgeText: {
    fontSize: 12,
    color: '#8f5246',
  },
  recenterButton: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: babbleColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: babbleRadii.pill,
    ...babbleShadow,
  },
  recenterPressed: {
    transform: [{ scale: 0.97 }],
  },
  recenterText: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.primaryText,
    fontFamily: babbleTypography.body,
  },
});
