import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobMiddle]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />
      <View style={styles.card}>
        <Text style={styles.brand}>babble</Text>
        <Text style={styles.subtitle}>gentle updates for early care</Text>
        <Text style={styles.title}>Sign in to keep families close</Text>
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
              placeholderTextColor={colors.placeholder}
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
              placeholderTextColor={colors.placeholder}
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
          {loading && <ActivityIndicator style={styles.loader} color={colors.primaryText} />}
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const colors = {
  background: '#fdf6f0',
  card: '#ffffff',
  primary: '#f4b6a6',
  primaryText: '#4a2c23',
  secondary: '#b9e0e2',
  secondaryText: '#24474a',
  inputBackground: '#fffaf6',
  inputBorder: '#f0d7cd',
  label: '#6f4f45',
  text: '#2f2623',
  muted: '#7f6c66',
  placeholder: '#b8a6a1',
  status: '#8b4a3d',
  shadow: '#dcc9bf',
};

const styles = StyleSheet.create({
  screen: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 28,
    backgroundColor: colors.card,
    gap: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  brand: {
    fontSize: 40,
    textAlign: 'center',
    color: colors.primaryText,
    letterSpacing: 1.4,
    fontFamily: Platform.select({
      ios: 'Cochin',
      android: 'serif',
      default: 'serif',
    }),
  },
  subtitle: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 14,
    marginTop: -10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
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
    color: colors.label,
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.inputBackground,
    color: colors.text,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  secondaryButtonText: {
    color: colors.secondaryText,
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
    color: colors.status,
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
