import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';

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
      <Text style={styles.title}>Firebase Auth Demo</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Sign Up" onPress={signUp} disabled={loading} />
      <Button title="Sign In" onPress={signIn} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 20,
    gap: 10,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f7f9fc',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  status: {
    marginTop: 6,
    textAlign: 'center',
    color: '#444',
  },
});
