// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-4906469775-807b5",
  "appId": "1:758130423442:web:28dbda1677d4958f42584b",
  "apiKey": "AIzaSyCx_lms979SlHuZv9BkFlB0xvtXb4Haey8",
  "authDomain": "studio-4906469775-807b5.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "758130423442"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
