import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';
import { firebase } from '@/lib/firebase';

const noop = () => {};

export default function ProfileScreen() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [gentleReminders, setGentleReminders] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const signOut = async () => {
    await firebase.auth().signOut();
  };

  if (!authReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>B</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>New Parent</Text>
            <Text style={styles.profileEmail}>{user.email ?? 'hello@babble.app'}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#e9e0dc', true: babbleColors.secondary }}
              thumbColor={babbleColors.card}
            />
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Gentle reminders</Text>
            <Switch
              value={gentleReminders}
              onValueChange={setGentleReminders}
              trackColor={{ false: '#e9e0dc', true: babbleColors.primary }}
              thumbColor={babbleColors.card}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Pressable onPress={noop} style={styles.actionRow}>
            <Text style={styles.actionText}>Help / FAQ</Text>
          </Pressable>
          <Pressable onPress={noop} style={styles.actionRow}>
            <Text style={styles.actionText}>About Babble</Text>
          </Pressable>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <Pressable onPress={noop} style={[styles.actionRow, styles.warningRow]}>
            <Text style={styles.warningText}>Reset progress</Text>
          </Pressable>
        </View>
        <Pressable onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: babbleRadii.card,
    backgroundColor: babbleColors.card,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    ...babbleShadow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: babbleColors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: babbleColors.primaryText,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: babbleColors.text,
  },
  profileEmail: {
    marginTop: 4,
    fontSize: 13,
    color: babbleColors.muted,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.text,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: babbleRadii.card,
    backgroundColor: '#fffaf6',
    borderWidth: 1,
    borderColor: babbleColors.outline,
  },
  preferenceLabel: {
    fontSize: 14,
    color: babbleColors.text,
  },
  actionRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: babbleRadii.card,
    backgroundColor: '#fffaf6',
    borderWidth: 1,
    borderColor: babbleColors.outline,
  },
  actionText: {
    fontSize: 14,
    color: babbleColors.text,
  },
  warningRow: {
    backgroundColor: '#fff1e9',
  },
  warningText: {
    fontSize: 14,
    color: babbleColors.primaryText,
  },
  signOutButton: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: babbleRadii.pill,
    backgroundColor: babbleColors.secondary,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: babbleColors.secondaryText,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 180,
    height: 180,
    backgroundColor: '#fde2d5',
    top: -70,
    right: -70,
  },
});
