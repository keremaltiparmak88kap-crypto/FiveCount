import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, Lightbulb } from 'lucide-react';
import { useGameStore } from './store';
import { getDailySubset } from './dailyRotation';

const ROUND_LIMIT = 7;
const STARTING_LIVES = 3;

const WHO_AM_I = [
  {
    player: "LeBron James",
    clues: ["I was drafted first overall in 2003.", "I won titles with Miami and Cleveland.", "I became the NBA's all-time leading scorer.", "I am known as King James."],
  },
  {
    player: "Stephen Curry",
    clues: ["I changed how teams value the three-point line.", "I play for Golden State.", "I have multiple MVP awards.", "My nickname is Chef."],
  },
  {
    player: "Nikola Jokic",
    clues: ["I am from Serbia.", "I am a center with elite passing.", "I won a title with Denver.", "People call me The Joker."],
  },
  {
    player: "Giannis Antetokounmpo",
    clues: ["I grew up in Greece.", "I play for Milwaukee.", "I won Finals MVP in 2021.", "My nickname is the Greek Freak."],
  },
  {
    player: "Kevin Durant",
    clues: ["I started with Seattle/Oklahoma City.", "I won Finals MVP with Golden State.", "I am one of the game's purest scorers.", "My nickname is Slim Reaper."],
  },
  {
    player: "Kobe Bryant",
    clues: ["I spent my entire career with the Lakers.", "I scored 81 in one game.", "I won five championships.", "My nickname was Black Mamba."],
  },
  {
    player: "Michael Jordan",
    clues: ["I won six titles with Chicago.", "I wore number 23.", "I played baseball during my first retirement.", "Many call me the GOAT."],
  },
  {
    player: "Luka Doncic",
    clues: ["I starred at Real Madrid before the NBA.", "I play for Dallas.", "I am known for step-backs and triple-doubles.", "I am from Slovenia."],
  },
  {
    player: "Jayson Tatum",
    clues: ["I was drafted by Boston.", "I am a modern scoring wing.", "I won the 2024 NBA championship.", "I played college basketball at Duke."],
  },
  {
    player: "Damian Lillard",
    clues: ["I became a legend in Portland.", "I am known for deep threes.", "I hit famous series-ending shots.", "Fans call it Dame Time."],
  },
  {
    player: "Kevin Garnett",
    clues: ["I spent most of my prime in Minnesota.", "I won a title with Boston in 2008.", "I was known for relentless defensive intensity.", "My nickname was The Big Ticket."],
  },
  {
    player: "Shaquille O'Neal",
    clues: ["I won titles with both LA and Miami.", "I was famously unstoppable near the basket.", "I struggled at the free-throw line.", "My nickname was The Diesel."],
  },
  {
    player: "Tim Duncan",
    clues: ["I spent my entire career with San Antonio.", "I won five championships.", "I was known for a quiet, fundamental game.", "My nickname was The Big Fundamental."],
  },
  {
    player: "Allen Iverson",
    clues: ["I was the first overall pick in 1996.", "I stood only six feet tall but scored relentlessly.", "I famously talked about practice in a press conference.", "My nickname was The Answer."],
  },
  {
    player: "Magic Johnson",
    clues: ["I won a title as a rookie playing center.", "I ran the Showtime Lakers.", "I am considered one of the greatest passers ever.", "My nickname was Magic."],
  },
  {
    player: "Larry Bird",
    clues: ["I played my whole career in Boston.", "I had a famous rivalry with Magic Johnson.", "I won three championships in the 1980s.", "My nickname was Larry Legend."],
  },
  {
    player: "Hakeem Olajuwon",
    clues: ["I am originally from Nigeria.", "I won back-to-back titles with Houston.", "I was famous for a footwork move called the Dream Shake.", "My nickname was The Dream."],
  },
  {
    player: "Dirk Nowitzki",
    clues: ["I am from Germany.", "I spent my entire career with Dallas.", "I won Finals MVP in 2011.", "I was known for an unstoppable fadeaway jumper."],
  },
  {
    player: "Steve Nash",
    clues: ["I am from Canada.", "I won back-to-back MVPs with Phoenix.", "I was known as one of the best passers of my era.", "I never won an NBA championship."],
  },
  {
    player: "Chris Paul",
    clues: ["I am nicknamed CP3.", "I am known for elite point guard leadership.", "I have played for several teams including the Clippers and Suns.", "I have led the league in assists multiple times."],
  },
  {
    player: "Russell Westbrook",
    clues: ["I recorded a historic season averaging a triple-double.", "I spent most of my prime in Oklahoma City.", "I won an MVP award in 2017.", "I am known for explosive athleticism."],
  },
  {
    player: "James Harden",
    clues: ["I am known for a deadly step-back three.", "I won MVP with Houston in 2018.", "I led the league in scoring multiple times.", "My nickname is The Beard."],
  },
  {
    player: "Joel Embiid",
    clues: ["I am originally from Cameroon.", "I play for Philadelphia.", "I won MVP in 2023.", "I am known for a mix of size and shooting touch."],
  },
  {
    player: "Anthony Edwards",
    clues: ["I play for Minnesota.", "I was the first overall pick in 2020.", "I am known for highlight-reel dunks.", "My nickname is Ant-Man."],
  },
  {
    player: "Devin Booker",
    clues: ["I scored 70 points in a single game.", "I play for Phoenix.", "I am known for a smooth mid-range game.", "I represented Team USA in the Olympics."],
  },
];

const normalize = (value) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

// Bugünün 7 turu — büyük havuzdan HER GÜN farklı bir 7'lik alt küme (herkese aynı gün aynı).
const getTodaysRounds = () => getDailySubset(WHO_AM_I, ROUND_LIMIT);

const WhoAmIGame = () => {
  const addScore = useGameStore((state) => state.addScore);
  const todaysRounds = useMemo(() => getTodaysRounds(), []);
  const [current, setCurrent] = useState(() => todaysRounds[0]);
  const [revealed, setRevealed] = useState(1);
  const [guess, setGuess] = useState("");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const progress = useMemo(() => Math.round(((round - 1) / ROUND_LIMIT) * 100), [round]);

  const advanceRound = () => {
    if (round >= ROUND_LIMIT) {
      setFinished(true);
      setLocked(false);
      return;
    }

    setCurrent(todaysRounds[round]);
    setRevealed(1);
    setGuess("");
    setRound((value) => value + 1);
    setFeedback(null);
    setLocked(false);
  };

  const revealClue = () => {
    if (locked || revealed >= current.clues.length) return;
    setRevealed((value) => value + 1);
  };

  const submitGuess = (event) => {
    event.preventDefault();
    if (locked || finished || !guess.trim()) return;

    const correct = normalize(guess) === normalize(current.player);
    setLocked(true);

    if (correct) {
      const nextCombo = combo + 1;
      const clueBonus = Math.max(0, current.clues.length - revealed) * 15;
      const points = Math.min(120, 35 + clueBonus + nextCombo * 5);
      setCombo(nextCombo);
      setScore((value) => value + points);
      setFeedback({ type: "correct", points });
      addScore(points, "whoami");
      setTimeout(() => advanceRound(), 850);
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);
    setCombo(0);
    setFeedback({ type: "wrong" });

    if (nextLives <= 0) {
      setTimeout(() => {
        setFinished(true);
        setLocked(false);
      }, 1050);
    } else {
      setTimeout(() => advanceRound(), 1050);
    }
  };

  const restart = () => {
    setCurrent(todaysRounds[0]);
    setRevealed(1);
    setGuess("");
    setRound(1);
    setScore(0);
    setCombo(0);
    setLives(STARTING_LIVES);
    setLocked(false);
    setFeedback(null);
    setFinished(false);
  };

  return (
    <div className="max-w-md mx-auto text-white px-2 pb-8">
      <AnimatePresence>
        {finished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#060608]/95 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm text-center rounded-3xl p-8 bg-gradient-to-b from-white/[0.06] to-white/[0.015] border border-white/10">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">Identity Report</p>
              <h2 className="text-5xl font-black text-orange-500 mb-2">{score}</h2>
              <p className="text-xs text-white/40 mb-6">Round {round}/{ROUND_LIMIT} · Combo x{combo}</p>
              <button onClick={restart} className="w-full bg-orange-500 text-black font-black py-4 rounded-2xl uppercase text-[11px] tracking-widest">
                Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          WHO<span className="text-orange-500">AMI</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">Daily Puzzle · Same 7 rounds for everyone</p>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 text-[10px] uppercase tracking-widest text-white/35">
          <span>Round {round}/{ROUND_LIMIT}</span>
          <span>{score} pts</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Lives</p>
          <div className="flex gap-1 text-red-400">
            {[...Array(STARTING_LIVES)].map((_, index) => (
              <Heart key={index} size={14} fill={index < lives ? "currentColor" : "none"} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Clues</p>
          <p className="font-black text-orange-400">{revealed}/{current.clues.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Combo</p>
          <p className="font-black text-orange-400">x{combo}</p>
        </div>
      </div>

      <motion.div key={current.player} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6 mb-5">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
          <Eye size={25} />
        </div>
        <p className="text-center text-[9px] uppercase tracking-[0.3em] text-white/30 mb-4">Identity Clues</p>
        <div className="space-y-2">
          {current.clues.slice(0, revealed).map((clue, index) => (
            <div key={clue} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-sm leading-snug">
              <span className="inline-block text-orange-400 font-black mr-2">#{index + 1}</span>
              {clue}
            </div>
          ))}
        </div>
        <button
          onClick={revealClue}
          disabled={locked || revealed >= current.clues.length}
          className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest text-white/60 hover:border-orange-500/40 disabled:opacity-35"
        >
          <span className="inline-flex items-center gap-2"><Lightbulb size={14} /> Reveal Clue</span>
        </button>
      </motion.div>

      <form onSubmit={submitGuess} className="space-y-3">
        <input
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          disabled={locked}
          placeholder="Type player name..."
          className="w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-4 text-center text-white font-black outline-none focus:border-orange-500"
        />
        <button
          type="submit"
          disabled={locked || !guess.trim()}
          className="w-full rounded-2xl bg-orange-500 disabled:bg-white/10 disabled:text-white/25 text-black py-4 font-black uppercase text-[11px] tracking-widest transition-colors"
        >
          Lock Guess
        </button>
      </form>

      <div className="min-h-8 mt-4 text-center">
        {feedback?.type === "correct" && <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest">+{feedback.points} points</p>}
        {feedback?.type === "wrong" && <p className="text-[11px] font-bold text-red-300 uppercase tracking-widest">Correct: {current.player} · next round</p>}
      </div>
    </div>
  );
};

export default WhoAmIGame;
