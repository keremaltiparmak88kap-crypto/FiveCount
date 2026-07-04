// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
 
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
export const auth = getAuth(app); // anonim giriş için (leaderboard'da her oyuncunun benzersiz ID'si olsun diye)
 
// Eski uploadScore fonksiyonun — geriye dönük uyumluluk için korundu.
// Not: Leaderboard sistemi artık store.js'teki addScore() üzerinden
// players / dailyScores / gameScores koleksiyonlarına otomatik yazıyor,
// bu fonksiyonu ayrıca çağırmana gerek yok (ama başka yerde kullanıyorsan bozulmasın diye burada.)
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
 