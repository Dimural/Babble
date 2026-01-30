export type LessonStep = {
  id: string;
  type: 'intro' | 'tap' | 'choice' | 'true_false';
  title: string;
  prompt?: string;
  options?: string[];
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  locked?: boolean;
  steps: LessonStep[];
};

export type LessonModule = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  locked?: boolean;
};

export const lessonModules: LessonModule[] = [
  {
    id: 'module-1',
    title: 'Getting Started',
    description: 'Start with the calm basics every new parent can try today.',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Meet your baby cues',
        duration: '3 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Tiny signals have meaning',
            prompt: 'Notice yawns, clenched fists, and wiggly legs.',
          },
          {
            id: 'step-2',
            type: 'choice',
            title: 'What does a yawn usually mean?',
            options: ['Hunger', 'Sleepy', 'Overheated'],
          },
        ],
      },
      {
        id: 'lesson-2',
        title: 'Safe sleep setup',
        duration: '4 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Clear crib, calm baby',
            prompt: 'A firm mattress and no loose bedding keeps sleep safe.',
          },
          {
            id: 'step-2',
            type: 'true_false',
            title: 'Stuffed toys are safe for newborn sleep.',
          },
        ],
      },
      {
        id: 'lesson-3',
        title: 'Swaddling basics',
        duration: '3 min',
        steps: [
          {
            id: 'step-1',
            type: 'tap',
            title: 'Keep it snug, not tight',
            prompt: 'Leave room for hips and breathing.',
          },
        ],
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Soothing & Sleep',
    description: 'Gentle ways to help baby settle and rest.',
    locked: false,
    lessons: [
      {
        id: 'lesson-4',
        title: 'The five S routine',
        duration: '5 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Soothe with rhythm',
            prompt: 'Swaddle, side, shush, swing, and suck.',
          },
        ],
      },
      {
        id: 'lesson-5',
        title: 'Bedtime cues',
        duration: '4 min',
        locked: true,
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Spot sleepy signals',
            prompt: 'Watch for rubs, yawns, and glazed eyes.',
          },
        ],
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Feeding Foundations',
    description: 'Comfortable holds and simple routines for feeding time.',
    locked: true,
    lessons: [
      {
        id: 'lesson-6',
        title: 'Bottle basics',
        duration: '4 min',
        locked: true,
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Keep baby upright',
            prompt: 'Support the head and pace the feed.',
          },
        ],
      },
    ],
  },
];
