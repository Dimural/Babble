import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';

const AGE_RANGES = ['Expecting', '0-3 months', '3-6 months', '6-12 months'];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [newParent, setNewParent] = useState<'yes' | 'no' | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);

  const isLastStep = step === 2;

  const handleNext = () => {
    if (isLastStep) {
      router.replace('/(tabs)');
      return;
    }
    setStep((prev) => prev + 1);
  };

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />
      <View style={styles.card}>
        <View style={styles.progressDots}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[styles.dot, index === step && styles.dotActive]}
            />
          ))}
        </View>
        {step === 0 && (
          <View style={styles.step}>
            <Text style={styles.brand}>babble</Text>
            <Text style={styles.title}>Welcome to your care journey</Text>
            <Text style={styles.body}>
              Short, gentle lessons to help you feel confident with the basics.
            </Text>
          </View>
        )}
        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.title}>Are you a new parent?</Text>
            <View style={styles.choiceRow}>
              <Pressable
                onPress={() => setNewParent('yes')}
                style={[
                  styles.choiceChip,
                  newParent === 'yes' && styles.choiceChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.choiceText,
                    newParent === 'yes' && styles.choiceTextActive,
                  ]}
                >
                  Yes
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setNewParent('no')}
                style={[
                  styles.choiceChip,
                  newParent === 'no' && styles.choiceChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.choiceText,
                    newParent === 'no' && styles.choiceTextActive,
                  ]}
                >
                  No
                </Text>
              </Pressable>
            </View>
          </View>
        )}
        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.title}>Baby age range (optional)</Text>
            <View style={styles.choiceWrap}>
              {AGE_RANGES.map((range) => (
                <Pressable
                  key={range}
                  onPress={() => setAgeRange(range)}
                  style={[
                    styles.choiceChip,
                    ageRange === range && styles.choiceChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      ageRange === range && styles.choiceTextActive,
                    ]}
                  >
                    {range}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        <View style={styles.actions}>
          <Pressable onPress={() => router.replace('/(tabs)')} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          <View style={styles.actionsRight}>
            {step > 0 && (
              <Pressable onPress={() => setStep((prev) => prev - 1)} style={styles.backButton}>
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            )}
            <Pressable onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>{isLastStep ? 'Finish' : 'Continue'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: babbleColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: babbleColors.card,
    borderRadius: babbleRadii.card,
    padding: 24,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    gap: 20,
    ...babbleShadow,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f2ece8',
  },
  dotActive: {
    backgroundColor: babbleColors.primary,
  },
  step: {
    gap: 14,
    alignItems: 'center',
  },
  brand: {
    fontSize: 40,
    color: babbleColors.primaryText,
    letterSpacing: 1.2,
    fontFamily: babbleTypography.brand,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: babbleColors.text,
    textAlign: 'center',
    fontFamily: babbleTypography.heading,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: babbleColors.muted,
    textAlign: 'center',
    fontFamily: babbleTypography.body,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  choiceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: babbleRadii.pill,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    backgroundColor: '#fffaf6',
  },
  choiceChipActive: {
    backgroundColor: babbleColors.secondary,
    borderColor: babbleColors.secondary,
  },
  choiceText: {
    fontSize: 13,
    color: babbleColors.text,
  },
  choiceTextActive: {
    color: babbleColors.secondaryText,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsRight: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  skipText: {
    fontSize: 13,
    color: babbleColors.muted,
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: babbleRadii.pill,
    backgroundColor: '#f2ece8',
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: babbleColors.muted,
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: babbleRadii.pill,
    backgroundColor: babbleColors.primary,
  },
  nextText: {
    fontSize: 13,
    fontWeight: '600',
    color: babbleColors.primaryText,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 220,
    height: 220,
    backgroundColor: '#fde2d5',
    top: -80,
    left: -80,
  },
  blobBottom: {
    width: 260,
    height: 260,
    backgroundColor: '#d9f0f1',
    bottom: -120,
    right: -90,
  },
});
