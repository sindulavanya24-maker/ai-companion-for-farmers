import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Droplets, Thermometer, Wind, Sprout, Leaf, Flower, Cherry } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const growthStages = [
  { stage: 'Seed', icon: Sprout, color: 'text-amber-600', scale: 0.5, y: 20 },
  { stage: 'Germination', icon: Sprout, color: 'text-green-400', scale: 0.8, y: 10 },
  { stage: 'Seedling', icon: Leaf, color: 'text-green-500', scale: 1.2, y: 0 },
  { stage: 'Vegetative', icon: Leaf, color: 'text-green-600', scale: 1.8, y: -10 },
  { stage: 'Flowering', icon: Flower, color: 'text-pink-400', scale: 2.2, y: -20 },
  { stage: 'Fruiting', icon: Cherry, color: 'text-red-500', scale: 2.5, y: -30 },
];

export default function CropGrowthSimulator() {
  const { t } = useTranslation();
  const [day, setDay] = useState(0);
  const [sunlight, setSunlight] = useState(70);
  const [water, setWater] = useState(50);
  const [temp, setTemp] = useState(25);

  const currentStageIndex = Math.min(
    Math.floor((day / 100) * growthStages.length),
    growthStages.length - 1
  );
  const currentStage = growthStages[currentStageIndex];
  const Icon = currentStage.icon;

  // Calculate health based on conditions
  const health = Math.max(0, 100 - Math.abs(sunlight - 70) - Math.abs(water - 60) - Math.abs(temp - 25));

  return (
    <div className="glassmorphism p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Crop Growth Simulator</h2>
          <p className="text-[var(--color-text-secondary)]">Visualize crop development based on environmental variables.</p>
        </div>
        <div className="bg-[var(--color-neon-cyan)]/10 px-4 py-2 rounded-full border border-[var(--color-neon-cyan)]/20">
          <span className="text-[var(--color-neon-cyan)] font-mono font-bold">Health: {Math.round(health)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Simulation Area */}
        <div className="relative h-80 bg-gradient-to-b from-sky-900/20 to-amber-900/20 rounded-3xl overflow-hidden border border-[var(--color-glass-border)] flex items-end justify-center pb-12">
          {/* Background Elements */}
          <motion.div 
            animate={{ opacity: sunlight / 100 }}
            className="absolute top-8 right-8 text-yellow-400"
          >
            <Sun size={48} className="animate-spin-slow" />
          </motion.div>
          
          <div className="absolute inset-x-0 bottom-0 h-12 bg-amber-900/40 border-t border-amber-800/50"></div>

          {/* Plant Animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage.stage}
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ 
                scale: currentStage.scale * (health / 100), 
                opacity: 1, 
                y: currentStage.y,
                filter: health < 50 ? 'grayscale(0.5) sepia(0.3)' : 'none'
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className={`relative z-10 ${currentStage.color}`}
            >
              <Icon size={48} />
              {/* Growth Particles */}
              {health > 80 && (
                <motion.div
                  animate={{ y: [-10, -30], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-cyan-400"
                >
                  <Wind size={12} />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 font-mono text-xs uppercase tracking-widest">
            Stage: {currentStage.stage} • Day {day}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white flex items-center">
                <Sprout size={16} className="mr-2 text-green-400" />
                Growth Timeline (Days)
              </label>
              <span className="text-[var(--color-neon-blue)] font-mono">{day}d</span>
            </div>
            <input 
              type="range" min="0" max="100" value={day} 
              onChange={(e) => setDay(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--color-neon-blue)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glassmorphism p-4 space-y-3">
              <Sun size={20} className="text-yellow-400" />
              <p className="text-[10px] uppercase font-mono text-white/50">Sunlight</p>
              <input 
                type="range" min="0" max="100" value={sunlight} 
                onChange={(e) => setSunlight(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
              />
            </div>
            <div className="glassmorphism p-4 space-y-3">
              <Droplets size={20} className="text-blue-400" />
              <p className="text-[10px] uppercase font-mono text-white/50">Water</p>
              <input 
                type="range" min="0" max="100" value={water} 
                onChange={(e) => setWater(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>
            <div className="glassmorphism p-4 space-y-3">
              <Thermometer size={20} className="text-red-400" />
              <p className="text-[10px] uppercase font-mono text-white/50">Temp</p>
              <input 
                type="range" min="0" max="100" value={temp} 
                onChange={(e) => setTemp(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-400"
              />
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="text-sm font-bold text-white mb-2">AI Simulation Insight</h4>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {health > 80 
                ? "Optimal conditions detected. The crop is showing vigorous growth and high nutrient absorption."
                : health > 50 
                ? "Sub-optimal conditions. Consider adjusting water levels to prevent stress during the vegetative stage."
                : "Critical stress detected. Immediate intervention required to prevent permanent yield loss."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
