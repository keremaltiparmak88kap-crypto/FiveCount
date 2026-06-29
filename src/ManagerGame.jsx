import { useState, useEffect } from 'react'; // <-- useEffect buraya eklendi
import { useGameStore } from './store';

const INITIAL_PLAYERS = [
  { id: 1, name: "LUKA DONCIC", pos: "PG", rating: 96, team: "DAL", salary: 15, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png" },
  { id: 4, name: "STEPHEN CURRY", pos: "PG", rating: 95, team: "GSW", salary: 14, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png" },
  { id: 8, name: "SHAI GILGEOUS-ALEXANDER", pos: "PG", rating: 96, team: "OKC", salary: 14, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628983.png" },
  { id: 14, name: "KYRIE IRVING", pos: "PG", rating: 92, team: "DAL", salary: 11, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/202681.png" },
  { id: 16, name: "IMMANUEL QUICKLEY", pos: "PG", rating: 83, team: "TOR", salary: 6, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630193.png" },
  { id: 17, name: "MIKE CONLEY", pos: "PG", rating: 79, team: "MIN", salary: 4, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/201144.png" },
  { id: 9, name: "ANTHONY EDWARDS", pos: "SG", rating: 93, team: "MIN", salary: 13, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630162.png" },
  { id: 11, name: "DONOVAN MITCHELL", pos: "SG", rating: 92, team: "CLE", salary: 11, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628378.png" },
  { id: 13, name: "DEVIN BOOKER", pos: "SG", rating: 93, team: "PHX", salary: 12, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1626164.png" },
  { id: 18, name: "AUSTIN REAVES", pos: "SG", rating: 82, team: "LAL", salary: 5, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630559.png" },
  { id: 19, name: "MALIK MONK", pos: "SG", rating: 81, team: "SAC", salary: 5, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628368.png" },
  { id: 2, name: "JAYSON TATUM", pos: "SF", rating: 95, team: "BOS", salary: 14, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png" },
  { id: 5, name: "LEBRON JAMES", pos: "SF", rating: 93, team: "LAL", salary: 13, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png" },
  { id: 20, name: "RJ BARRETT", pos: "SF", rating: 84, team: "TOR", salary: 7, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629628.png" },
  { id: 21, name: "JADEN MCDANIELS", pos: "SF", rating: 80, team: "MIN", salary: 4, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630183.png" },
  { id: 22, name: "DUNCAN ROBINSON", pos: "SF", rating: 78, team: "MIA", salary: 3, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629130.png" },
  { id: 6, name: "GIANNIS ANTETOKOUNMPO", pos: "PF", rating: 97, team: "MIL", salary: 15, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png" },
  { id: 10, name: "KEVIN DURANT", pos: "PF", rating: 94, team: "PHX", salary: 13, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/201142.png" },
  { id: 12, name: "ANTHONY DAVIS", pos: "PF", rating: 94, team: "LAL", salary: 13, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203076.png" },
  { id: 23, name: "AARON GORDON", pos: "PF", rating: 83, team: "DEN", salary: 6, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203932.png" },
  { id: 24, name: "RUI HACHIMURA", pos: "PF", rating: 80, team: "LAL", salary: 4, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629060.png" },
  { id: 3, name: "NIKOLA JOKIC", pos: "C", rating: 98, team: "DEN", salary: 16, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png" },
  { id: 7, name: "JOEL EMBIID", pos: "C", rating: 96, team: "PHI", salary: 15, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203954.png" },
  { id: 15, name: "VICTOR WEMBANYAMA", pos: "C", rating: 91, team: "SAS", salary: 11, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1641705.png" },
  { id: 25, name: "ALPEREN SENGUN", pos: "C", rating: 87, team: "HOU", salary: 8, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630578.png" },
  { id: 26, name: "NAZ REID", pos: "C", rating: 81, team: "MIN", salary: 4, image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629675.png" }
];

const INITIAL_TEAMS_DATA = [
  {"id": "BOS", "name": "Boston Celtics", "ovr": 94, "w": 0, "l": 0},
  {"id": "LAL", "name": "LA Lakers", "ovr": 91, "w": 0, "l": 0},
  {"id": "GSW", "name": "Golden State Warriors", "ovr": 90, "w": 0, "l": 0},
  {"id": "DEN", "name": "Denver Nuggets", "ovr": 93, "w": 0, "l": 0},
  {"id": "MIL", "name": "Milwaukee Bucks", "ovr": 92, "w": 0, "l": 0},
  {"id": "PHX", "name": "Phoenix Suns", "ovr": 91, "w": 0, "l": 0},
  {"id": "DAL", "name": "Dallas Mavericks", "ovr": 92, "w": 0, "l": 0},
  {"id": "MIA", "name": "Miami Heat", "ovr": 87, "w": 0, "l": 0},
  {"id": "OKC", "name": "Oklahoma City Thunder", "ovr": 93, "w": 0, "l": 0},
  {"id": "MIN", "name": "Minnesota Timberwolves", "ovr": 92, "w": 0, "l": 0},
  {"id": "LAC", "name": "LA Clippers", "ovr": 88, "w": 0, "l": 0},
  {"id": "SAC", "name": "Sacramento Kings", "ovr": 87, "w": 0, "l": 0},
  {"id": "PHI", "name": "Philadelphia 76ers", "ovr": 91, "w": 0, "l": 0},
  {"id": "CLE", "name": "Cleveland Cavaliers", "ovr": 89, "w": 0, "l": 0},
  {"id": "NYK", "name": "New York Knicks", "ovr": 91, "w": 0, "l": 0},
  {"id": "IND", "name": "Indiana Pacers", "ovr": 86, "w": 0, "l": 0}
];
function ManagerGame() {
  // --- STORE ENTREGASYONU ---
  const addScore = useGameStore((state) => state.addScore);

  // --- SENİN MEVCUT STATE'LERİN ---
  const [activeScreen, setActiveScreen] = useState("home"); 
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [currentDraftedPlayer, setCurrentDraftedPlayer] = useState(INITIAL_PLAYERS[0]);
  const [skipRights, setSkipRights] = useState(3);
  const [lineup, setLineup] = useState([null, null, null, null, null]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [budget, setBudget] = useState(55); 
  const slots = ['PG', 'SG', 'SF', 'PF', 'C'];
  const [injuries, setInjuries] = useState([0, 0, 0, 0, 0]);
  const [leagueTeams, setLeagueTeams] = useState(INITIAL_TEAMS_DATA);
  const [userRecord, setUserRecord] = useState({ w: 0, l: 0 });
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [activeSim, setActiveSim] = useState(null); 
  const [simQuarter, setSimQuarter] = useState(0);
  const [simUserScore, setSimUserScore] = useState(0);
  const [simOppScore, setSimOppScore] = useState(0);
  const [simLogs, setSimLogs] = useState([]);
  const [appliedTactic, setAppliedTactic] = useState("BALANCED");
  const [boxScore, setBoxScore] = useState([]);
  const [playoffBracket, setPlayoffBracket] = useState(null); 
  const [playoffRound, setPlayoffRound] = useState("");

  useEffect(() => {
    const globalStyles = `
      body { background: #060608; color: #e2e8f0; margin: 0; font-family: monospace; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: #f97316; }
    `;
    const style = document.createElement('style');
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const calculateChemistry = () => {
    const teams = lineup.filter(p => p !== null).map(p => p.team);
    let bonus = 0;
    const uniqueTeams = [...new Set(teams)];
    uniqueTeams.forEach(t => {
      const matchCount = teams.filter(team => team === t).length;
      if (matchCount >= 2) bonus += (matchCount - 1) * 4;
    });
    return bonus;
  };
  const getPlayerEffectiveRating = (player, index) => {
    if (!player) return 0;
    let base = player.pos === slots[index] ? player.rating : player.rating - 10;
    if (injuries[index] > 0) base -= 15; // Heavy rating penalty if forced to play injured
    return base;
  };

  const getTeamOvr = () => {
    const filledSlots = lineup.filter(p => p !== null);
    if (filledSlots.length === 0) return 0;
    let baseSum = lineup.reduce((sum, p, idx) => sum + getPlayerEffectiveRating(p, idx), 0);
    return Math.round(baseSum / 5) + calculateChemistry();
  };

  const userTeamOvr = getTeamOvr();

  const triggerRoulette = () => {
    setIsSpinning(true);
    let counter = 0;
    const currentTargetPos = slots[currentSlotIndex] || 'PG';
    const pooled = INITIAL_PLAYERS.filter(p => p.pos === currentTargetPos);
    
    const interval = setInterval(() => {
      setCurrentDraftedPlayer(pooled[Math.floor(Math.random() * pooled.length)]);
      counter++;
      if (counter > 6) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 110);
  };

  const addToLineup = () => {
    if (budget - currentDraftedPlayer.salary < 0) {
      alert("SALARY CAP VIOLATION: Upgrade budget depleted!");
      return;
    }
    
    const newLineup = [...lineup];
    newLineup[currentSlotIndex] = currentDraftedPlayer;
    setLineup(newLineup);
    setBudget(prev => prev - currentDraftedPlayer.salary);
    
    if (currentSlotIndex < 4) {
      const nextIndex = currentSlotIndex + 1;
      setCurrentSlotIndex(nextIndex);
      setIsSpinning(true);
      setTimeout(() => {
        const pooled = INITIAL_PLAYERS.filter(p => p.pos === slots[nextIndex]);
        setCurrentDraftedPlayer(pooled[Math.floor(Math.random() * pooled.length)]);
        setIsSpinning(false);
      }, 400);
    } else {
      setCurrentSlotIndex(5);
    }
  };

  const skipPlayer = () => {
    if (skipRights > 0 && !isSpinning) {
      setSkipRights(skipRights - 1);
      triggerRoulette();
    }
  };

  const openMatchSimulator = (opponent, isPlayoff = false, playoffId = null) => {
    setActiveSim({ opponent, isPlayoff, playoffId });
    setSimQuarter(1);
    setSimUserScore(0);
    setSimOppScore(0);
    setAppliedTactic("BALANCED");
    // Generate fresh clean box score data structure
    setBoxScore(lineup.map(p => ({ name: p ? p.name.split(' ').pop() : 'VACANT', pts: 0 })));
    setSimLogs(["[SYS] CONTROL NODE BOUND. FIKSTURE INITIALIZED."]);
  };

  const advanceQuarter = () => {
    if (!activeSim) return;
    const q = simQuarter;
    const opp = activeSim.opponent;

    let tacticModifier = 0;
    if (appliedTactic === "ATTACK") tacticModifier = 4;
    if (appliedTactic === "DEFENSE") tacticModifier = -2;

    const userChance = userTeamOvr / (userTeamOvr + opp.ovr);
    const userQPoints = Math.floor(Math.random() * 10) + 21 + Math.floor(tacticModifier) + (userChance > 0.5 ? 2 : -2);
    const oppQPoints = Math.floor(Math.random() * 10) + 21 + (appliedTactic === "DEFENSE" ? -4 : 0);

    const newU = simUserScore + userQPoints;
    const newO = simOppScore + oppQPoints;

    setSimUserScore(newU);
    setSimOppScore(newO);

    // Distribute box score stats dynamic weighting
    const updatedBoxScore = [...boxScore];
    let remainingDist = userQPoints;
    for (let i = 0; i < 5; i++) {
      if (i === 4) {
        updatedBoxScore[i].pts += remainingDist;
      } else {
        const share = Math.floor(Math.random() * (remainingDist / 2));
        updatedBoxScore[i].pts += share;
        remainingDist -= share;
      }
    }
    setBoxScore(updatedBoxScore);

    setSimLogs(prev => [...prev, `[Q${q}] SQUAD: +${userQPoints} | ${opp.id}: +${oppQPoints} (TOTAL: ${newU}-${newO})`]);

    if (q < 4) {
      setSimQuarter(q + 1);
    } else {
      setSimQuarter(5); 
      const userWon = newU > newO;
      setSimLogs(prev => [...prev, userWon ? "🎉 VICTORIOUS OUTPUT GENERATED!" : "💥 DATA CORRUPT. FIXTURE DEFEAT."]);

      // Handle Medical Degradation / Injury Rolls (3% chance per active player)
      const nextInjuries = injuries.map((v, i) => {
        if (v > 0) return v - 1; // Heal 1 game
        if (Math.random() < 0.05 && lineup[i]) {
          return Math.floor(Math.random() * 2) + 2; // Injury for 2-3 games
        }
        return 0;
      });
      setInjuries(nextInjuries);

      if (!activeSim.isPlayoff) {
        if (userWon) setUserRecord(prev => ({ ...prev, w: prev.w + 1 }));
        else setUserRecord(prev => ({ ...prev, l: prev.l + 1 }));

        const updatedTeams = leagueTeams.map((t, idx) => {
          if (idx === currentMatchIndex) return { ...t, w: userWon ? t.w : t.w + 1, l: userWon ? t.l + 1 : t.l };
          const peerWon = Math.random() > (t.ovr / 185);
          return { ...t, w: peerWon ? t.w + 1 : t.w, l: peerWon ? t.l : t.l + 1 };
        });
        setLeagueTeams(updatedTeams);
        setCurrentMatchIndex(prev => prev + 1);
      } else {
        const updatedBracket = playoffBracket.map(match => {
          if (match.id === activeSim.playoffId) {
            const userWinCount = userWon ? match.userW + 1 : match.userW;
            const oppWinCount = !userWon ? match.oppW + 1 : match.oppW;
            let status = "PLAYING";
            if (userWinCount === 2) status = "USER_ADVANCED";
            if (oppWinCount === 2) status = "OPP_ADVANCED";
            return { ...match, userW: userWinCount, oppW: oppWinCount, status };
          }
          return match;
        });
        setPlayoffBracket(updatedBracket);
      }
    }
  };

  const buildPlayoffs = () => {
    const sorted = [...leagueTeams].sort((a, b) => b.w - a.w || a.l - b.l);
    const top7 = sorted.slice(0, 7);
    
    const initialMatches = [
      { id: "Q1", opp: top7[0], userW: 0, oppW: 0, status: "PLAYING" },
      { id: "Q2", opp: top7[1], userW: 0, oppW: 0, status: "SIMULATED_AI" },
      { id: "Q3", opp: top7[2], userW: 0, oppW: 0, status: "SIMULATED_AI" },
      { id: "Q4", opp: top7[3], userW: 0, oppW: 0, status: "SIMULATED_AI" }
    ];
    
    setPlayoffBracket(initialMatches);
    setPlayoffRound("QUARTERS");
    setActiveScreen("playoffs");
  };

  const advancePlayoffRound = () => {
    if (playoffRound === "QUARTERS") {
      const activeMatch = playoffBracket.find(m => m.id === "Q1");
      if (activeMatch.status !== "USER_ADVANCED") {
        alert("You must survive the Quarterfinals matrix first!");
        return;
      }
      setPlayoffBracket([
        { id: "S1", opp: INITIAL_TEAMS_DATA[3], userW: 0, oppW: 0, status: "PLAYING" },
        { id: "S2", opp: INITIAL_TEAMS_DATA[1], userW: 0, oppW: 0, status: "SIMULATED_AI" }
      ]);
      setPlayoffRound("SEMIS");
    } else if (playoffRound === "SEMIS") {
      const activeMatch = playoffBracket.find(m => m.id === "S1");
      if (activeMatch.status !== "USER_ADVANCED") {
        alert("Win the Semifinals to proceed!");
        return;
      }
      setPlayoffBracket([
        { id: "F1", opp: INITIAL_TEAMS_DATA[0], userW: 0, oppW: 0, status: "PLAYING" }
      ]);
      setPlayoffRound("FINALS");
    } else if (playoffRound === "FINALS") {
      const activeMatch = playoffBracket.find(m => m.id === "F1");
      if (activeMatch.status === "USER_ADVANCED") setPlayoffRound("CHAMPION");
    }
  };

  const resetAllGames = () => {
    setCurrentSlotIndex(0);
    setSkipRights(3);
    setLineup([null, null, null, null, null]);
    setUserRecord({ w: 0, l: 0 });
    setCurrentMatchIndex(0);
    setLeagueTeams(INITIAL_TEAMS_DATA);
    setBudget(55);
    setInjuries([0, 0, 0, 0, 0]);
    setPlayoffBracket(null);
    setActiveScreen("home");
  };

  const allStandings = [
    { id: "USER", name: "YOUR SQUAD (FIVECOURT)", ovr: userTeamOvr, w: userRecord.w, l: userRecord.l },
    ...leagueTeams
  ].sort((a, b) => b.w - a.w || a.l - b.l);

  return (
    <div className="min-h-screen text-[#e2e8f0] p-6 font-mono tracking-wide">
      
      {/* GLOBAL NAVBAR */}
      <header className="max-w-6xl mx-auto flex items-center justify-between border-b-2 border-orange-500/20 pb-4 mb-12 bg-black/40 p-4 border border-slate-900">
        <button onClick={resetAllGames} className="text-4xl font-black uppercase italic tracking-tighter">
          FIVE<span className="text-orange-500 [text-shadow:0_0_15px_#f97316] font-light">COURT</span>
        </button>
        <div className="text-xs text-orange-500 font-bold tracking-widest">// STAGE: DATA_UPGRADE_v3.0</div>
      </header>

      <main className="max-w-6xl mx-auto">
        
        {/* HOMEPAGE */}
        {activeScreen === "home" && (
          <div className="max-w-md mx-auto text-center space-y-12 mt-20 bg-black/90 p-8 border-2 border-slate-900 shadow-2xl">
            <div>
              <h1 className="text-3xl font-black italic text-white mb-2">FRANCHISE MANAGER TRADING</h1>
              <p className="text-[10px] text-slate-500 tracking-widest">BOX SCORE STAT ENGINE INJECTED</p>
            </div>
            <button onClick={() => { setActiveScreen("draft"); triggerRoulette(); }} className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-4 tracking-widest text-xs uppercase transition-all">
              INITIALIZE TACTICAL DRAFT
            </button>
          </div>
        )}

        {/* DRAFT TERMINAL */}
        {activeScreen === "draft" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-black/90 border-2 border-slate-900 p-6 space-y-4">
                <div>
                  <div className="text-[10px] text-orange-500 font-bold">// MANAGEMENT_METRICS</div>
                  <div className="text-xs text-slate-400 font-bold">ROSTER EFFECTIVE OVR</div>
                  <div className="text-5xl font-black text-emerald-400">{userTeamOvr}</div>
                </div>
                <div className="border-t border-slate-900 pt-4">
                  <div className="text-xs text-slate-400 font-bold">REMAINING BUDGET CAP</div>
                  <div className={`text-3xl font-black ${budget < 8 ? 'text-red-500' : 'text-orange-400'}`}>${budget}M <span className="text-xs text-slate-600">/ $55M</span></div>
                </div>
                <div className="border-t border-slate-900 pt-4">
                  <div className="text-xs text-slate-400 font-bold">MUTATION SKIPS</div>
                  <div className="text-lg font-black text-white">{skipRights} / 3</div>
                </div>
              </div>

              <div className="bg-black/90 border-2 border-slate-900 p-6">
                <div className="text-xs text-slate-400 mb-2 font-bold">// STREAMING_TARGET_SLOT</div>
                <div className="text-xl font-black text-white bg-slate-950 px-4 py-2 border-l-2 border-orange-500">
                  {slots[currentSlotIndex] || 'ROSTER LOCKED'}
                </div>
                {currentSlotIndex >= 5 && (
                  <button onClick={() => setActiveScreen("league")} className="mt-6 w-full bg-emerald-500 text-black text-xs font-black py-4 uppercase tracking-widest">
                    🚀 INJECT TO 16-TEAM LEAGUE
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="bg-black/90 border-2 border-slate-900 p-8 flex flex-col items-center">
                <div className={`relative bg-gradient-to-b from-[#111] to-[#010101] border-2 p-6 w-64 text-center rounded-xl ${isSpinning ? 'border-emerald-400 scale-95 blur-[0.5px]' : 'border-orange-500/60'}`}>
                  <div className="absolute top-2 left-3 text-xs font-black text-slate-500">{currentDraftedPlayer?.team}</div>
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-black font-black px-3 py-0.5 text-lg">{currentDraftedPlayer?.rating}</div>
                  <img src={currentDraftedPlayer?.image} alt="" className="w-36 h-auto mx-auto my-3" />
                  <p className="font-black text-base text-white border-t border-slate-900 pt-2 truncate">{currentDraftedPlayer?.name}</p>
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-3 bg-black p-2 border border-slate-900">
                    <span>POS: <span className="text-orange-400">{currentDraftedPlayer?.pos}</span></span>
                    <span>COST: <span className="text-red-400">${currentDraftedPlayer?.salary}M</span></span>
                  </div>
                </div>

                {currentSlotIndex < 5 && (
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-8">
                    <button onClick={addToLineup} disabled={isSpinning} className="bg-orange-500 hover:bg-orange-400 text-black font-black py-3 text-xs uppercase">LOCK CONTRACT</button>
                    <button onClick={skipPlayer} disabled={skipRights === 0 || isSpinning} className="border border-red-500/40 text-red-500 font-black py-3 text-xs uppercase">MUTATE STREAM</button>
                  </div>
                )}
              </div>

              {/* ROSTER DISPLAY GRID */}
              <div className="grid grid-cols-5 gap-3">
                {slots.map((slot, index) => (
                  <div key={slot} className={`bg-black/95 border-2 p-3 text-center h-40 flex flex-col justify-between ${index === currentSlotIndex ? 'border-orange-500' : 'border-slate-900'}`}>
                    <div className="text-xs font-black text-slate-500">{slot}</div>
                    {lineup[index] ? (
                      <div>
                        <div className="text-lg font-black text-emerald-400">{getPlayerEffectiveRating(lineup[index], index)}</div>
                        <p className="font-bold text-[9px] text-white truncate">{lineup[index].name.split(' ').pop()}</p>
                        <p className="text-[8px] text-red-400 font-bold">${lineup[index].salary}M</p>
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-700 py-1 border border-dashed border-slate-900">EMPTY</div>
                    )}
                    <div className={`w-full h-1 ${index === currentSlotIndex ? 'bg-orange-500' : lineup[index] ? 'bg-emerald-500' : 'bg-transparent'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STANDINGS AND LEAGUE MATRIX */}
        {activeScreen === "league" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-black/90 border-2 border-slate-900 p-6 h-[520px] overflow-y-auto">
              <div className="text-xs text-orange-500 font-bold mb-4">// CONSOLIDATED_STANDINGS_MATRIX</div>
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="py-2">RANK</th>
                    <th>TEAM NODE</th>
                    <th>OVR</th>
                    <th>WINS</th>
                    <th>LOSSES</th>
                  </tr>
                </thead>
                <tbody>
                  {allStandings.map((team, idx) => (
                    <tr key={team.id} className={`border-b border-slate-900/40 ${team.id === "USER" ? "text-orange-400 bg-orange-500/10 font-black" : "text-slate-300"}`}>
                      <td className="py-3 font-bold">#{idx + 1}</td>
                      <td>{team.name}</td>
                      <td className="text-slate-500">{team.ovr}</td>
                      <td className="text-emerald-400 font-bold">{team.w}</td>
                      <td className="text-red-500 font-bold">{team.l}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-6">
              <div className="bg-black/90 border-2 border-slate-900 p-6 text-center">
                <div className="text-[10px] text-slate-500 mb-2">// FIXTURE_BLOCK</div>
                {currentMatchIndex < leagueTeams.length ? (
                  <>
                    <div className="text-xl font-black text-white italic mb-1">VS {leagueTeams[currentMatchIndex]?.name}</div>
                    <div className="text-xs text-orange-500 font-bold mb-6">OPPONENT OVR: {leagueTeams[currentMatchIndex]?.ovr}</div>
                    <button onClick={() => openMatchSimulator(leagueTeams[currentMatchIndex], false)} className="w-full bg-orange-500 text-black font-black py-4 text-xs uppercase tracking-widest">
                      🎮 INITIATE LIVE STREAM MATCH
                    </button>
                  </>
                ) : (
                  <div className="py-4 space-y-4">
                    <div className="text-emerald-400 font-black text-lg">REGULAR SEASON OVER</div>
                    <button onClick={buildPlayoffs} className="w-full bg-emerald-500 text-black font-black py-4 text-xs uppercase tracking-widest">
                      🔥 GENERATE PLAYOFF BRACKET
                    </button>
                  </div>
                )}
              </div>

              {/* ROSTER PANEL WITH HEALTH STATUS TRACKING */}
              <div className="bg-black/90 border-2 border-slate-900 p-4">
                <div className="text-[10px] text-slate-500 mb-2">// ROSTER HEALTH & PERFORMANCE TELEMETRY</div>
                <div className="space-y-2">
                  {lineup.map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-xs border-b border-slate-900 pb-1">
                      <span className="text-slate-500 font-bold">{slots[i]}</span>
                      <span className="text-white font-medium">{p ? p.name.split(' ').pop() : 'EMPTY'}</span>
                      {injuries[i] > 0 ? (
                        <span className="text-red-500 font-black bg-red-500/10 px-1 border border-red-500/30">INJURED ({injuries[i]}G)</span>
                      ) : (
                        <span className="text-emerald-400 font-bold">HEALTHY</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PLAYOFFS PANEL */}
        {activeScreen === "playoffs" && (
          <div className="space-y-8">
            <div className="bg-black/90 border-2 border-slate-900 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic text-orange-500">🏆 PLAYOFF BRACKET STAGE: {playoffRound}</h2>
                <p className="text-[10px] text-slate-500 uppercase">Best of 3 formats enabled.</p>
              </div>
              {playoffRound !== "CHAMPION" && (
                <button onClick={advancePlayoffRound} className="bg-white text-black px-6 py-2 font-black text-xs uppercase">ADVANCE ROUND &gt;</button>
              )}
            </div>

            {playoffRound === "CHAMPION" ? (
              <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-12 text-center text-black rounded-lg border-2 border-white shadow-2xl">
                <h1 className="text-6xl font-black mb-4">🏆 WORLD CHAMPIONS 🏆</h1>
                <button onClick={resetAllGames} className="mt-8 bg-black text-white px-8 py-3 text-xs font-black uppercase">REBOOT GRID</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {playoffBracket?.map((match) => (
                  <div key={match.id} className={`p-4 border-2 bg-black/90 ${match.status === 'USER_ADVANCED' ? 'border-emerald-500' : 'border-slate-800'}`}>
                    <div className="text-[10px] text-slate-500 mb-2">MATCH BLOCK: {match.id}</div>
                    <div className="space-y-2 text-xs font-bold">
                      <div className="flex justify-between text-orange-400">
                        <span>FIVECOURT</span>
                        <span>{match.userW} W</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>{match.opp.name}</span>
                        <span>{match.oppW} W</span>
                      </div>
                    </div>
                    {match.status === "PLAYING" && (
                      <button onClick={() => openMatchSimulator(match.opp, true, match.id)} className="w-full mt-4 bg-orange-500 text-black py-2 font-black text-[10px] uppercase">
                        PLAY GAME
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LIVE SIMULATOR OVERLAY MODAL PANEL WITH LIVE BOX SCORE DATA */}
        {activeSim && (
          <div className="fixed inset-0 bg-black/95 z-50 p-8 flex flex-col justify-between max-w-3xl mx-auto border-2 border-orange-500 my-4 shadow-2xl rounded-md">
            <div>
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <span className="text-xs text-orange-500 font-bold tracking-widest">// COLISEUM_LIVE_FEED v3.0</span>
                <span className="text-xs bg-slate-900 text-slate-400 px-3 py-0.5 font-bold">
                  {simQuarter <= 4 ? `QUARTER ${simQuarter}` : 'CONCLUDED'}
                </span>
              </div>

              {/* CORE SCOREBOARD */}
              <div className="grid grid-cols-3 text-center my-6 items-center">
                <div>
                  <div className="text-xs font-black text-orange-400 tracking-wider">FIVECOURT</div>
                  <div className="text-5xl font-mono font-black text-white mt-1">{simUserScore}</div>
                </div>
                <div className="text-xl font-bold text-slate-700">VS</div>
                <div>
                  <div className="text-xs font-black text-slate-500 tracking-wider">{activeSim.opponent.id}</div>
                  <div className="text-5xl font-mono font-black text-slate-400 mt-1">{simOppScore}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* ACTIVE BOX SCORE FEED */}
                <div className="bg-slate-950 p-4 border border-slate-900 rounded">
                  <div className="text-[10px] text-emerald-400 font-bold mb-2">// LIVE_PLAYER_BOX_SCORE (PTS)</div>
                  <div className="space-y-1.5 font-mono text-xs">
                    {boxScore.map((player, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-900/60 pb-1">
                        <span className="text-slate-400 font-bold">{slots[idx]}: {player.name}</span>
                        <span className="text-emerald-400 font-black">{player.pts} PTS</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* INTERACTIVE MID-GAME TACTICS */}
                {simQuarter <= 4 && (
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded">
                    <div className="text-[10px] text-slate-500 font-bold mb-2">// MANAGEMENT_INTERVENTION_TACTIC</div>
                    <div className="grid grid-cols-1 gap-2">
                      {["BALANCED", "ATTACK", "DEFENSE"].map(tac => (
                        <button key={tac} onClick={() => setAppliedTactic(tac)} className={`py-2 text-[10px] font-black border transition-all ${appliedTactic === tac ? 'bg-orange-500 text-black border-transparent' : 'border-slate-800 text-slate-500'}`}>
                          {tac}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE INTERNAL LOG FEED */}
              <div className="bg-black p-3 border border-slate-900 h-28 overflow-y-auto font-mono text-[10px] space-y-1 text-slate-600">
                {simLogs.map((log, i) => (
                  <div key={i} className="border-b border-slate-950 pb-0.5">{log}</div>
))}
              </div>
            </div>

            {/* ACTION DISPATCHER */}
            <div className="mt-4">
              {simQuarter <= 4 ? (
                <button onClick={advanceQuarter} className="w-full bg-orange-500 text-black font-black py-4 text-xs uppercase tracking-widest">
                  RUN NEXT QUARTER ACTION &gt;
                </button>
              ) : (
                <button onClick={() => { setActiveSim(null); if(playoffRound !== "") setActiveScreen("playoffs"); }} className="w-full border border-slate-700 text-white font-black py-4 text-xs uppercase tracking-widest">
                  RETURN TO CONTROL HUB
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ManagerGame;


