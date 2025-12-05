import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Skull, 
  Coins, 
  Zap, 
  ShoppingBag, 
  Users, 
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Crosshair,
  Shield,
  Swords
} from 'lucide-react';

// ============================================
// GAME DATA
// ============================================

const TARGETS = [
  { name: "Verwirrter Tourist", emoji: "🧳", baseHp: 25, baseLoot: 8, color: "bg-green-400" },
  { name: "Parkuhr", emoji: "🅿️", baseHp: 60, baseLoot: 20, color: "bg-blue-400" },
  { name: "Kleiner Kiosk", emoji: "🏪", baseHp: 120, baseLoot: 45, color: "bg-cyan-400" },
  { name: "Geldautomat", emoji: "🏧", baseHp: 250, baseLoot: 100, color: "bg-yellow-400" },
  { name: "Juwelier", emoji: "💎", baseHp: 500, baseLoot: 220, color: "bg-pink-400" },
  { name: "Tresorraum", emoji: "🔐", baseHp: 1000, baseLoot: 500, color: "bg-orange-400" },
  { name: "Stadtbank", emoji: "🏦", baseHp: 2000, baseLoot: 1100, color: "bg-purple-400" },
  { name: "Casino Royale", emoji: "🎰", baseHp: 4000, baseLoot: 2500, color: "bg-red-400" },
  { name: "Börse", emoji: "📈", baseHp: 8000, baseLoot: 5500, color: "bg-emerald-400" },
  { name: "Zentralbank", emoji: "🏛️", baseHp: 16000, baseLoot: 12000, color: "bg-violet-400" },
  { name: "Weltbank", emoji: "🌍", baseHp: 35000, baseLoot: 28000, color: "bg-amber-400" },
  { name: "Fort Knox", emoji: "🏰", baseHp: 75000, baseLoot: 65000, color: "bg-rose-400" },
];

const RANKS = [
  { name: "Kleiner Taschendieb", emoji: "🐀", threshold: 0, color: "text-gray-300" },
  { name: "Straßenräuber", emoji: "🔪", threshold: 100, color: "text-green-400" },
  { name: "Einbrecher", emoji: "🗝️", threshold: 500, color: "text-blue-400" },
  { name: "Gauner", emoji: "🎭", threshold: 2000, color: "text-cyan-400" },
  { name: "Gangster", emoji: "🔫", threshold: 8000, color: "text-yellow-400" },
  { name: "Unterweltboss", emoji: "👔", threshold: 30000, color: "text-orange-400" },
  { name: "Verbrechergenie", emoji: "🧠", threshold: 100000, color: "text-pink-400" },
  { name: "Mastermind", emoji: "🎩", threshold: 350000, color: "text-purple-400" },
  { name: "Superschurke", emoji: "💀", threshold: 1000000, color: "text-red-400" },
  { name: "Weltherrscher", emoji: "👑", threshold: 5000000, color: "text-amber-400" },
];

const HENCHMEN = [
  { 
    id: 'lookout', 
    name: "Schmiere-Steher", 
    emoji: "👀", 
    baseDps: 1, 
    baseCost: 25, 
    description: "Hält Ausschau",
    color: "bg-green-500"
  },
  { 
    id: 'thug', 
    name: "Schläger", 
    emoji: "👊", 
    baseDps: 4, 
    baseCost: 100, 
    description: "Macht Druck",
    color: "bg-orange-500"
  },
  { 
    id: 'hacker', 
    name: "Hacker", 
    emoji: "💻", 
    baseDps: 12, 
    baseCost: 400, 
    description: "Knackt Systeme",
    color: "bg-cyan-500"
  },
  { 
    id: 'safecracker', 
    name: "Tresorknacker", 
    emoji: "🔓", 
    baseDps: 35, 
    baseCost: 1500, 
    description: "Öffnet alles",
    color: "bg-yellow-500"
  },
  { 
    id: 'cop', 
    name: "Korrupter Cop", 
    emoji: "🚔", 
    baseDps: 100, 
    baseCost: 5000, 
    description: "Schaut weg",
    color: "bg-blue-500"
  },
  { 
    id: 'assassin', 
    name: "Profi-Killer", 
    emoji: "🎯", 
    baseDps: 300, 
    baseCost: 18000, 
    description: "Erledigt Probleme",
    color: "bg-red-500"
  },
  { 
    id: 'scientist', 
    name: "Verrückter Wissenschaftler", 
    emoji: "🧪", 
    baseDps: 1000, 
    baseCost: 75000, 
    description: "Erfindet Waffen",
    color: "bg-purple-500"
  },
  { 
    id: 'army', 
    name: "Privatarmee", 
    emoji: "🪖", 
    baseDps: 4000, 
    baseCost: 350000, 
    description: "Übernimmt Städte",
    color: "bg-emerald-500"
  },
];

const CLICK_TEXTS = ["BAM!", "ZACK!", "POW!", "WHAM!", "KRACH!", "BUMM!", "PENG!", "KLATSCH!"];

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.floor(num).toString();
};

const getHenchmanCost = (baseCost, owned) => {
  return Math.floor(baseCost * Math.pow(1.15, owned));
};

const getCurrentRank = (totalEarned) => {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (totalEarned >= rank.threshold) {
      currentRank = rank;
    }
  }
  return currentRank;
};

const getNextRank = (totalEarned) => {
  for (const rank of RANKS) {
    if (totalEarned < rank.threshold) {
      return rank;
    }
  }
  return null;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function App() {
  // Game State
  const [money, setMoney] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [clickDamage, setClickDamage] = useState(1);
  const [targetIndex, setTargetIndex] = useState(0);
  const [targetHp, setTargetHp] = useState(TARGETS[0].baseHp);
  const [targetMaxHp, setTargetMaxHp] = useState(TARGETS[0].baseHp);
  const [targetLevel, setTargetLevel] = useState(1);
  const [henchmenOwned, setHenchmenOwned] = useState({});
  const [totalDps, setTotalDps] = useState(0);
  const [clickEffects, setClickEffects] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [totalClicks, setTotalClicks] = useState(0);
  const [targetsDefeated, setTargetsDefeated] = useState(0);
  
  const effectIdRef = useRef(0);
  const targetRef = useRef(null);

  // Calculate DPS from henchmen
  useEffect(() => {
    let dps = 0;
    for (const henchman of HENCHMEN) {
      const owned = henchmenOwned[henchman.id] || 0;
      dps += henchman.baseDps * owned;
    }
    setTotalDps(dps);
  }, [henchmenOwned]);

  // Auto-damage tick
  useEffect(() => {
    if (totalDps <= 0) return;
    
    const interval = setInterval(() => {
      setTargetHp(prev => {
        const newHp = prev - (totalDps / 10);
        return newHp;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [totalDps]);

  // Check for target defeat
  useEffect(() => {
    if (targetHp <= 0) {
      defeatTarget();
    }
  }, [targetHp]);

  const defeatTarget = useCallback(() => {
    const currentTarget = TARGETS[targetIndex];
    const loot = Math.floor(currentTarget.baseLoot * (1 + (targetLevel - 1) * 0.5));
    
    setMoney(prev => prev + loot);
    setTotalEarned(prev => prev + loot);
    setTargetsDefeated(prev => prev + 1);
    
    // Spawn next target
    let nextIndex = targetIndex;
    let nextLevel = targetLevel + 1;
    
    // Progress to next target type every 10 levels
    if (targetLevel % 10 === 0 && targetIndex < TARGETS.length - 1) {
      nextIndex = targetIndex + 1;
      setTargetIndex(nextIndex);
    }
    
    setTargetLevel(nextLevel);
    
    const nextTarget = TARGETS[nextIndex];
    const levelMultiplier = 1 + (nextLevel - 1) * 0.3;
    const newMaxHp = Math.floor(nextTarget.baseHp * levelMultiplier);
    
    setTargetMaxHp(newMaxHp);
    setTargetHp(newMaxHp);
  }, [targetIndex, targetLevel]);

  const handleClick = useCallback((e) => {
    // Deal damage
    setTargetHp(prev => prev - clickDamage);
    setTotalClicks(prev => prev + 1);
    
    // Shake effect
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 150);
    
    // Spawn click effect
    const rect = targetRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const text = CLICK_TEXTS[Math.floor(Math.random() * CLICK_TEXTS.length)];
      const colors = ['text-yellow-300', 'text-red-400', 'text-cyan-300', 'text-pink-400', 'text-green-400'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const id = effectIdRef.current++;
      setClickEffects(prev => [...prev, { id, x, y, text, color }]);
      
      setTimeout(() => {
        setClickEffects(prev => prev.filter(effect => effect.id !== id));
      }, 500);
    }
  }, [clickDamage]);

  const buyHenchman = useCallback((henchman) => {
    const owned = henchmenOwned[henchman.id] || 0;
    const cost = getHenchmanCost(henchman.baseCost, owned);
    
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setHenchmenOwned(prev => ({
        ...prev,
        [henchman.id]: (prev[henchman.id] || 0) + 1
      }));
    }
  }, [money, henchmenOwned]);

  const currentTarget = TARGETS[targetIndex];
  const currentRank = getCurrentRank(totalEarned);
  const nextRank = getNextRank(totalEarned);
  const hpPercent = Math.max(0, (targetHp / targetMaxHp) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-2 sm:p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 30px,
            rgba(255,255,255,0.03) 30px,
            rgba(255,255,255,0.03) 60px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="mb-4 sm:mb-6">
          <div className="neo-brutal-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-3 sm:p-4 rounded-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Title */}
              <div className="flex items-center gap-3">
                <div className="neo-brutal-sm bg-black p-2 rounded-lg">
                  <Skull className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                </div>
                <div>
                  <h1 className="comic-font text-2xl sm:text-4xl text-white drop-shadow-lg">
                    RISE OF THE VILLAIN
                  </h1>
                  <p className="text-xs sm:text-sm text-purple-200 font-bold">
                    Werde zum Superschurken!
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
                {/* Money */}
                <div className="neo-brutal-sm bg-yellow-400 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-800" />
                  <span className="text-lg sm:text-xl font-black text-black">
                    {formatNumber(money)} €
                  </span>
                </div>

                {/* DPS */}
                <div className="neo-brutal-sm bg-red-500 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                  <span className="text-lg sm:text-xl font-black text-white">
                    {formatNumber(totalDps)} DPS
                  </span>
                </div>
              </div>
            </div>

            {/* Rank Display */}
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">Rang:</span>
                <span className={`comic-font text-xl sm:text-2xl ${currentRank.color}`}>
                  {currentRank.emoji} {currentRank.name}
                </span>
              </div>
              
              {nextRank && (
                <div className="text-purple-200 text-xs sm:text-sm">
                  <span className="opacity-75">Nächster Rang bei:</span>{' '}
                  <span className="font-black text-yellow-300">{formatNumber(nextRank.threshold)} €</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* LEFT SIDE - Stats */}
          <div className="lg:w-64 order-2 lg:order-1">
            <div className="neo-brutal bg-slate-800 p-4 rounded-xl">
              <h2 className="comic-font text-xl text-cyan-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> STATISTIK
              </h2>
              
              <div className="space-y-3 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Klicks:</span>
                  <span className="font-black text-yellow-400">{formatNumber(totalClicks)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ziele erledigt:</span>
                  <span className="font-black text-red-400">{targetsDefeated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Klick-Schaden:</span>
                  <span className="font-black text-cyan-400">{clickDamage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gesamt verdient:</span>
                  <span className="font-black text-green-400">{formatNumber(totalEarned)} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ziel-Level:</span>
                  <span className="font-black text-purple-400">{targetLevel}</span>
                </div>
              </div>

              {/* Henchmen Summary */}
              <div className="mt-4 pt-4 border-t-2 border-slate-700">
                <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" /> Komplizen im Team:
                </h3>
                <div className="flex flex-wrap gap-1">
                  {HENCHMEN.map(h => {
                    const owned = henchmenOwned[h.id] || 0;
                    if (owned === 0) return null;
                    return (
                      <div key={h.id} className="neo-brutal-sm bg-slate-700 px-2 py-1 rounded text-xs">
                        <span>{h.emoji}</span>
                        <span className="ml-1 text-yellow-400 font-black">x{owned}</span>
                      </div>
                    );
                  })}
                  {Object.values(henchmenOwned).every(v => !v) && (
                    <span className="text-gray-500 text-sm">Noch keine...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER - Target */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="neo-brutal-lg bg-gradient-to-b from-slate-800 to-slate-900 p-4 sm:p-6 rounded-xl min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Target Info */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-red-500" />
                  <span className="text-gray-400 font-bold text-sm">ZIEL LEVEL {targetLevel}</span>
                </div>
                <h2 className="comic-font text-2xl sm:text-3xl text-white">
                  {currentTarget.emoji} {currentTarget.name}
                </h2>
              </div>

              {/* HP Bar */}
              <div className="w-full max-w-md mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400 font-bold flex items-center gap-1">
                    <Shield className="w-4 h-4" /> HP
                  </span>
                  <span className="text-white font-black">
                    {formatNumber(Math.max(0, targetHp))} / {formatNumber(targetMaxHp)}
                  </span>
                </div>
                <div className="neo-brutal-sm bg-gray-900 h-8 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full ${currentTarget.color} transition-all duration-100 relative`}
                    style={{ width: `${hpPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  </div>
                </div>
              </div>

              {/* Clickable Target */}
              <button 
                ref={targetRef}
                onClick={handleClick}
                aria-label={`Angriff auf ${currentTarget.name}`}
                className={`
                  relative cursor-pointer select-none
                  neo-brutal-lg ${currentTarget.color}
                  w-40 h-40 sm:w-52 sm:h-52 rounded-full
                  flex items-center justify-center
                  transition-transform hover:scale-105 active:scale-95
                  ${isShaking ? 'shake' : ''}
                  pulse-glow
                `}
              >
                {/* Inner glow */}
                <div className="absolute inset-4 rounded-full bg-white/20" />
                
                {/* Target emoji */}
                <span className="text-6xl sm:text-8xl relative z-10 drop-shadow-lg">
                  {currentTarget.emoji}
                </span>

                {/* Crosshair overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <Crosshair className="w-full h-full text-black" />
                </div>

                {/* Click effects */}
                {clickEffects.map(effect => (
                  <div
                    key={effect.id}
                    className={`
                      absolute comic-font text-3xl sm:text-4xl font-black
                      ${effect.color} pop-text pointer-events-none
                      drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]
                    `}
                    style={{
                      left: effect.x,
                      top: effect.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {effect.text}
                  </div>
                ))}
              </button>

              {/* Click instruction */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                  <Swords className="w-4 h-4" />
                  Klicke zum Angreifen!
                  <Swords className="w-4 h-4" />
                </p>
                <p className="text-yellow-400 font-black mt-1">
                  +{clickDamage} Schaden pro Klick
                </p>
              </div>

              {/* Loot Preview */}
              <div className="absolute bottom-4 right-4 neo-brutal-sm bg-yellow-400 px-3 py-2 rounded-lg">
                <span className="text-xs text-yellow-800 font-bold">BEUTE:</span>
                <span className="ml-2 font-black text-black">
                  ~{formatNumber(Math.floor(currentTarget.baseLoot * (1 + (targetLevel - 1) * 0.5)))} €
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Shop */}
          <div className="lg:w-80 order-3">
            <div className="neo-brutal bg-slate-800 p-4 rounded-xl">
              <h2 className="comic-font text-xl sm:text-2xl text-yellow-400 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" /> KOMPLIZEN
              </h2>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {HENCHMEN.map(henchman => {
                  const owned = henchmenOwned[henchman.id] || 0;
                  const cost = getHenchmanCost(henchman.baseCost, owned);
                  const canAfford = money >= cost;
                  
                  return (
                    <button
                      key={henchman.id}
                      onClick={() => buyHenchman(henchman)}
                      disabled={!canAfford}
                      className={`
                        w-full neo-brutal-sm rounded-lg p-3 text-left
                        transition-all duration-150
                        ${canAfford 
                          ? `${henchman.color} hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]` 
                          : 'bg-gray-700 opacity-60 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Emoji */}
                        <div className="text-3xl">{henchman.emoji}</div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-white text-sm truncate">
                              {henchman.name}
                            </span>
                            {owned > 0 && (
                              <span className="neo-brutal-sm bg-black/30 px-2 py-0.5 rounded text-xs text-white font-black">
                                x{owned}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/70 truncate">{henchman.description}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-300" />
                              <span className="text-white font-bold">+{henchman.baseDps} DPS</span>
                            </span>
                            <span className={`font-black text-sm ${canAfford ? 'text-white' : 'text-red-300'}`}>
                              {formatNumber(cost)} €
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Total DPS from henchmen */}
              <div className="mt-4 pt-4 border-t-2 border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Auto-Schaden:</span>
                  <span className="comic-font text-xl text-red-400">
                    {formatNumber(totalDps)} DPS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            🦹 Rise of the Villain - Ein Idle RPG Clicker 🦹
          </p>
        </footer>
      </div>
    </div>
  );
}
