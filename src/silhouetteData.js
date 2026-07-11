import { getDailySubset } from './dailyRotation';

// Telif hakkı sorunu yaşamamak için gerçek fotoğraf yerine stilize, tek renkli silüetler
// kullanılıyor. Ayırt edici bilgi olarak forma numarası + takım rengi + poz veriliyor.
export const SILHOUETTE_POOL = [
  { name: "LeBron James", team: "LAL", color: "#552583", number: 23, pose: "dunk" },
  { name: "Stephen Curry", team: "GSW", color: "#1D428A", number: 30, pose: "shoot" },
  { name: "Michael Jordan", team: "CHI", color: "#CE1141", number: 23, pose: "dunk" },
  { name: "Kobe Bryant", team: "LAL", color: "#552583", number: 24, pose: "shoot" },
  { name: "Giannis Antetokounmpo", team: "MIL", color: "#00471B", number: 34, pose: "dunk" },
  { name: "Kevin Durant", team: "PHX", color: "#1D1160", number: 35, pose: "shoot" },
  { name: "Nikola Jokic", team: "DEN", color: "#0E2240", number: 15, pose: "dribble" },
  { name: "Luka Doncic", team: "DAL", color: "#00538C", number: 77, pose: "dribble" },
  { name: "Shaquille O'Neal", team: "ORL", color: "#0077C0", number: 32, pose: "dunk" },
  { name: "Tim Duncan", team: "SAS", color: "#C4CED4", number: 21, pose: "block" },
  { name: "Magic Johnson", team: "LAL", color: "#552583", number: 32, pose: "dribble" },
  { name: "Larry Bird", team: "BOS", color: "#007A33", number: 33, pose: "shoot" },
  { name: "Hakeem Olajuwon", team: "HOU", color: "#CE1141", number: 34, pose: "block" },
  { name: "Allen Iverson", team: "PHI", color: "#006BB6", number: 3, pose: "dribble" },
  { name: "Dirk Nowitzki", team: "DAL", color: "#00538C", number: 41, pose: "shoot" },
  { name: "Kawhi Leonard", team: "LAC", color: "#C8102E", number: 2, pose: "block" },
  { name: "Damian Lillard", team: "MIL", color: "#00471B", number: 0, pose: "shoot" },
  { name: "Joel Embiid", team: "PHI", color: "#006BB6", number: 21, pose: "block" },
  { name: "Jayson Tatum", team: "BOS", color: "#007A33", number: 0, pose: "dunk" },
  { name: "Anthony Edwards", team: "MIN", color: "#0C2340", number: 5, pose: "dunk" },
];

export const getTodaysSilhouettes = () => getDailySubset(SILHOUETTE_POOL, 6);
