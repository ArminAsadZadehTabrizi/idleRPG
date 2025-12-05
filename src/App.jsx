import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Coins, 
  Zap, 
  Users, 
  Swords,
  TrendingUp
} from 'lucide-react';

// ============================================
// GAME DATA
// ============================================

// TIER SYSTEM: 4 Tiers with rarity-based spawn rates
const TIER_1_TARGETS = [
  { name: "Street Musician", baseHp: 10, baseLoot: 8, rarity: "common", color: "bg-green-400" },
  { name: "Pensioner", baseHp: 15, baseLoot: 15, rarity: "medium", color: "bg-blue-400" },
  { name: "Confused Tourist", baseHp: 20, baseLoot: 30, rarity: "rare", color: "bg-yellow-400" },
];

const TIER_2_TARGETS = [
  { name: "Delivery Van", baseHp: 50, baseLoot: 60, rarity: "common", color: "bg-cyan-400" },
  { name: "Gas Station", baseHp: 100, baseLoot: 120, rarity: "medium", color: "bg-orange-400" },
  { name: "Safe", baseHp: 150, baseLoot: 200, rarity: "medium", color: "bg-amber-500" },
  { name: "Gumball Machine", baseHp: 200, baseLoot: 300, rarity: "rare", color: "bg-pink-400" },
];

const TIER_3_TARGETS = [
  { name: "ATM", baseHp: 400, baseLoot: 500, rarity: "common", color: "bg-emerald-400" },
  { name: "Bank", baseHp: 800, baseLoot: 1000, rarity: "rare", color: "bg-purple-500" },
  { name: "Jeweler", baseHp: 1200, baseLoot: 1600, rarity: "rare", color: "bg-pink-500" },
  { name: "Robot", baseHp: 1500, baseLoot: 2000, rarity: "rare", color: "bg-cyan-500" },
];

const TIER_4_TARGETS = [
  { name: "The White House", baseHp: 3000, baseLoot: 3500, rarity: "common", color: "bg-blue-500" },
  { name: "Mega Robot", baseHp: 6000, baseLoot: 7000, rarity: "medium", color: "bg-slate-500" },
  { name: "Superhero", baseHp: 10000, baseLoot: 12000, rarity: "rare", color: "bg-red-500" },
  { name: "Dragon", baseHp: 20000, baseLoot: 25000, rarity: "ultra_rare", color: "bg-violet-600" },
];

const ALL_TIERS = [TIER_1_TARGETS, TIER_2_TARGETS, TIER_3_TARGETS, TIER_4_TARGETS];

// EQUIPMENT (Click Damage)
const EQUIPMENT = [
  { 
    id: 'brass_knuckles', 
    name: "Brass Knuckles", 
    icon: "✊", 
    clickDamage: 1, 
    baseCost: 25, 
    description: "Basic street fight",
    color: "bg-amber-600"
  },
  { 
    id: 'crowbar', 
    name: "Crowbar", 
    icon: "🪛", 
    clickDamage: 5, 
    baseCost: 150, 
    description: "Break and enter",
    color: "bg-gray-600"
  },
  { 
    id: 'baseball_bat', 
    name: "Baseball Bat", 
    icon: "⚾", 
    clickDamage: 12, 
    baseCost: 600, 
    description: "Swing for the fences",
    color: "bg-brown-600"
  },
  { 
    id: 'pistol', 
    name: "Pistol", 
    icon: "🔫", 
    clickDamage: 40, 
    baseCost: 3000, 
    description: "Pack some heat",
    color: "bg-slate-700"
  },
  { 
    id: 'assault_rifle', 
    name: "Assault Rifle", 
    icon: "🔫", 
    clickDamage: 150, 
    baseCost: 15000, 
    description: "Heavy firepower",
    color: "bg-red-700"
  },
];

// HENCHMEN (Auto-DPS)
const HENCHMEN = [
  { 
    id: 'street_rat', 
    name: "Street Rat", 
    baseDps: 1, 
    baseCost: 15, 
    description: "Sneaky petty thief",
    color: "bg-gray-500"
  },
  { 
    id: 'thug', 
    name: "Thug", 
    baseDps: 4, 
    baseCost: 80, 
    description: "Muscle for hire",
    color: "bg-orange-500"
  },
  { 
    id: 'burglar', 
    name: "Pro Burglar", 
    baseDps: 12, 
    baseCost: 300, 
    description: "Silent and deadly",
    color: "bg-indigo-500"
  },
  { 
    id: 'hacker', 
    name: "Elite Hacker", 
    baseDps: 35, 
    baseCost: 1200, 
    description: "Cracks any system",
    color: "bg-cyan-500"
  },
  { 
    id: 'lawyer', 
    name: "Corrupt Lawyer", 
    baseDps: 100, 
    baseCost: 4000, 
    description: "Gets you off the hook",
    color: "bg-blue-600"
  },
  { 
    id: 'enforcer', 
    name: "Enforcer", 
    baseDps: 300, 
    baseCost: 15000, 
    description: "Collects debts",
    color: "bg-red-600"
  },
  { 
    id: 'scientist', 
    name: "Mad Scientist", 
    baseDps: 1000, 
    baseCost: 60000, 
    description: "Invents evil gadgets",
    color: "bg-purple-600"
  },
  { 
    id: 'army', 
    name: "Private Army", 
    baseDps: 4000, 
    baseCost: 280000, 
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

// SPAWN LOGIC
const spawnTarget = (currentTier, totalEarned) => {
  let tierIndex = 0;
  if (totalEarned >= 30000) tierIndex = 3;
  else if (totalEarned >= 3000) tierIndex = 2;
  else if (totalEarned >= 300) tierIndex = 1;
  else tierIndex = 0;

  // Leakage mechanic
  if (tierIndex > 0 && Math.random() < 0.25) {
    tierIndex = Math.floor(Math.random() * tierIndex);
  }

  const tier = ALL_TIERS[tierIndex];
  
  // Rarity-based spawn rate
  const rand = Math.random();
  let chosenTarget;
  
  if (rand < 0.05) {
    const ultraRare = tier.filter(t => t.rarity === 'ultra_rare');
    if (ultraRare.length > 0) {
      chosenTarget = ultraRare[Math.floor(Math.random() * ultraRare.length)];
    }
  }
  
  if (!chosenTarget && rand < 0.20) {
    const rare = tier.filter(t => t.rarity === 'rare');
    if (rare.length > 0) {
      chosenTarget = rare[Math.floor(Math.random() * rare.length)];
    }
  }
  
  if (!chosenTarget && rand < 0.50) {
    const medium = tier.filter(t => t.rarity === 'medium');
    if (medium.length > 0) {
      chosenTarget = medium[Math.floor(Math.random() * medium.length)];
    }
  }
  
  if (!chosenTarget) {
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
  const [activeShop, setActiveShop] = useState('gang'); // 'gang' or 'equipment'
  const [moneyPulse, setMoneyPulse] = useState(false);
  
  const effectIdRef = useRef(0);
  const targetRef = useRef(null);
  const prevMoneyRef = useRef(0);

  // Pulse animation when money increases
  useEffect(() => {
    if (money > prevMoneyRef.current) {
      setMoneyPulse(true);
      setTimeout(() => setMoneyPulse(false), 300);
    }
    prevMoneyRef.current = money;
  }, [money]);

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
    const loot = Math.floor(currentTarget.baseLoot * (1 + (targetLevel - 1) * 0.3));
    
    // Show money drop effect
    const rect = targetRef.current?.getBoundingClientRect();
    if (rect) {
      const x = rect.width / 2;
      const y = rect.height / 2;
      const id = effectIdRef.current++;
      setClickEffects(prev => [...prev, { 
        id, 
        x, 
        y, 
        text: `+$${formatNumber(loot)}`, 
        type: 'money'
      }]);
      
      setTimeout(() => {
        setClickEffects(prev => prev.filter(effect => effect.id !== id));
      }, 1000);
    }
    
    setMoney(prev => prev + loot);
    setTotalEarned(prev => {
      const newTotal = prev + loot;
      
      const nextLevel = targetLevel + 1;
      setTargetLevel(nextLevel);
      
      const { target, tierIndex } = spawnTarget(currentTier, newTotal);
      setCurrentTarget(target);
      setCurrentTier(tierIndex);
      
      const levelMultiplier = 1 + (nextLevel - 1) * 0.2;
      const newMaxHp = Math.floor(target.baseHp * levelMultiplier);
      
      setTargetMaxHp(newMaxHp);
      setTargetHp(newMaxHp);
      
      return newTotal;
    });
  }, [currentTarget, currentTier, targetLevel]);

  const handleClick = useCallback((e) => {
    setTargetHp(prev => prev - clickDamage);
    
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 150);
    
    const rect = targetRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Random chance for critical hit
      const isCritical = Math.random() < 0.15;
      const damage = isCritical ? clickDamage * 2 : clickDamage;
      
      const id = effectIdRef.current++;
      setClickEffects(prev => [...prev, { 
        id, 
        x, 
        y, 
        text: `${damage}`, 
        type: isCritical ? 'critical' : 'normal'
      }]);
      
      setTimeout(() => {
        setClickEffects(prev => prev.filter(effect => effect.id !== id));
      }, 800);
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

  // Get unique henchmen for display (limit to top 6 most powerful)
  const ownedHenchmen = HENCHMEN.filter(h => (henchmenOwned[h.id] || 0) > 0)
    .map(h => ({
      ...h,
      count: henchmenOwned[h.id]
    }))
    .slice(-6); // Show last 6 (most powerful)

  // Zone names based on tier
  const ZONE_NAMES = ["THE STREETS", "NEON CITY", "BANK DISTRICT", "FINAL LAIR"];
  const currentZone = ZONE_NAMES[currentTier] || "THE STREETS";
  
  // Dynamic background based on tier
  const tierBackgrounds = [
    "linear-gradient(180deg, #1e3a5f 0%, #2c4a6b 50%, #1a2332 100%)", // Tier 0: Dark Blue/Grey
    "linear-gradient(180deg, #4a1e6b 0%, #7c2d91 50%, #2d1042 100%)", // Tier 1: Deep Purple/Pink
    "linear-gradient(180deg, #0f4a3e 0%, #1a6b5e 50%, #0a1a1a 100%)", // Tier 2: Emerald/Black
    "linear-gradient(180deg, #5a0f0f 0%, #8b1515 50%, #1a0a0a 100%)", // Tier 3: Red/Darkness
  ];

  return (
    <div className="game-container">
      {/* HUD - Fixed Top Bar with Glassmorphism */}
      <div className="hud">
        <div className={`hud-money ${moneyPulse ? 'pulse' : ''}`}>
          <Coins className="hud-icon" />
          <span className="hud-value">${formatNumber(money)}</span>
        </div>
        <div className="hud-zone">
          <div className="zone-badge">{currentZone}</div>
        </div>
        <div className="hud-dps">
          <Zap className="hud-icon" />
          <span className="hud-value">{formatNumber(totalDps)}</span>
        </div>
      </div>

      {/* BATTLE STAGE (Top 60%) */}
      <div className="battle-stage" style={{ background: tierBackgrounds[currentTier] }}>
        {/* Animated grid pattern overlay */}
        <div className="stage-grid"></div>
        
        {/* Stage content */}
        <div className="stage-content">
          {/* Target Info */}
          <div className="target-info">
            <h2 className="target-name">{currentTarget.name}</h2>
            <div className="target-level">LEVEL {targetLevel}</div>
          </div>

          {/* Target Monster */}
          <div 
            ref={targetRef}
            onClick={handleClick}
            className={`target-monster ${isShaking ? 'shake' : ''}`}
          >
            <img 
              src={`https://robohash.org/${currentTarget.name}?set=set2&size=400x400`}
              alt={currentTarget.name}
              className="monster-img"
            />
            
            {/* Floating damage/money effects */}
            {clickEffects.map(effect => (
              <div
                key={effect.id}
                className={`floating-number ${effect.type}`}
                style={{
                  left: effect.x,
                  top: effect.y,
                }}
              >
                {effect.text}
              </div>
            ))}
          </div>

          {/* HP Bar directly under monster */}
          <div className="hp-bar-wrapper">
            <div className="hp-bar-container">
              <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }}>
                <div className="hp-shine"></div>
              </div>
              <div className="hp-text">
                {formatNumber(Math.max(0, targetHp))} / {formatNumber(targetMaxHp)}
              </div>
            </div>
          </div>

          {/* 3D Platform with Henchmen */}
          <div className="platform-scene">
            <div className="platform">
              {/* Henchmen positioned around platform */}
              <div className="henchmen-crew">
                {ownedHenchmen.length === 0 ? (
                  <div className="no-crew">
                    <Users className="no-crew-icon" />
                    <p className="no-crew-text">Recruit your crew below</p>
                  </div>
                ) : (
                  ownedHenchmen.map((henchman, index) => (
                    <div 
                      key={henchman.id} 
                      className={`crew-member position-${index % 6}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <img 
                        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${henchman.name}`}
                        alt={henchman.name}
                        className="crew-avatar"
                      />
                      <div className="crew-count">×{henchman.count}</div>
                      <div className="crew-glow"></div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="platform-shadow"></div>
          </div>
        </div>
      </div>

      {/* SHOP PANEL (Bottom 40%) */}
      <div className="shop-panel">
        {/* Sticky Shop Tabs */}
        <div className="shop-tabs-sticky">
          <button
            onClick={() => setActiveShop('gang')}
            className={`shop-tab ${activeShop === 'gang' ? 'active' : ''}`}
          >
            <Users className="tab-icon" />
            <span className="tab-label">GANG</span>
          </button>
          <button
            onClick={() => setActiveShop('equipment')}
            className={`shop-tab ${activeShop === 'equipment' ? 'active' : ''}`}
          >
            <Swords className="tab-icon" />
            <span className="tab-label">EQUIPMENT</span>
          </button>
        </div>

        {/* Shop Content - Scrollable */}
        <div className="shop-content">
          {activeShop === 'gang' ? (
            <div className="shop-list">
              {HENCHMEN.map(henchman => {
                const owned = henchmenOwned[henchman.id] || 0;
                const cost = getItemCost(henchman.baseCost, owned);
                const canAfford = money >= cost;
                
                return (
                  <div
                    key={henchman.id}
                    className={`shop-card ${!canAfford ? 'disabled' : ''}`}
                  >
                    <div className="card-icon-wrapper">
                      <img 
                        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${henchman.name}`}
                        alt={henchman.name}
                        className="card-icon"
                      />
                      {owned > 0 && <div className="card-level">Lv.{owned}</div>}
                    </div>
                    <div className="card-details">
                      <div className="card-name">{henchman.name}</div>
                      <div className="card-desc">{henchman.description}</div>
                      <div className="card-stat">
                        <TrendingUp className="stat-icon-small" />
                        <span>+{henchman.baseDps} DPS</span>
                      </div>
                    </div>
                    <button
                      onClick={() => buyHenchman(henchman)}
                      disabled={!canAfford}
                      className={`buy-button ${canAfford ? 'affordable' : 'unaffordable'}`}
                    >
                      <Coins className="buy-icon" />
                      <span className="buy-cost">{formatNumber(cost)}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="shop-list">
              {EQUIPMENT.map(equipment => {
                const owned = equipmentOwned[equipment.id] || 0;
                const cost = getItemCost(equipment.baseCost, owned);
                const canAfford = money >= cost;
                
                return (
                  <div
                    key={equipment.id}
                    className={`shop-card ${!canAfford ? 'disabled' : ''}`}
                  >
                    <div className="card-icon-wrapper equipment">
                      <div className="equipment-icon">
                        <span className="equipment-emoji">{equipment.icon}</span>
                      </div>
                      {owned > 0 && <div className="card-level">Lv.{owned}</div>}
                    </div>
                    <div className="card-details">
                      <div className="card-name">{equipment.name}</div>
                      <div className="card-desc">{equipment.description}</div>
                      <div className="card-stat">
                        <Swords className="stat-icon-small" />
                        <span>+{equipment.clickDamage} DMG</span>
                      </div>
                    </div>
                    <button
                      onClick={() => buyEquipment(equipment)}
                      disabled={!canAfford}
                      className={`buy-button ${canAfford ? 'affordable' : 'unaffordable'}`}
                    >
                      <Coins className="buy-icon" />
                      <span className="buy-cost">{formatNumber(cost)}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
