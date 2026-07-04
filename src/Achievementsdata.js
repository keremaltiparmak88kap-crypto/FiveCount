// Rozetler mevcut store verisinden (totalScore, bestScores, character, rank) türetilir.
// Yeni bir Firestore yazmaya gerek yok — kilit durumu her render'da otomatik hesaplanır.
 
export const ACHIEVEMENTS = [
  {
    id: "first_steps",
    label: "FIRST STEPS",
    desc: "Score in your first game",
    icon: "🏀",
    check: (s) => Object.keys(s.bestScores).length >= 1
  },
  {
    id: "all_rounder",
    label: "ALL-ROUNDER",
    desc: "Score in 6 different games",
    icon: "🎯",
    check: (s) => Object.keys(s.bestScores).length >= 6
  },
  {
    id: "completionist",
    label: "COMPLETIONIST",
    desc: "Score in every single game",
    icon: "🏆",
    check: (s) => Object.keys(s.bestScores).length >= 12
  },
  {
    id: "rookie_no_more",
    label: "ROOKIE NO MORE",
    desc: "Reach Pro rank (500+ total points)",
    icon: "⭐",
    check: (s) => s.totalScore > 500
  },
  {
    id: "all_star",
    label: "ALL-STAR",
    desc: "Reach All-Star rank (1,500+ total points)",
    icon: "🌟",
    check: (s) => s.totalScore > 1500
  },
  {
    id: "legend_status",
    label: "LEGEND STATUS",
    desc: "Reach Legend rank (3,000+ total points)",
    icon: "👑",
    check: (s) => s.totalScore > 3000
  },
  {
    id: "team_player",
    label: "TEAM PLAYER",
    desc: "Pick your team in 3PT Legend",
    icon: "🎽",
    check: (s) => !!s.character?.team
  },
  {
    id: "sharpshooter",
    label: "SHARPSHOOTER",
    desc: "Sink a moneyball shot in 3PT Legend",
    icon: "🔥",
    check: (s) => (s.bestScores?.threes || 0) >= 2
  },
  {
    id: "veteran",
    label: "VETERAN",
    desc: "Reach level 10 in 3PT Legend",
    icon: "🏅",
    check: (s) => (s.character?.level || 0) >= 9
  },
  {
    id: "goat_slayer",
    label: "GOAT SLAYER",
    desc: "Beat Prime Michael Jordan in 3PT Legend",
    icon: "🐐",
    check: (s) => (s.character?.level || 0) >= 18
  },
  {
    id: "trivia_master",
    label: "TRIVIA MASTER",
    desc: "Score 300+ in a single Trivia round",
    icon: "🧠",
    check: (s) => (s.bestScores?.trivia || 0) >= 300
  },
  {
    id: "on_a_roll",
    label: "ON A ROLL",
    desc: "Log in 7 days in a row",
    icon: "🔥",
    check: (s) => (s.streak || 0) >= 7
  },
  {
    id: "unstoppable",
    label: "UNSTOPPABLE",
    desc: "Log in 30 days in a row",
    icon: "⚡",
    check: (s) => (s.streak || 0) >= 30
  },
  {
    id: "high_roller",
    label: "HIGH ROLLER",
    desc: "Reach 5,000 total points",
    icon: "💎",
    check: (s) => s.totalScore >= 5000
  }
];
 