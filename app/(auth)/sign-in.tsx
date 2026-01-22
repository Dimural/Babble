import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  babbleColors,
  babbleRadii,
  babbleShadow,
  babbleTypography,
} from '@/constants/babble-theme';
import { firebase } from '@/lib/firebase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<firebase.User | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const signUp = async () => {
    if (!email || !password) return setStatus('Enter email and password.');
    setLoading(true);
    setStatus('');
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      setStatus('User created!');
    } catch (error) {
      setStatus('Error creating user, try a different email or password');
    }
    setLoading(false);
  };

  const signIn = async () => {
    if (!email || !password) return setStatus('Enter email and password.');
    setLoading(true);
    setStatus('');
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      setStatus('Signed in!');
    } catch (error) {
      setStatus('Invalid email or password');
    }
    setLoading(false);
  };

  if (!authReady) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(onboarding)" />;
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobMiddle]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />
      <View style={styles.card}>
        <Text style={styles.brand}>babble</Text>
        <Text style={styles.subtitle}>gentle updates for early care</Text>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="hello@family.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholderTextColor={babbleColors.placeholder}
              style={styles.input}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Your secure password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              placeholderTextColor={babbleColors.placeholder}
              style={styles.input}
            />
          </View>
          <Pressable
            onPress={signIn}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>
          <Pressable
            onPress={signUp}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </Pressable>
          {loading && (
            <ActivityIndicator style={styles.loader} color={babbleColors.primaryText} />
          )}
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: babbleColors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: babbleRadii.card,
    backgroundColor: babbleColors.card,
    gap: 16,
    borderWidth: 1,
    borderColor: babbleColors.outline,
    ...babbleShadow,
  },
  brand: {
    fontSize: 40,
    textAlign: 'center',
    color: babbleColors.primaryText,
    letterSpacing: 1.4,
    fontFamily: babbleTypography.brand,
  },
  subtitle: {
    textAlign: 'center',
    color: babbleColors.muted,
    fontSize: 14,
    marginTop: -10,
  },
  form: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: babbleColors.primaryText,
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: babbleColors.inputBorder,
    borderRadius: babbleRadii.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: babbleColors.inputBackground,
    color: babbleColors.text,
  },
  button: {
    borderRadius: babbleRadii.pill,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: babbleColors.primary,
  },
  primaryButtonText: {
    color: babbleColors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: babbleColors.secondary,
  },
  secondaryButtonText: {
    color: babbleColors.secondaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  loader: {
    marginTop: 4,
  },
  status: {
    textAlign: 'center',
    color: babbleColors.status,
    fontSize: 13,
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
    left: -60,
  },
  blobMiddle: {
    width: 140,
    height: 140,
    backgroundColor: '#f7e7c9',
    top: 120,
    right: -50,
  },
  blobBottom: {
    width: 260,
    height: 260,
    backgroundColor: '#d9f0f1',
    bottom: -120,
    right: -90,
  },
});
