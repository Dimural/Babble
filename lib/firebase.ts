import Constants from 'expo-constants';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/database';

const firebaseConfig = Constants.expoConfig?.extra?.firebase;

if (!firebaseConfig) {
  throw new Error('Missing Firebase config. Check app.config.js and your .env values.');
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };
