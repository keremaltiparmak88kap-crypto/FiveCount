// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwc-nXNkPynQLNCvJMsOHQuWPZOYYChCs",
  authDomain: "fivecourt-16458.firebaseapp.com",
  projectId: "fivecourt-16458",
  storageBucket: "fivecourt-16458.firebasestorage.app",
  messagingSenderId: "687668104819",
  appId: "1:687668104819:web:837077274c4b5bb3a56406"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
import { collection, addDoc } from "firebase/firestore";

export const uploadScore = async (username, game, score) => {
  try {
    await addDoc(collection(db, "leaderboard"), {
      username: username,
      game: game,
      score: score,
      createdAt: new Date()
    });
  } catch (e) {
    console.error("Skor yüklenemedi: ", e);
  }
};