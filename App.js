import Constants from 'expo-constants';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

const{
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId,
    firebaseMeasurementId
} = Constants.expoConfig.extra;

// Your Firebase config object
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  measurementId: firebaseMeasurementId
};

// Initialize Firebase if it's not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Use the default app
}

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const signUp = async () => {
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      alert('User created!');
    } catch (error) {
      alert(error.message);
    }
  };

  const signIn = async () => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert('User signed in!');
    } catch (error) {
      alert(error.message);
    }
  };

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
      setUser(null);
      alert('User signed out!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <Button title="Sign Up" onPress={signUp} />
      <Button title="Sign In" onPress={signIn} />
      <Button title="Sign Out" onPress={signOut} />
      {user && <Text>Welcome, {user.email}</Text>}
    </View>
  );
};

export default App;