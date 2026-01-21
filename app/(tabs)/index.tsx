import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { firebase } from '@/lib/firebase';

export default function HomeScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setEmail(user?.email ?? null);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    await firebase.auth().signOut();
  };

  if (!authReady) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!email) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />
      <View style={styles.header}>
        <Text style={styles.brand}>babble</Text>
        <Pressable onPress={signOut} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>Welcome back, {email ?? ''}</Text>
      <Text style={styles.title}>Today’s gentle journey</Text>
      <View style={styles.cardRow}>
        <View style={[styles.card, styles.primaryCard]}>
          <Text style={styles.cardTitle}>First steps in care</Text>
          <Text style={styles.cardBody}>
            Learn soothing routines, safe sleep, and tiny wins that build confidence.
          </Text>
          <Pressable onPress={() => {}} style={styles.cta}>
            <Text style={styles.ctaText}>start journey</Text>
          </Pressable>
        </View>
        <View style={[styles.card, styles.secondaryCard]}>
          <Text style={styles.cardTitle}>Baby basics lab</Text>
          <Text style={styles.cardBody}>
            Practice the essentials with playful prompts and quick check-ins.
          </Text>
          <Pressable onPress={() => {}} style={styles.ctaAlt}>
            <Text style={styles.ctaAltText}>start journey</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.milestone}>
        <Text style={styles.milestoneTitle}>Your calm streak</Text>
        <Text style={styles.milestoneValue}>3 days</Text>
        <Text style={styles.milestoneHint}>Keep the momentum with one mini lesson.</Text>
      </View>
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Today’s caregiver tip</Text>
        <Text style={styles.tipBody}>
          Swaddling helps babies feel secure — keep it snug but leave room for hip movement.
        </Text>
      </View>
    </View>
  );
}

const colors = {
  background: '#fdf6f0',
  text: '#2f2623',
  muted: '#7f6c66',
  primary: '#f4b6a6',
  primaryText: '#4a2c23',
  secondary: '#b9e0e2',
  secondaryText: '#24474a',
  card: '#ffffff',
  outline: '#f0d7cd',
  chip: '#f7e7c9',
  shadow: '#dcc9bf',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 34,
    color: colors.primaryText,
    letterSpacing: 1.2,
    fontFamily: Platform.select({
      ios: 'Cochin',
      android: 'serif',
      default: 'serif',
    }),
  },
  signOut: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.chip,
  },
  signOutText: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
  },
  title: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  cardRow: {
    marginTop: 18,
    gap: 14,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  primaryCard: {
    backgroundColor: '#fff7f2',
  },
  secondaryCard: {
    backgroundColor: '#f2fbfb',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  cta: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  ctaText: {
    color: colors.primaryText,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  ctaAlt: {
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: colors.secondary,
  },
  ctaAltText: {
    color: colors.secondaryText,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  milestone: {
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  milestoneValue: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: '700',
    color: colors.primaryText,
  },
  milestoneHint: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
  tipCard: {
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#fffaf6',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tipBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
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
    right: -100,
  },
});
