export type LessonStepType = 'intro' | 'tap' | 'choice' | 'true_false';

export type LessonStep = {
  id: string;
  type: LessonStepType;
  title: string;
  prompt?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  steps: LessonStep[];
};

export type LessonModule = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export const lessonModules: LessonModule[] = [
  {
    id: 'module-1',
    title: 'Responsive Foundations',
    description: 'Build trust by learning what newborn behavior is normal and how to respond.',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Newborn Behavior 101',
        duration: '6 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Your baby\'s first job is to build trust',
            prompt:
              'The handbook emphasizes responsive parenting: meeting needs for food, comfort, and sleep builds secure attachment.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Normal can still feel surprising',
            prompt:
              'Many newborn behaviors that worry parents are normal and temporary. Ask concerns at well-baby visits.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'Which response best builds trust?',
            options: [
              'Consistently respond to hunger, comfort, and sleep cues',
              'Wait until baby cries for a long time each time',
              'Keep a strict schedule and ignore cues',
            ],
            correctAnswer: 'Consistently respond to hunger, comfort, and sleep cues',
            explanation:
              'The handbook highlights responsive caregiving as the foundation of early development and trust.',
          },
          {
            id: 'step-4',
            type: 'true_false',
            title: 'All babies should react exactly the same way to the same situation.',
            correctAnswer: 'False',
            explanation:
              'Every baby is an individual with a different temperament and pattern of development.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Parent practice',
            prompt:
              'Today, narrate one care activity (feeding, diapering, soothing). Calm voice + consistent response reinforces trust.',
          },
        ],
      },
      {
        id: 'lesson-2',
        title: 'Normal Reflexes vs Warning Signs',
        duration: '7 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Immature nervous system behaviors are common',
            prompt:
              'The handbook notes many early movements are harmless reflexes that often fade by two to three months.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Examples of normal reflex-like behavior',
            prompt:
              'Chin trembling and brief jitteriness can occur in newborns. Context and persistence matter.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'When should jitteriness prompt a call to the doctor?',
            options: [
              'If tremors continue during sucking or feel persistent',
              'Any single startle reflex once',
              'Only after six months',
            ],
            correctAnswer: 'If tremors continue during sucking or feel persistent',
            explanation:
              'The handbook flags ongoing tremor-like activity (especially during feeding) as a reason to contact your clinician.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'Colic pattern in the handbook follows which rule?',
            options: [
              'More than 3 hours/day, more than 3 days/week, for more than 3 weeks',
              'More than 1 hour/day for 1 week',
              'Only nighttime crying for 2 days',
            ],
            correctAnswer: 'More than 3 hours/day, more than 3 days/week, for more than 3 weeks',
            explanation:
              'The handbook describes the classic rule-of-3 pattern for colic and notes it usually peaks around six weeks.',
          },
          {
            id: 'step-5',
            type: 'true_false',
            title: 'Colic usually lasts forever if not treated with medication.',
            correctAnswer: 'False',
            explanation:
              'The handbook notes colic usually improves and often resolves by about four months.',
          },
        ],
      },
      {
        id: 'lesson-3',
        title: 'Temperature and When to Call',
        duration: '6 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Fever thresholds matter in newborns',
            prompt:
              'The handbook states that for newborns, if rectal temperature is over 100.4 F (38.0 C), you should contact medical care.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'How to check',
            prompt:
              'Digital rectal temperature is described as the most accurate method for newborns.',
          },
          {
            id: 'step-3',
            type: 'true_false',
            title: 'A rectal temperature of 100.5 F in a newborn should be treated as urgent and reported.',
            correctAnswer: 'True',
            explanation:
              'Yes. The handbook uses 100.4 F (38.0 C) rectal as the key threshold for calling.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'Best tool for newborn temperature based on the handbook?',
            options: ['Digital rectal thermometer', 'Forehead strip', 'Ear thermometer only'],
            correctAnswer: 'Digital rectal thermometer',
            explanation:
              'The handbook specifically identifies digital rectal temperature as the most accurate for newborns.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Action memory',
            prompt:
              'Save your pediatric office number and local emergency numbers now so you can act fast when needed.',
          },
        ],
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Safe Sleep and Home Safety',
    description: 'Create a safe sleep setup and reduce avoidable risks at home and in transit.',
    lessons: [
      {
        id: 'lesson-4',
        title: 'Safe Sleep Core Rules',
        duration: '7 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Back to sleep for the first year',
            prompt:
              'The handbook follows AAP safe sleep guidance: place babies on their backs to sleep during the first year.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Use a safety-approved sleep surface',
            prompt:
              'Cribs and bassinets should meet current safety standards and remain clear of unsafe loose items.',
          },
          {
            id: 'step-3',
            type: 'true_false',
            title: 'Placing baby on their side is safer than placing them on their back.',
            correctAnswer: 'False',
            explanation:
              'The handbook guidance is to place infants on their backs for sleep during the first year.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'Which sleep setup is safest?',
            options: [
              'Baby on back in a safety-approved crib/bassinet',
              'Baby on tummy with extra blankets',
              'Baby in car seat overnight',
            ],
            correctAnswer: 'Baby on back in a safety-approved crib/bassinet',
            explanation:
              'Safe position + safe sleep surface is the core recommendation in the handbook.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Quick room check',
            prompt: 'Do a 30-second crib check each night: clear space, baby on back, no loose add-ons.',
          },
        ],
      },
      {
        id: 'lesson-5',
        title: 'Nursery Environment',
        duration: '6 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Fresh air and safe heating',
            prompt:
              'The handbook recommends good ventilation and warns against open gas heaters in newborn rooms.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Safer heating choice',
            prompt:
              'Electric heat or a ventilated gas heater is preferred. If only open gas heat is available, increase ventilation.',
          },
          {
            id: 'step-3',
            type: 'true_false',
            title: 'An open gas heater in a newborn room is recommended.',
            correctAnswer: 'False',
            explanation:
              'The handbook advises against open gas heaters in baby rooms because of air quality and safety concerns.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'What is a key environmental goal for newborn rooms?',
            options: ['Good airflow and ventilation', 'Fully sealed windows at all times', 'Strong fragrance products'],
            correctAnswer: 'Good airflow and ventilation',
            explanation:
              'The handbook emphasizes ventilation, especially when baby has cold symptoms.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Home setup challenge',
            prompt: 'Pick one airflow improvement today: safe fan direction, adjacent-room ventilation, or a quick air check.',
          },
        ],
      },
      {
        id: 'lesson-6',
        title: 'Car Seat and Travel Basics',
        duration: '6 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Car seat safety every single ride',
            prompt:
              'The handbook stresses proper infant seat use in the car and avoiding unapproved inserts/padding.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Use only approved seat accessories',
            prompt:
              'Avoid adding products unless they came with the seat or were made by the seat manufacturer.',
          },
          {
            id: 'step-3',
            type: 'true_false',
            title: 'Homemade padding under baby improves safety in the car seat.',
            correctAnswer: 'False',
            explanation:
              'The handbook advises against unapproved padding or inserts because they can alter fit and safety performance.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'Before international travel with a young infant, what does the handbook advise?',
            options: [
              'Talk to your doctor first',
              'Travel plans do not need medical discussion',
              'Wait for online advice only',
            ],
            correctAnswer: 'Talk to your doctor first',
            explanation:
              'The handbook recommends discussing travel plans, especially international travel, with your provider.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Safety habit',
            prompt: 'Make a pre-ride checklist: buckle fit, chest clip position, and no loose aftermarket accessories.',
          },
        ],
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Breastfeeding Essentials',
    description: 'Understand early milk production, latching, and feeding rhythms from birth onward.',
    lessons: [
      {
        id: 'lesson-7',
        title: 'Feed Early and Often',
        duration: '8 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Start as early as possible',
            prompt:
              'The handbook notes breastfeeding is more successful when started close to birth, with early skin-to-skin encouraged.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Feeding frequency target',
            prompt:
              'Newborns should wake and feed frequently, at least eight or more times in 24 hours.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'Early newborn feeding pattern that matches the handbook:',
            options: [
              'At least 8 or more feeds in 24 hours',
              'Exactly 4 feeds per day only',
              'One long feeding every 8 hours',
            ],
            correctAnswer: 'At least 8 or more feeds in 24 hours',
            explanation:
              'Frequent feeding supports hydration, growth, and milk supply in the early weeks.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'During the early period, nighttime feeding guidance is:',
            options: [
              'Wake every 3 hours at night at first',
              'Never wake baby for feeds',
              'Only feed once overnight',
            ],
            correctAnswer: 'Wake every 3 hours at night at first',
            explanation:
              'The handbook describes waking every three hours at night early on, then adjusting once feeding/growth are established.',
          },
          {
            id: 'step-5',
            type: 'true_false',
            title: 'Only breast milk or an FDA-approved formula should be used as milk sources in early newborn life.',
            correctAnswer: 'True',
            explanation:
              'The handbook states breast milk or FDA-approved infant formula are the appropriate milk options.',
          },
        ],
      },
      {
        id: 'lesson-8',
        title: 'Colostrum and Milk Transition',
        duration: '7 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Colostrum is normal and powerful',
            prompt:
              'Early milk (colostrum) is described as thick, small in volume, and rich in protein/protective factors.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Normal timing',
            prompt:
              'The handbook describes milk transition over the first days, with fuller breasts and more audible swallowing as supply increases.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'Which statement about colostrum is accurate?',
            options: [
              'It is small in amount but nutrient/protein rich',
              'It means milk supply has failed',
              'It should be discarded',
            ],
            correctAnswer: 'It is small in amount but nutrient/protein rich',
            explanation:
              'Colostrum is expected in the early days and supports newborn transition and protection.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'A sign milk is coming in includes:',
            options: [
              'Full/tender breasts with baby swallowing sounds',
              'No swallowing and fewer feeds',
              'Always painful hard lumps only',
            ],
            correctAnswer: 'Full/tender breasts with baby swallowing sounds',
            explanation:
              'The handbook lists fuller breasts, milk leakage, and hearing baby swallow as useful signs.',
          },
          {
            id: 'step-5',
            type: 'true_false',
            title: 'Frequent feeding can help reduce engorgement risk.',
            correctAnswer: 'True',
            explanation:
              'The handbook recommends feeding often and using comfort strategies if engorgement develops.',
          },
        ],
      },
      {
        id: 'lesson-9',
        title: 'Latch and Comfort',
        duration: '8 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Deep latch protects nipples',
            prompt:
              'The handbook explains shallow latch is a major cause of nipple soreness and encourages deep asymmetrical latch support.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Positioning basics',
            prompt:
              'Bring baby to the breast (not breast to baby), keep baby close chest-to-chest, and avoid pulling nipple out abruptly.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'What commonly causes sore nipples early on?',
            options: ['Shallow latch', 'Feeding on demand', 'Skin-to-skin contact'],
            correctAnswer: 'Shallow latch',
            explanation:
              'The handbook calls out shallow latching as a main cause of nipple soreness/cracking.',
          },
          {
            id: 'step-4',
            type: 'true_false',
            title: 'You should pull the nipple straight out while baby is still suctioned to detach quickly.',
            correctAnswer: 'False',
            explanation:
              'Break suction first (for example with a clean finger) to avoid nipple trauma.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Support plan',
            prompt:
              'If soreness is severe or feeding is ineffective, contact your provider or lactation support early.',
          },
        ],
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Formula and Bottle Feeding',
    description: 'Feed safely with paced technique and hygienic formula preparation.',
    lessons: [
      {
        id: 'lesson-10',
        title: 'Safe Formula Preparation',
        duration: '7 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Not all formula forms are sterile',
            prompt:
              'The handbook notes powdered and concentrate formulas are not sterile and must be prepared and handled carefully.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Core preparation reminders',
            prompt:
              'Use clean safe water and follow exact mixing steps. The handbook emphasizes water first, formula second.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'Which formula type is sterile in packaging?',
            options: ['Ready-to-feed formula', 'Powder formula', 'Concentrate formula'],
            correctAnswer: 'Ready-to-feed formula',
            explanation:
              'The handbook identifies ready-to-feed as sterile and directly usable, unlike powder/concentrate.',
          },
          {
            id: 'step-4',
            type: 'true_false',
            title: 'Prepared formula can sit at room temperature for several hours.',
            correctAnswer: 'False',
            explanation:
              'The handbook states prepared formula should be used promptly (generally within about one hour).',
          },
          {
            id: 'step-5',
            type: 'choice',
            title: 'What does the handbook say newborns do NOT need as extra hydration?',
            options: ['Water', 'Breast milk or formula', 'Regular feeds'],
            correctAnswer: 'Water',
            explanation:
              'Breast milk or properly prepared formula provide the fluid newborns need unless directed otherwise.',
          },
        ],
      },
      {
        id: 'lesson-11',
        title: 'Paced Bottle Feeding',
        duration: '7 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Slow the flow so baby can lead',
            prompt:
              'The handbook recommends upright, paced feeding to let newborns regulate intake and reduce choking/overfeeding risk.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Technique',
            prompt:
              'Hold baby upright, begin with nipple touch and latch, then tip bottle gradually; pause for burps and side switching.',
          },
          {
            id: 'step-3',
            type: 'true_false',
            title: 'Propping the bottle is a safe way to free your hands during feeding.',
            correctAnswer: 'False',
            explanation:
              'The handbook says never prop bottles because of choking, ear infection, and intake concerns.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'A paced-feeding break after 1-2 ounces helps with:',
            options: ['Burping and fullness awareness', 'Making baby eat faster', 'Skipping baby cues'],
            correctAnswer: 'Burping and fullness awareness',
            explanation:
              'Short pauses support digestion and help baby register fullness.',
          },
          {
            id: 'step-5',
            type: 'true_false',
            title: 'Putting baby to bed with a bottle is recommended for longer sleep.',
            correctAnswer: 'False',
            explanation:
              'The handbook says never put baby to bed with a bottle.',
          },
        ],
      },
      {
        id: 'lesson-12',
        title: 'What to Feed and What to Avoid',
        duration: '6 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Only infant-appropriate milk options',
            prompt:
              'The handbook states newborn feeding should be breast milk or iron-fortified infant formula when formula is used.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Avoid substitute drinks',
            prompt:
              'The handbook warns against feeding other milks/drinks (for example plant drinks) to newborns.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'Which is appropriate for routine newborn feeding?',
            options: ['Iron-fortified infant formula', 'Almond milk', 'Diluted juice'],
            correctAnswer: 'Iron-fortified infant formula',
            explanation:
              'The handbook recommends infant formula specifically designed for this age when not exclusively breastfeeding.',
          },
          {
            id: 'step-4',
            type: 'true_false',
            title: 'Newborns should be given extra plain water daily.',
            correctAnswer: 'False',
            explanation:
              'The handbook says breast milk/formula covers hydration needs in early infancy unless your clinician advises otherwise.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Confidence check',
            prompt:
              'If feeding choices feel confusing, ask your pediatric team before introducing any non-recommended liquids.',
          },
        ],
      },
    ],
  },
  {
    id: 'module-5',
    title: 'Daily Care, Diapers, and Red Flags',
    description: 'Master hygiene, output tracking, and urgent warning signs for newborn care.',
    lessons: [
      {
        id: 'lesson-13',
        title: 'Bathing and Skin Care',
        duration: '7 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Gentle, organized bathing',
            prompt:
              'The handbook advises preparing supplies before bathing and cleaning newborn skin folds carefully while keeping baby warm.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Cord and mouth cautions',
            prompt:
              'Keep the umbilical stump clean/dry as it heals (often around a few weeks), and do not wash inside baby\'s mouth.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'How should toenails be shaped?',
            options: ['Straight across', 'Rounded deeply at corners', 'Do not trim at all'],
            correctAnswer: 'Straight across',
            explanation:
              'The handbook advises filing toenails straight across and fingernails slightly rounded.',
          },
          {
            id: 'step-4',
            type: 'choice',
            title: 'For cleaning baby girls during diaper care, direction should be:',
            options: ['Front to back', 'Back to front', 'Direction does not matter'],
            correctAnswer: 'Front to back',
            explanation:
              'Front-to-back cleaning helps reduce infection risk.',
          },
          {
            id: 'step-5',
            type: 'true_false',
            title: 'For an uncircumcised newborn penis, routine forced foreskin retraction is needed now.',
            correctAnswer: 'False',
            explanation:
              'The handbook says it is not necessary to retract foreskin in newborn care.',
          },
        ],
      },
      {
        id: 'lesson-14',
        title: 'Diaper Output and Hydration Signals',
        duration: '7 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Diapers tell a story',
            prompt:
              'The handbook recommends tracking urine and stool output in early days to monitor hydration and feeding effectiveness.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Output rises as intake rises',
            prompt:
              'As feeding volume increases over the first days, wet diapers and stools should generally increase too.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'Which trend is expected when baby is feeding better over the first days?',
            options: [
              'More wet and stool diapers',
              'No change in diapers at all',
              'Progressively fewer wet diapers every day',
            ],
            correctAnswer: 'More wet and stool diapers',
            explanation:
              'The handbook describes rising diaper output as milk/formula intake increases.',
          },
          {
            id: 'step-4',
            type: 'true_false',
            title: 'It is useful to keep track of wet and stool diapers in the newborn period.',
            correctAnswer: 'True',
            explanation:
              'Yes. Tracking output helps you and your care team evaluate feeding and hydration.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Simple tracking plan',
            prompt:
              'Track feeds + wet + stools for the first weeks. Bring this log to pediatric visits if questions come up.',
          },
        ],
      },
      {
        id: 'lesson-15',
        title: 'Normal Newborn Body Findings',
        duration: '8 min',
        steps: [
          {
            id: 'step-1',
            type: 'intro',
            title: 'Many body findings are temporary',
            prompt:
              'The handbook explains several newborn findings are common and usually improve with time, while some need follow-up.',
          },
          {
            id: 'step-2',
            type: 'tap',
            title: 'Examples from the handbook',
            prompt:
              'Hydrocele can resolve over months, blocked tear ducts often clear by age 1, and molded head shape usually improves.',
          },
          {
            id: 'step-3',
            type: 'choice',
            title: 'Which statement is accurate?',
            options: [
              'A blocked tear duct in infancy often clears over time',
              'All newborn eye discharge is always harmless and never needs advice',
              'Any scrotal swelling should always be ignored',
            ],
            correctAnswer: 'A blocked tear duct in infancy often clears over time',
            explanation:
              'The handbook notes many blocked tear ducts clear naturally, but persistent yellow discharge or worsening signs should be discussed.',
          },
          {
            id: 'step-4',
            type: 'true_false',
            title: 'Hydrocele in newborn boys is always painful and usually an emergency.',
            correctAnswer: 'False',
            explanation:
              'The handbook describes hydrocele as commonly painless and often self-resolving, with routine monitoring advised.',
          },
          {
            id: 'step-5',
            type: 'tap',
            title: 'Clinical judgment still matters',
            prompt:
              'If swelling, discharge, or behavior seems to worsen, call your pediatric office even when a finding is often normal.',
          },
        ],
      },
    ],
  },
];

export const getAllLessons = () => lessonModules.flatMap((module) => module.lessons);

export const getAllLessonIds = () => getAllLessons().map((lesson) => lesson.id);

export const isLessonUnlocked = (lessonId: string, completedLessonIds: string[]) => {
  const lessonIds = getAllLessonIds();
  const index = lessonIds.indexOf(lessonId);

  if (index <= 0) {
    return true;
  }

  const previousLessonId = lessonIds[index - 1];
  return completedLessonIds.includes(previousLessonId);
};
