import { create } from 'zustand';

export const useGameStore = create((set) => ({
  username: "",
  totalScore: 0,
  rank: "Rookie",
  
  setUsername: (name) => set({ username: name }),
  
  addScore: (points) => set((state) => {
    const newScore = state.totalScore + points;
    // Puan bazlı rank mantığı
    let newRank = "Rookie";
    if (newScore > 500) newRank = "Pro";
    if (newScore > 1500) newRank = "All-Star";
    if (newScore > 3000) newRank = "Legend";
    
    return { totalScore: newScore, rank: newRank };
  }),
}));