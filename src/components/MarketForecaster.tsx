import { useState } from 'react';
import { TrendingUp, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import marketData from '../data/market.json';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarketForecaster() {
  const [crop, setCrop] = useState('');
  const [region, setRegion] = useState('');
  const [forecast, setForecast] = useState('');
  const [loading, setLoading] = useState(false);

  const getForecast = async () => {
    if (!crop || !region) return;

    setLoading(true);
    setForecast('');

    try {
      const { chatWithAI } = await import('../services/geminiService');
      const marketContext = JSON.stringify(marketData);
      const prompt = `
        As an expert agricultural market analyst, provide a brief market analysis and price forecast for ${crop} in the ${region} region. 
        Use this market data as context: ${marketContext}.
        Include:
        1. Current Trend (Bullish/Bearish)
        2. Predicted Price Range for next month
        3. Key factors affecting price (weather, harvest cycles)
        4. Advice for farmers (Sell now vs Hold)
        
        Keep it concise and practical. Use markdown.
      `;

      const response = await chatWithAI(prompt, []);
      setForecast(response || 'No forecast available.');
    } catch (error) {
      console.error('Forecast error:', error);
      setForecast('Sorry, there was an error generating the forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glassmorphism p-8 bg-gradient-to-br from-[var(--color-neon-blue)]/5 to-transparent">
      <div className="flex items-center mb-6">
        <div className="bg-[var(--color-neon-blue)]/20 p-3 rounded-2xl mr-4">
          <TrendingUp className="h-6 w-6 text-[var(--color-neon-blue)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-display text-white">AI Market Forecaster</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">Predictive commodity analytics powered by Gemini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select 
          value={crop} 
          onChange={e => setCrop(e.target.value)} 
          className="w-full p-3 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-white rounded-xl focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
        >
          <option value="" className="bg-[var(--color-bg-dark)]">Select Crop</option>
          {[...new Set(marketData.map(c => c.crop))].map(c => <option key={c} value={c} className="bg-[var(--color-bg-dark)]">{c}</option>)}
        </select>
        <select 
          value={region} 
          onChange={e => setRegion(e.target.value)} 
          className="w-full p-3 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-white rounded-xl focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
        >
          <option value="" className="bg-[var(--color-bg-dark)]">Select Region</option>
          {[...new Set(marketData.map(c => c.state))].map(s => <option key={s} value={s} className="bg-[var(--color-bg-dark)]">{s}</option>)}
        </select>
        <button 
          onClick={getForecast} 
          disabled={loading || !crop || !region} 
          className="w-full p-3 bg-[var(--color-neon-blue)] text-white rounded-xl font-semibold hover:bg-[var(--color-neon-purple)] disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-blue-500/20"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Sparkles className="mr-2" size={18} />}
          {loading ? 'Analyzing...' : 'Generate Forecast'}
        </button>
      </div>

      <AnimatePresence>
        {forecast && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-white/5 rounded-2xl border border-white/10 prose prose-invert max-w-none"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{forecast}</ReactMarkdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
