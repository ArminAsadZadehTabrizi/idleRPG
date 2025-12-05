import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Skull, 
  Coins, 
  Zap, 
  ShoppingBag, 
  Users, 
  Target,
  TrendingUp,
  Crosshair,
  Shield,
  Swords,
  Hammer,
  Wrench
} from 'lucide-react';

// ============================================
// GAME DATA
// ============================================

// TIER SYSTEM: 4 Tiers with rarity-based spawn rates
const TIER_1_TARGETS = [
  { name: "Street Musician", emoji: "🎸", baseHp: 20, baseLoot: 5, rarity: "common", color: "bg-green-400" },
  { name: "Pensioner", emoji: "👴", baseHp: 35, baseLoot: 12, rarity: "medium", color: "bg-blue-400" },
  { name: "Confused Tourist", emoji: "🧳", baseHp: 50, baseLoot: 25, rarity: "rare", color: "bg-yellow-400" },
];

const TIER_2_TARGETS = [
  { name: "Delivery Van", emoji: "🚐", baseHp: 80, baseLoot: 40, rarity: "common", color: "bg-cyan-400" },
  { name: "Gas Station", emoji: "⛽", baseHp: 150, baseLoot: 85, rarity: "medium", color: "bg-orange-400" },
  { name: "Safe", emoji: "🔐", baseHp: 200, baseLoot: 130, rarity: "medium", color: "bg-amber-500" },
  { name: "Gumball Machine", emoji: "🍬", baseHp: 250, baseLoot: 200, rarity: "rare", color: "bg-pink-400" },
];

const TIER_3_TARGETS = [
  { name: "ATM", emoji: "🏧", baseHp: 400, baseLoot: 300, rarity: "common", color: "bg-emerald-400" },
  { name: "Bank", emoji: "🏦", baseHp: 800, baseLoot: 700, rarity: "rare", color: "bg-purple-500" },
  { name: "Jeweler", emoji: "💎", baseHp: 1200, baseLoot: 1100, rarity: "rare", color: "bg-pink-500" },
  { name: "Robot", emoji: "🤖", baseHp: 1500, baseLoot: 1400, rarity: "rare", color: "bg-cyan-500" },
];

const TIER_4_TARGETS = [
  { name: "The White House", emoji: "🏛️", baseHp: 3000, baseLoot: 2500, rarity: "common", color: "bg-blue-500" },
  { name: "Mega Robot", emoji: "🦾", baseHp: 6000, baseLoot: 5000, rarity: "medium", color: "bg-slate-500" },
  { name: "Superhero", emoji: "🦸", baseHp: 10000, baseLoot: 9000, rarity: "rare", color: "bg-red-500" },
  { name: "Dragon", emoji: "🐉", baseHp: 20000, baseLoot: 18000, rarity: "ultra_rare", color: "bg-violet-600" },
];

const ALL_TIERS = [TIER_1_TARGETS, TIER_2_TARGETS, TIER_3_TARGETS, TIER_4_TARGETS];

// EQUIPMENT (Click Damage)
const EQUIPMENT = [
  { 
    id: 'brass_knuckles', 
    name: "Brass Knuckles", 
    emoji: "✊", 
    clickDamage: 1, 
    baseCost: 50, 
    description: "Basic street fight",
    color: "bg-amber-600"
  },
  { 
    id: 'crowbar', 
    name: "Crowbar", 
    emoji: "🪛", 
    clickDamage: 5, 
    baseCost: 250, 
    description: "Break and enter",
    color: "bg-gray-600"
  },
  { 
    id: 'baseball_bat', 
    name: "Baseball Bat", 
    emoji: "⚾", 
    clickDamage: 12, 
    baseCost: 1000, 
    description: "Swing for the fences",
    color: "bg-brown-600"
  },
  { 
    id: 'pistol', 
    name: "Pistol", 
    emoji: "🔫", 
    clickDamage: 40, 
    baseCost: 5000, 
    description: "Pack some heat",
    color: "bg-slate-700"
  },
  { 
    id: 'assault_rifle', 
    name: "Assault Rifle", 
    emoji: "🔫", 
    clickDamage: 150, 
    baseCost: 25000, 
    description: "Heavy firepower",
    color: "bg-red-700"
  },
];

// HENCHMEN (Auto-DPS) - Villain themed
const HENCHMEN = [
  { 
    id: 'street_rat', 
    name: "Street Rat", 
    emoji: "🐀", 
    baseDps: 1, 
    baseCost: 25, 
    description: "Sneaky petty thief",
    color: "bg-gray-500"
  },
  { 
    id: 'thug', 
    name: "Thug", 
    emoji: "👊", 
    baseDps: 4, 
    baseCost: 100, 
    description: "Muscle for hire",
    color: "bg-orange-500"
  },
  { 
    id: 'burglar', 
    name: "Pro Burglar", 
    emoji: "🥷", 
    baseDps: 12, 
    baseCost: 400, 
    description: "Silent and deadly",
    color: "bg-indigo-500"
  },
  { 
    id: 'hacker', 
    name: "Elite Hacker", 
    emoji: "💻", 
    baseDps: 35, 
    baseCost: 1500, 
    description: "Cracks any system",
    color: "bg-cyan-500"
  },
  { 
    id: 'lawyer', 
    name: "Corrupt Lawyer", 
    emoji: "⚖️", 
    baseDps: 100, 
    baseCost: 5000, 
    description: "Gets you off the hook",
    color: "bg-blue-600"
  },
  { 
    id: 'enforcer', 
    name: "Enforcer", 
    emoji: "🔨", 
    baseDps: 300, 
    baseCost: 18000, 
    description: "Collects debts",
    color: "bg-red-600"
  },
  { 
    id: 'scientist', 
    name: "Mad Scientist", 
    emoji: "🧪", 
    baseDps: 1000, 
    baseCost: 75000, 
    description: "Invents evil gadgets",
    color: "bg-purple-600"
  },
  { 
    id: 'army', 
    name: "Private Army", 
    emoji: "🪖", 
    baseDps: 4000, 
    baseCost: 350000, 
    description: "Military might",
    color: "bg-emerald-600"
  },
];

const CLICK_TEXTS = ["POW!", "BAM!", "WHAM!", "KAPOW!", "CRASH!", "BOOM!", "BANG!", "SMASH!"];

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.floor(num).toString();
};

const getItemCost = (baseCost, owned) => {
  return Math.floor(baseCost * Math.pow(1.15, owned));
};

// SPAWN LOGIC: Pick target from current tier with leakage mechanic
const spawnTarget = (currentTier, totalEarned) => {
  // Determine tier based on total earned
  let tierIndex = 0;
  if (totalEarned >= 200000) tierIndex = 3; // Tier 4
  else if (totalEarned >= 10000) tierIndex = 2; // Tier 3
  else if (totalEarned >= 500) tierIndex = 1; // Tier 2
  else tierIndex = 0; // Tier 1

  // Leakage mechanic: 25% chance to spawn from lower tier (if not in tier 1)
  if (tierIndex > 0 && Math.random() < 0.25) {
    tierIndex = Math.floor(Math.random() * tierIndex);
  }

  const tier = ALL_TIERS[tierIndex];
  
  // Rarity-based spawn rate
  // Ultra rare: 5%, Rare: 15%, Medium: 30%, Common: 50%
  const rand = Math.random();
  
  // Filter by rarity
  let chosenTarget;
  if (rand < 0.05) {
    // Ultra rare (5%)
    const ultraRare = tier.filter(t => t.rarity === 'ultra_rare');
    if (ultraRare.length > 0) {
      chosenTarget = ultraRare[Math.floor(Math.random() * ultraRare.length)];
    }
  }
  
  if (!chosenTarget && rand < 0.20) {
    // Rare (15% more = 20% cumulative)
    const rare = tier.filter(t => t.rarity === 'rare');
    if (rare.length > 0) {
      chosenTarget = rare[Math.floor(Math.random() * rare.length)];
    }
  }
  
  if (!chosenTarget && rand < 0.50) {
    // Medium (30% more = 50% cumulative)
    const medium = tier.filter(t => t.rarity === 'medium');
    if (medium.length > 0) {
      chosenTarget = medium[Math.floor(Math.random() * medium.length)];
    }
  }
  
  if (!chosenTarget) {
    // Common (remaining 50%)
    const common = tier.filter(t => t.rarity === 'common');
    chosenTarget = common[Math.floor(Math.random() * common.length)];
  }

  return { target: chosenTarget, tierIndex };
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function App() {
  // Game State
  const [money, setMoney] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [clickDamage, setClickDamage] = useState(1);
  const [currentTarget, setCurrentTarget] = useState(TIER_1_TARGETS[0]);
  const [currentTier, setCurrentTier] = useState(0);
  const [targetHp, setTargetHp] = useState(TIER_1_TARGETS[0].baseHp);
  const [targetMaxHp, setTargetMaxHp] = useState(TIER_1_TARGETS[0].baseHp);
  const [targetLevel, setTargetLevel] = useState(1);
  const [henchmenOwned, setHenchmenOwned] = useState({});
  const [equipmentOwned, setEquipmentOwned] = useState({});
  const [totalDps, setTotalDps] = useState(0);
  const [clickEffects, setClickEffects] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [totalClicks, setTotalClicks] = useState(0);
  const [targetsDefeated, setTargetsDefeated] = useState(0);
  const [activeShop, setActiveShop] = useState('henchmen'); // 'henchmen' or 'equipment'
  
  const effectIdRef = useRef(0);
  const targetRef = useRef(null);

  // Calculate total click damage from equipment
  useEffect(() => {
    let damage = 1; // Base click damage
    for (const equipment of EQUIPMENT) {
      const owned = equipmentOwned[equipment.id] || 0;
      if (owned > 0) {
        damage += equipment.clickDamage * owned;
      }
    }
    setClickDamage(damage);
  }, [equipmentOwned]);

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
    const loot = Math.floor(currentTarget.baseLoot * (1 + (targetLevel - 1) * 0.5));
    
    setMoney(prev => prev + loot);
    setTotalEarned(prev => prev + loot);
    setTargetsDefeated(prev => prev + 1);
    
    // Spawn next target using tier system
    const nextLevel = targetLevel + 1;
    setTargetLevel(nextLevel);
    
    const { target, tierIndex } = spawnTarget(currentTier, totalEarned + loot);
    setCurrentTarget(target);
    setCurrentTier(tierIndex);
    
    const levelMultiplier = 1 + (nextLevel - 1) * 0.3;
    const newMaxHp = Math.floor(target.baseHp * levelMultiplier);
    
    setTargetMaxHp(newMaxHp);
    setTargetHp(newMaxHp);
  }, [currentTarget, currentTier, targetLevel, totalEarned]);

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
    const cost = getItemCost(henchman.baseCost, owned);
    
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setHenchmenOwned(prev => ({
        ...prev,
        [henchman.id]: (prev[henchman.id] || 0) + 1
      }));
    }
  }, [money, henchmenOwned]);

  const buyEquipment = useCallback((equipment) => {
    const owned = equipmentOwned[equipment.id] || 0;
    const cost = getItemCost(equipment.baseCost, owned);
    
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setEquipmentOwned(prev => ({
        ...prev,
        [equipment.id]: (prev[equipment.id] || 0) + 1
      }));
    }
  }, [money, equipmentOwned]);

  const hpPercent = Math.max(0, (targetHp / targetMaxHp) * 100);
  const tierNames = ["The Streets", "Small Crimes", "Organized Crime", "Unstoppable"];

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
                    Become the Ultimate Supervillain!
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
                {/* Money */}
                <div className="neo-brutal-sm bg-yellow-400 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-800" />
                  <span className="text-lg sm:text-xl font-black text-black">
                    ${formatNumber(money)}
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

            {/* Tier Display (replaces Rank) */}
            <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold">Current Tier:</span>
                <span className="comic-font text-xl sm:text-2xl text-cyan-300">
                  {tierNames[currentTier]}
                </span>
              </div>
              
              <div className="text-purple-200 text-xs sm:text-sm">
                <span className="opacity-75">Total Earned:</span>{' '}
                <span className="font-black text-yellow-300">${formatNumber(totalEarned)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* LEFT SIDE - Stats */}
          <div className="lg:w-64 order-2 lg:order-1">
            <div className="neo-brutal bg-slate-800 p-4 rounded-xl">
              <h2 className="comic-font text-xl text-cyan-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> STATS
              </h2>
              
              <div className="space-y-3 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Clicks:</span>
                  <span className="font-black text-yellow-400">{formatNumber(totalClicks)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Targets Defeated:</span>
                  <span className="font-black text-red-400">{targetsDefeated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Click Damage:</span>
                  <span className="font-black text-cyan-400">{clickDamage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Earned:</span>
                  <span className="font-black text-green-400">${formatNumber(totalEarned)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Target Level:</span>
                  <span className="font-black text-purple-400">{targetLevel}</span>
                </div>
              </div>

              {/* Henchmen Summary */}
              <div className="mt-4 pt-4 border-t-2 border-slate-700">
                <h3 className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" /> Your Gang:
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
                    <span className="text-gray-500 text-sm">None yet...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER - Target (Character Card Style) */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="neo-brutal-lg bg-gradient-to-b from-slate-800 to-slate-900 p-4 sm:p-6 rounded-xl min-h-[400px] sm:min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Target Info */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-red-500" />
                  <span className="text-gray-400 font-bold text-sm">LEVEL {targetLevel}</span>
                  <span className="text-gray-500 text-xs">• {tierNames[currentTier]}</span>
                </div>
                <h2 className="comic-font text-2xl sm:text-3xl text-white">
                  {currentTarget.name}
                </h2>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">
                  {currentTarget.rarity === 'ultra_rare' && '★★★★ ULTRA RARE ★★★★'}
                  {currentTarget.rarity === 'rare' && '★★★ RARE ★★★'}
                  {currentTarget.rarity === 'medium' && '★★ MEDIUM'}
                  {currentTarget.rarity === 'common' && '★ COMMON'}
                </div>
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

              {/* Character Card (replaces circular button) */}
              <button 
                ref={targetRef}
                onClick={handleClick}
                aria-label={`Attack ${currentTarget.name}`}
                className={`
                  relative cursor-pointer select-none
                  character-card neo-brutal-lg
                  w-64 h-80 sm:w-72 sm:h-96 rounded-2xl
                  flex flex-col items-center justify-center
                  transition-transform hover:scale-105 active:scale-95
                  ${isShaking ? 'shake' : ''}
                  pulse-glow
                  p-6
                `}
              >
                {/* Card Border Accent */}
                <div className="absolute inset-3 border-4 border-yellow-500/30 rounded-xl pointer-events-none" />
                
                {/* Target emoji */}
                <div className="mb-4">
                  <span className="text-8xl sm:text-9xl relative z-10 drop-shadow-2xl">
                    {currentTarget.emoji}
                  </span>
                </div>

                {/* Target Name on Card */}
                <div className="bg-black/70 px-4 py-2 rounded-lg neo-brutal-sm border-yellow-500">
                  <h3 className="comic-font text-xl sm:text-2xl text-white text-center">
                    {currentTarget.name}
                  </h3>
                </div>

                {/* Stats overlay */}
                <div className="absolute top-4 left-4 neo-brutal-sm bg-red-600 px-2 py-1 rounded">
                  <span className="text-white text-xs font-black">LVL {targetLevel}</span>
                </div>
                <div className="absolute top-4 right-4 neo-brutal-sm bg-yellow-500 px-2 py-1 rounded">
                  <span className="text-black text-xs font-black">${formatNumber(currentTarget.baseLoot)}</span>
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
                  Click to Attack!
                  <Swords className="w-4 h-4" />
                </p>
                <p className="text-yellow-400 font-black mt-1">
                  +{clickDamage} Damage per Click
                </p>
              </div>

              {/* Loot Preview */}
              <div className="absolute bottom-4 right-4 neo-brutal-sm bg-yellow-400 px-3 py-2 rounded-lg">
                <span className="text-xs text-yellow-800 font-bold">LOOT:</span>
                <span className="ml-2 font-black text-black">
                  ~${formatNumber(Math.floor(currentTarget.baseLoot * (1 + (targetLevel - 1) * 0.5)))}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Shop */}
          <div className="lg:w-80 order-3">
            <div className="neo-brutal bg-slate-800 p-4 rounded-xl">
              {/* Shop Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveShop('henchmen')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all
                    ${activeShop === 'henchmen' 
                      ? 'neo-brutal-sm bg-purple-600 text-white' 
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }
                  `}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  HENCHMEN
                </button>
                <button
                  onClick={() => setActiveShop('equipment')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all
                    ${activeShop === 'equipment' 
                      ? 'neo-brutal-sm bg-orange-600 text-white' 
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }
                  `}
                >
                  <Hammer className="w-4 h-4 inline mr-1" />
                  EQUIPMENT
                </button>
              </div>

              <h2 className="comic-font text-xl sm:text-2xl text-yellow-400 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" /> 
                {activeShop === 'henchmen' ? 'HIRE GANG' : 'BUY GEAR'}
              </h2>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {/* Henchmen Shop */}
                {activeShop === 'henchmen' && HENCHMEN.map(henchman => {
                  const owned = henchmenOwned[henchman.id] || 0;
                  const cost = getItemCost(henchman.baseCost, owned);
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
                              ${formatNumber(cost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Equipment Shop */}
                {activeShop === 'equipment' && EQUIPMENT.map(equipment => {
                  const owned = equipmentOwned[equipment.id] || 0;
                  const cost = getItemCost(equipment.baseCost, owned);
                  const canAfford = money >= cost;
                  
                  return (
                    <button
                      key={equipment.id}
                      onClick={() => buyEquipment(equipment)}
                      disabled={!canAfford}
                      className={`
                        w-full neo-brutal-sm rounded-lg p-3 text-left
                        transition-all duration-150
                        ${canAfford 
                          ? `${equipment.color} hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]` 
                          : 'bg-gray-700 opacity-60 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Emoji */}
                        <div className="text-3xl">{equipment.emoji}</div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-white text-sm truncate">
                              {equipment.name}
                            </span>
                            {owned > 0 && (
                              <span className="neo-brutal-sm bg-black/30 px-2 py-0.5 rounded text-xs text-white font-black">
                                x{owned}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/70 truncate">{equipment.description}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-cyan-300" />
                              <span className="text-white font-bold">+{equipment.clickDamage} Click</span>
                            </span>
                            <span className={`font-black text-sm ${canAfford ? 'text-white' : 'text-red-300'}`}>
                              ${formatNumber(cost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Shop Summary */}
              <div className="mt-4 pt-4 border-t-2 border-slate-700">
                {activeShop === 'henchmen' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Auto Damage:</span>
                    <span className="comic-font text-xl text-red-400">
                      {formatNumber(totalDps)} DPS
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Click Damage:</span>
                    <span className="comic-font text-xl text-cyan-400">
                      {clickDamage}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-6 text-center">
          <p className="text-gray-600 text-xs">
            🦹 Rise of the Villain - An Idle RPG Clicker 🦹
          </p>
        </footer>
      </div>
    </div>
  );
}
