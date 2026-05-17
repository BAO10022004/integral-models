import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy1Cru6XT5EPDegCtWWhfc6Oy74teb_3U",
  authDomain: "ogiabao-dcbd3.firebaseapp.com",
  projectId: "ogiabao-dcbd3",
  storageBucket: "ogiabao-dcbd3.firebasestorage.app",
  messagingSenderId: "25612427483",
  appId: "1:25612427483:web:5c7c178b24c476c3812cfe",
  measurementId: "G-5HZQWPFV21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider, signInWithPopup };
