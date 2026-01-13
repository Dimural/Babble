import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

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
      <Text style={styles.title}>
        hi, welcome to babble {email ?? ''}
      </Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111',
  },
});
