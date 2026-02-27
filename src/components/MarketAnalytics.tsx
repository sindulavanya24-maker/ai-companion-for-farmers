import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Calendar, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import marketData from '../data/market.json';

const generateMockHistory = (basePrice: number) => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    price: Math.round(basePrice * (0.8 + Math.random() * 0.4)),
    volume: Math.round(1000 + Math.random() * 5000),
  }));
};

export default function MarketAnalytics() {
  const [selectedCrop, setSelectedCrop] = useState(marketData[0].crop);
  const [timeRange, setTimeRange] = useState('1Y');

  const crops = useMemo(() => [...new Set(marketData.map(d => d.crop))], []);
  
  const currentCropData = useMemo(() => {
    const crop = marketData.find(d => d.crop === selectedCrop) || marketData[0];
    return {
      ...crop,
      history: generateMockHistory(crop.modal_price)
    };
  }, [selectedCrop]);

  const priceChange = ((currentCropData.modal_price - (currentCropData.previous_modal_price || currentCropData.modal_price * 0.9)) / (currentCropData.previous_modal_price || currentCropData.modal_price * 0.9)) * 100;

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Market Intelligence Hub</h2>
          <p className="text-[var(--color-text-secondary)]">Advanced price forecasting and volume analytics.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedCrop} 
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
          >
            {crops.map(crop => <option key={crop} value={crop}>{crop}</option>)}
          </select>
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            {['1M', '6M', '1Y', 'ALL'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${timeRange === range ? 'bg-[var(--color-neon-blue)] text-white' : 'text-white/40 hover:text-white'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Price Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glassmorphism p-6 h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Activity size={18} className="text-[var(--color-neon-cyan)]" />
              <h3 className="text-white font-bold">Price Trajectory</h3>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                Market Price
              </div>
              <div className="flex items-center text-blue-400 opacity-50">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                AI Forecast
              </div>
            </div>
          </div>
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentCropData.history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00BFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#00BFFF' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#00BFFF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stats & Insights */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glassmorphism p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Current Modal Price</p>
                <h4 className="text-3xl font-bold text-white">₹{currentCropData.modal_price}</h4>
              </div>
              <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold ${priceChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {priceChange >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {Math.abs(priceChange).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Market Location</span>
                <span className="text-white flex items-center"><MapPin size={12} className="mr-1" /> {currentCropData.market}, {currentCropData.state}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Last Updated</span>
                <span className="text-white flex items-center"><Calendar size={12} className="mr-1" /> 27 Feb 2026</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glassmorphism p-6 bg-gradient-to-br from-[var(--color-neon-purple)]/10 to-transparent"
          >
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Activity size={16} className="mr-2 text-[var(--color-neon-purple)]" />
              AI Market Sentiment
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Demand Index</span>
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    className="h-full bg-[var(--color-neon-purple)]"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Supply Risk</span>
                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '30%' }}
                    className="h-full bg-red-400"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-white/40 mt-4 leading-relaxed">
              * Based on regional weather patterns and historical harvest cycles.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glassmorphism p-6 border-l-4 border-[var(--color-neon-cyan)]"
          >
            <h4 className="text-xs font-bold text-[var(--color-neon-cyan)] uppercase tracking-widest mb-2">Recommendation</h4>
            <p className="text-sm text-white/80 leading-relaxed">
              Current trends suggest a price peak in 3 weeks. Recommend holding inventory for premium pricing.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Volume Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glassmorphism p-6 h-[250px]"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Activity size={18} className="text-[var(--color-neon-purple)]" />
          <h3 className="text-white font-bold">Arrival Volume (Quintals)</h3>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentCropData.history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#ffffff40" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#ffffff40" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip 
              cursor={{ fill: '#ffffff05' }}
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20', borderRadius: '12px' }}
            />
            <Bar 
              dataKey="volume" 
              fill="#8A2BE2" 
              radius={[4, 4, 0, 0]} 
              animationDuration={2000}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
