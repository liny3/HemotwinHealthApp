import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, RecaptchaVerifier, signInWithPhoneNumber, initializeAuth, getReactNativePersistence} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";

// Import the functions you need from the SDKs you need
const firebaseConfig = {
  apiKey: "AIzaSyCoNIXSVs1YRUd_VpCRT7uKE5pyr-odW04",
  authDomain: "health-aec37.firebaseapp.com",
  projectId: "health-aec37",
  storageBucket: "health-aec37.firebasestorage.app",
  messagingSenderId: "736357675117",
  appId: "1:736357675117:web:21efc0b58f299bb1444f64"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, RecaptchaVerifier, signInWithPhoneNumber, collection, doc, setDoc, getDoc };