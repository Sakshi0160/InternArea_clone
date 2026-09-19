import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBuhgAuc17Mh3rU16ZatDEQGlaOFYSnm_E",
  authDomain: "internshala-9e300-fb462.firebaseapp.com",
  projectId: "internshala-9e300-fb462",
  storageBucket: "internshala-9e300-fb462.firebasestorage.app",
  messagingSenderId: "751320910169",
  appId: "1:751320910169:web:8aee7c726ef831fb4d2448",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };