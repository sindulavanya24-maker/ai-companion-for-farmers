import { motion } from 'motion/react';
import { Play, Info, ExternalLink } from 'lucide-react';

const guideItems = [
  {
    title: 'Precision Irrigation',
    desc: 'How smart sensors optimize water usage in vertical farming.',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-drip-irrigation-system-in-a-greenhouse-34532-large.mp4',
    thumbnail: 'https://picsum.photos/seed/irrigation/800/450'
  },
  {
    title: 'Soil Nutrient Analysis',
    desc: 'Understanding the chemical composition of your soil for better yield.',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-hands-holding-soil-34533-large.mp4',
    thumbnail: 'https://picsum.photos/seed/soil-analysis/800/450'
  },
  {
    title: 'Sustainable Pest Control',
    desc: 'Using biological methods to manage pests without harmful chemicals.',
    video: 'https://assets.mixkit.co/videos/preview/mixkit-ladybug-on-a-green-leaf-34534-large.mp4',
    thumbnail: 'https://picsum.photos/seed/pest-control/800/450'
  }
];

export default function VisualGuide() {
  return (
    <div className="p-8 space-y-12">
      <div>
        <h2 className="text-4xl font-bold font-display text-white">Visual Learning Guide</h2>
        <p className="text-[var(--color-text-secondary)]">Master modern agricultural techniques through high-definition visual content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {guideItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glassmorphism overflow-hidden group flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden">
              <video 
                src={item.video}
                poster={item.thumbnail}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                muted
                loop
                onMouseOver={(e) => e.currentTarget.play()}
                onMouseOut={(e) => e.currentTarget.pause()}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                  <Play className="text-white fill-white" size={24} />
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Tutorial</span>
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-grow flex flex-col">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-neon-blue)] transition-colors">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
              
              <div className="pt-4 mt-auto flex items-center justify-between">
                <button className="flex items-center text-xs font-bold text-[var(--color-neon-cyan)] hover:opacity-80 transition-opacity">
                  <Info size={14} className="mr-1" />
                  Learn More
                </button>
                <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <ExternalLink size={14} className="text-white/40" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animated Photo Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Animated Photo Gallery</h3>
          <div className="h-px flex-grow mx-8 bg-white/10"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <motion.div
              key={n}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="relative aspect-square rounded-2xl overflow-hidden glassmorphism border-0"
            >
              <img 
                src={`https://picsum.photos/seed/agri-${n}/600/600`} 
                alt={`Agri ${n}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-[10px] font-mono text-white uppercase tracking-widest">Visual Insight #{n}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
