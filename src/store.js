import { create } from 'zustand';

export const useGameStore = create((set) => ({
  username: "",
  totalScore: 0,
  rank: "Rookie",
  bestScores: {}, // örn: { missing: 80, trivia: 120, manager: 340 }

  setUsername: (name) => set({ username: name }),

  // gameId opsiyonel: belirtilirse o oyunun en iyi skoru da güncellenir
  addScore: (points, gameId) => set((state) => {
    const newScore = state.totalScore + points;

    // Puan bazlı rank mantığı
    let newRank = "Rookie";
    if (newScore > 500) newRank = "Pro";
    if (newScore > 1500) newRank = "All-Star";
    if (newScore > 3000) newRank = "Legend";

    // Oyun bazlı en iyi skor
    const newBestScores = { ...state.bestScores };
    if (gameId && (!newBestScores[gameId] || points > newBestScores[gameId])) {
      newBestScores[gameId] = points;
    }

    return { totalScore: newScore, rank: newRank, bestScores: newBestScores };
  }),
}));