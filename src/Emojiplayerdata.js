import { getDailySubset } from './dailyRotation';

export const EMOJI_POOL = [
  { name: "Stephen Curry", emojis: ["🍳", "3️⃣", "🎯"], clue: "Chef known for deep range" },
  { name: "LeBron James", emojis: ["👑", "🚂", "💪"], clue: "The King" },
  { name: "Michael Jordan", emojis: ["🐐", "🔴", "👅"], clue: "Widely called the greatest ever" },
  { name: "Kobe Bryant", emojis: ["🐍", "🌉", "5️⃣"], clue: "Black Mamba, five rings" },
  { name: "Giannis Antetokounmpo", emojis: ["🇬🇷", "😱", "🦌"], clue: "Greek Freak" },
  { name: "Kevin Durant", emojis: ["🌾", "💀", "🎯"], clue: "Slim Reaper" },
  { name: "Shaquille O'Neal", emojis: ["🦸", "🚂", "😂"], clue: "The Diesel / Superman" },
  { name: "Nikola Jokic", emojis: ["🃏", "🐴", "🇷🇸"], clue: "The Joker, loves horses" },
  { name: "Luka Doncic", emojis: ["🇸🇮", "🪄", "🎯"], clue: "Wonder Boy from Slovenia" },
  { name: "Tim Duncan", emojis: ["🤖", "⛑️", "5️⃣"], clue: "The Big Fundamental" },
  { name: "Allen Iverson", emojis: ["🅰️", "💼", "🔁"], clue: "Talked about practice, not a game" },
  { name: "Dwyane Wade", emojis: ["⚡", "🔥", "3️⃣"], clue: "Flash from Miami" },
  { name: "Damian Lillard", emojis: ["⏰", "🗺️", "😴"], clue: "Dame Time, logo range" },
  { name: "James Harden", emojis: ["🧔", "🦶", "3️⃣"], clue: "The Beard, step-back specialist" },
  { name: "Joel Embiid", emojis: ["⚙️", "🃏", "🇨🇲"], clue: "The Process from Cameroon" },
  { name: "Anthony Edwards", emojis: ["🐜", "🦸", "💥"], clue: "Ant-Man" },
  { name: "Russell Westbrook", emojis: ["🌀", "😤", "🔺"], clue: "Mr. Triple-Double" },
  { name: "Klay Thompson", emojis: ["💦", "6️⃣", "🎯"], clue: "Splash Brother, career-high six" },
  { name: "Magic Johnson", emojis: ["✨", "🎩", "😁"], clue: "Showtime Lakers rookie champion" },
  { name: "Larry Bird", emojis: ["🐦", "☘️", "🎯"], clue: "Larry Legend" },
  { name: "Hakeem Olajuwon", emojis: ["🌙", "🇳🇬", "🚫"], clue: "The Dream, elite shot blocker" },
  { name: "Dirk Nowitzki", emojis: ["🇩🇪", "🦩", "🎯"], clue: "One-legged fadeaway specialist" },
  { name: "Kawhi Leonard", emojis: ["🤫", "🐾", "🛡️"], clue: "The Klaw, quiet two-way star" },
  { name: "Jayson Tatum", emojis: ["☘️", "🍀", "0️⃣"], clue: "Boston's modern scoring wing" },
];

export const getTodaysEmojiRounds = () => getDailySubset(EMOJI_POOL, 6);
