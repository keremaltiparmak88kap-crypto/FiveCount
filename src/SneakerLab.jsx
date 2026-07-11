import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, RotateCcw, Sparkles } from 'lucide-react';
import { useGameStore } from './store';

const COLOR_SWATCHES = [
  "#f97316",
  "#facc15",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f8fafc",
  "#111827",
];

const STYLES = [
  { id: "speed", label: "Speed", seed: 7 },
  { id: "power", label: "Power", seed: 15 },
  { id: "clutch", label: "Clutch", seed: 23 },
  { id: "street", label: "Street", seed: 31 },
  { id: "elite", label: "Elite", seed: 39 },
];

const ARCHETYPES = [
  { id: "shooter", label: "Shooter", seed: 11 },
  { id: "slasher", label: "Slasher", seed: 19 },
  { id: "playmaker", label: "Playmaker", seed: 29 },
  { id: "defender", label: "Defender", seed: 37 },
  { id: "big", label: "Big Man", seed: 43 },
];

const NAME_PREFIX = ["Voltage", "Court", "Skyline", "Phantom", "Nova", "Clutch", "Metro", "Apex"];
const NAME_SUFFIX = ["Runner", "One", "V", "Strike", "Flow", "Rise", "Pro", "Pulse"];

const clamp = (value) => Math.max(62, Math.min(99, value));

const buildSignature = ({ style, archetype, primary, accent }) => {
  const colorSeed = [...primary, ...accent].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const seed = style.seed + archetype.seed + colorSeed;
  const name = `${NAME_PREFIX[seed % NAME_PREFIX.length]} ${NAME_SUFFIX[(seed + archetype.seed) % NAME_SUFFIX.length]}`;

  return {
    name,
    stats: {
      Grip: clamp(68 + (seed % 18) + (archetype.id === "defender" ? 8 : 0)),
      Bounce: clamp(66 + ((seed / 3) % 20) + (archetype.id === "slasher" ? 9 : 0)),
      Speed: clamp(65 + ((seed / 5) % 22) + (style.id === "speed" ? 10 : 0)),
      Control: clamp(67 + ((seed / 7) % 19) + (archetype.id === "playmaker" ? 8 : 0)),
      Aura: clamp(70 + ((seed / 11) % 22) + (style.id === "clutch" ? 7 : 0)),
    },
  };
};

const SneakerPreview = ({ primary, secondary, sole, lace, accent, style }) => (
  <svg viewBox="0 0 420 220" className="w-full max-w-md drop-shadow-[0_22px_35px_rgba(0,0,0,0.45)]" role="img" aria-label="Signature basketball sneaker preview">
    <defs>
      <linearGradient id="shoeUpper" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor={primary} />
        <stop offset="100%" stopColor={secondary} />
      </linearGradient>
      <linearGradient id="shoeSole" x1="0" x2="1">
        <stop offset="0%" stopColor={sole} />
        <stop offset="100%" stopColor={accent} />
      </linearGradient>
    </defs>

    <ellipse cx="216" cy="190" rx="166" ry="16" fill="rgba(0,0,0,0.36)" />
    <path d="M75 126 C108 105 125 62 162 50 C194 39 237 73 264 89 C292 106 334 119 372 128 C389 132 399 147 392 158 C386 168 361 173 329 171 L94 171 C66 171 53 145 75 126 Z" fill="url(#shoeUpper)" stroke="rgba(255,255,255,0.28)" strokeWidth="3" />
    <path d="M137 62 C165 82 188 96 226 100 C203 118 176 126 132 126 C118 103 119 80 137 62 Z" fill="rgba(255,255,255,0.16)" />
    <path d="M80 142 C148 158 259 159 388 148 C398 163 384 181 338 184 L91 184 C60 184 48 153 80 142 Z" fill="url(#shoeSole)" stroke="rgba(255,255,255,0.22)" strokeWidth="3" />
    <path d="M108 169 C160 177 263 177 346 169" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="7" strokeLinecap="round" />
    <path d="M155 116 L236 105 L214 128 L143 140 Z" fill={accent} opacity="0.92" />
    <path d="M162 92 C179 101 198 105 219 105" stroke={lace} strokeWidth="7" strokeLinecap="round" />
    <path d="M153 107 C173 116 194 119 217 119" stroke={lace} strokeWidth="7" strokeLinecap="round" />
    <path d="M143 122 C164 132 186 135 209 134" stroke={lace} strokeWidth="7" strokeLinecap="round" />
    <circle cx="289" cy="125" r="23" fill="rgba(0,0,0,0.24)" stroke={accent} strokeWidth="5" />
    <path d="M281 124 L291 112 L300 128 L286 137 Z" fill={accent} />
    {style.id === "street" && (
      <path d="M248 77 L292 94 M259 69 L302 88" stroke="rgba(255,255,255,0.42)" strokeWidth="5" strokeLinecap="round" />
    )}
    {style.id === "elite" && (
      <path d="M94 135 C150 104 232 91 340 130" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="4" strokeDasharray="10 8" />
    )}
    {style.id === "power" && (
      <path d="M326 131 L361 135 L350 151 L315 147 Z" fill="rgba(0,0,0,0.28)" />
    )}
  </svg>
);

const SneakerLab = () => {
  const addScore = useGameStore((state) => state.addScore);
  const [primary, setPrimary] = useState("#f97316");
  const [secondary, setSecondary] = useState("#111827");
  const [sole, setSole] = useState("#f8fafc");
  const [lace, setLace] = useState("#facc15");
  const [accent, setAccent] = useState("#06b6d4");
  const [styleId, setStyleId] = useState("clutch");
  const [archetypeId, setArchetypeId] = useState("shooter");
  const [signature, setSignature] = useState(null);
  const [scored, setScored] = useState(false);

  const style = STYLES.find((item) => item.id === styleId);
  const archetype = ARCHETYPES.find((item) => item.id === archetypeId);
  const liveSignature = useMemo(
    () => buildSignature({ style, archetype, primary, accent }),
    [accent, archetype, primary, style]
  );

  const generateSignature = () => {
    const next = buildSignature({ style, archetype, primary, accent });
    setSignature(next);
    if (!scored) {
      addScore(50, "sneaker");
      setScored(true);
    }
  };

  const resetDesign = () => {
    setPrimary("#f97316");
    setSecondary("#111827");
    setSole("#f8fafc");
    setLace("#facc15");
    setAccent("#06b6d4");
    setStyleId("clutch");
    setArchetypeId("shooter");
    setSignature(null);
  };

  const colorControls = [
    ["Upper", primary, setPrimary],
    ["Panel", secondary, setSecondary],
    ["Sole", sole, setSole],
    ["Laces", lace, setLace],
    ["Logo", accent, setAccent],
  ];

  return (
    <div className="max-w-2xl mx-auto text-white px-2 pb-10">
      <AnimatePresence>
        {signature && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#060608]/95 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-6 text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">Signature Created</p>
              <h2 className="text-3xl font-black text-orange-500 mb-1">{signature.name}</h2>
              <p className="text-[10px] uppercase tracking-widest text-white/35 mb-5">{style.label} / {archetype.label}</p>
              <SneakerPreview primary={primary} secondary={secondary} sole={sole} lace={lace} accent={accent} style={style} />
              <div className="grid grid-cols-5 gap-2 my-5">
                {Object.entries(signature.stats).map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-2">
                    <p className="text-[8px] uppercase text-white/35">{label}</p>
                    <p className="text-lg font-black">{Math.round(value)}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setSignature(null)} className="w-full rounded-2xl bg-orange-500 py-4 text-black font-black uppercase text-[11px] tracking-widest">
                Keep Designing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-5">
        <h1 className="text-3xl font-black italic tracking-tight">
          SNEAKER<span className="text-orange-500">LAB</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">Design your signature basketball shoe</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5 mb-5 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Live Prototype</p>
            <p className="text-xl font-black">{liveSignature.name}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Palette size={21} />
          </div>
        </div>
        <div className="min-h-52 flex items-center justify-center">
          <SneakerPreview primary={primary} secondary={secondary} sole={sole} lace={lace} accent={accent} style={style} />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/35 mb-3">Color System</p>
          <div className="space-y-4">
            {colorControls.map(([label, value, setter]) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase text-white/70">{label}</span>
                  <span className="text-[10px] font-mono text-white/35">{value}</span>
                </div>
                <div className="grid grid-cols-10 gap-1.5">
                  {COLOR_SWATCHES.map((color) => (
                    <button
                      key={`${label}-${color}`}
                      onClick={() => setter(color)}
                      className={`aspect-square rounded-lg border transition-transform hover:scale-105 ${value === color ? "border-orange-400 scale-105" : "border-white/10"}`}
                      style={{ backgroundColor: color }}
                      aria-label={`${label} ${color}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35 mb-3">Style</p>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setStyleId(item.id)}
                  className={`rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${styleId === item.id ? "bg-orange-500 text-black" : "bg-zinc-950 border border-white/10 text-white/50 hover:text-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/35 mb-3">Player Type</p>
            <div className="grid grid-cols-2 gap-2">
              {ARCHETYPES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setArchetypeId(item.id)}
                  className={`rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${archetypeId === item.id ? "bg-orange-500 text-black" : "bg-zinc-950 border border-white/10 text-white/50 hover:text-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <button onClick={generateSignature} className="rounded-2xl bg-orange-500 py-4 text-black font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2">
            <Sparkles size={16} />
            Generate Signature
          </button>
          <button onClick={resetDesign} className="w-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/55 hover:text-white hover:border-orange-500/40" aria-label="Reset design">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SneakerLab;
