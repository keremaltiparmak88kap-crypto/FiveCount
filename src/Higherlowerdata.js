import { getDailyItem, getDailySubset } from './dailyRotation';

// Curated, yaklaşık gerçek kariyer istatistikleri. Bu bir eğlence/trivia oyunu olduğu için
// rakamlar genel bilinen değerlere yakın tutuldu (kesin/güncel istatistik kaynağı değildir).
export const HL_PLAYERS = [
  { name: "Michael Jordan", ppg: 30.1, championships: 6, allStar: 14, seasons: 15 },
  { name: "LeBron James", ppg: 27.2, championships: 4, allStar: 20, seasons: 22 },
  { name: "Kareem Abdul-Jabbar", ppg: 24.6, championships: 6, allStar: 19, seasons: 20 },
  { name: "Wilt Chamberlain", ppg: 30.1, championships: 2, allStar: 13, seasons: 14 },
  { name: "Kobe Bryant", ppg: 25.0, championships: 5, allStar: 18, seasons: 20 },
  { name: "Magic Johnson", ppg: 19.5, championships: 5, allStar: 12, seasons: 13 },
  { name: "Larry Bird", ppg: 24.3, championships: 3, allStar: 12, seasons: 13 },
  { name: "Tim Duncan", ppg: 19.0, championships: 5, allStar: 15, seasons: 19 },
  { name: "Shaquille O'Neal", ppg: 23.7, championships: 4, allStar: 15, seasons: 19 },
  { name: "Hakeem Olajuwon", ppg: 21.8, championships: 2, allStar: 12, seasons: 18 },
  { name: "Stephen Curry", ppg: 24.8, championships: 4, allStar: 10, seasons: 15 },
  { name: "Kevin Durant", ppg: 27.3, championships: 2, allStar: 14, seasons: 17 },
  { name: "Giannis Antetokounmpo", ppg: 23.5, championships: 1, allStar: 9, seasons: 11 },
  { name: "Nikola Jokic", ppg: 20.9, championships: 1, allStar: 6, seasons: 9 },
  { name: "Luka Doncic", ppg: 28.6, championships: 0, allStar: 5, seasons: 6 },
  { name: "Karl Malone", ppg: 25.0, championships: 0, allStar: 14, seasons: 19 },
  { name: "John Stockton", ppg: 13.1, championships: 0, allStar: 10, seasons: 19 },
  { name: "Charles Barkley", ppg: 22.1, championships: 0, allStar: 11, seasons: 16 },
  { name: "Allen Iverson", ppg: 26.7, championships: 0, allStar: 11, seasons: 14 },
  { name: "Dirk Nowitzki", ppg: 20.7, championships: 1, allStar: 14, seasons: 21 },
  { name: "Dwyane Wade", ppg: 22.0, championships: 3, allStar: 13, seasons: 16 },
  { name: "Kevin Garnett", ppg: 17.8, championships: 1, allStar: 15, seasons: 21 },
  { name: "Steve Nash", ppg: 14.3, championships: 0, allStar: 8, seasons: 18 },
  { name: "Russell Westbrook", ppg: 21.6, championships: 0, allStar: 9, seasons: 16 },
  { name: "James Harden", ppg: 24.9, championships: 0, allStar: 10, seasons: 15 },
];

export const HL_CATEGORIES = [
  { id: "ppg", label: "Career PPG", suffix: "PPG", format: (v) => v.toFixed(1) },
  { id: "championships", label: "Championships Won", suffix: "titles", format: (v) => String(v) },
  { id: "allStar", label: "All-Star Selections", suffix: "selections", format: (v) => String(v) },
  { id: "seasons", label: "Seasons Played", suffix: "seasons", format: (v) => String(v) },
];

// Günün kategorisi — her gün 4 kategoriden biri (herkese aynı gün aynı kategori).
export const getTodaysCategory = () => getDailyItem(HL_CATEGORIES);

// Günün oyuncu sırası — büyük havuzdan her gün farklı bir sıralı 12'lik dizi.
export const getTodaysSequence = () => getDailySubset(HL_PLAYERS, 12);
