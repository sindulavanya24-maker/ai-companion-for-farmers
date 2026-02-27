import { useTranslation } from 'react-i18next';
import { Volume2, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface CropPrice {
  id: number;
  crop: string;
  market: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  previous_modal_price?: number;
  unit: string;
  state: string;
  historical_data?: { date: string; price: number }[];
}

interface CropPriceCardProps {
  crop: CropPrice;
  onClick: () => void;
}

export default function CropPriceCard({ crop, onClick }: CropPriceCardProps) {
  const { i18n } = useTranslation();

  const speak = (text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language;
    speechSynthesis.speak(utterance);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToSpeak = `
      Crop: ${crop.crop}. 
      Market: ${crop.market}, ${crop.state}. 
      Minimum price: ${crop.min_price}. 
      Maximum price: ${crop.max_price}. 
      Modal price: ${crop.modal_price} per ${crop.unit}.
    `;
    speak(textToSpeak);
  };

  const getPriceChange = () => {
    if (!crop.previous_modal_price) return { change: 0, percentage: '0.00' };
    const change = crop.modal_price - crop.previous_modal_price;
    const percentage = ((change / crop.previous_modal_price) * 100).toFixed(2);
    return { change, percentage };
  };

  const { change, percentage } = getPriceChange();

  const PriceChangeIndicator = () => {
    if (change > 0) {
      return <span className="flex items-center text-xs text-emerald-400 font-mono"><ArrowUp size={14} className="mr-1" /> +{percentage}%</span>;
    }
    if (change < 0) {
      return <span className="flex items-center text-xs text-red-400 font-mono"><ArrowDown size={14} className="mr-1" /> {percentage}%</span>;
    }
    return <span className="flex items-center text-xs text-[var(--color-text-secondary)] font-mono"><Minus size={14} className="mr-1" /> 0.00%</span>;
  };

  return (
    <div onClick={onClick} className="glassmorphism p-6 flex flex-col h-full hover:border-[var(--color-neon-blue)] transition-all duration-300 cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-white font-display group-hover:text-[var(--color-neon-cyan)] transition-colors">{crop.crop}</h3>
        <button onClick={handleSpeak} className="text-[var(--color-text-secondary)] hover:text-[var(--color-neon-blue)] transition-colors">
          <Volume2 size={20} />
        </button>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">{crop.market}, {crop.state}</p>
      
      <div className="grid grid-cols-3 gap-2 text-center mb-4 text-xs">
        <div className="bg-white/5 p-2 rounded-lg">
          <p className="font-mono text-[var(--color-text-secondary)] uppercase tracking-tighter mb-1">Min</p>
          <p className="text-white">₹{crop.min_price}</p>
        </div>
        <div className="bg-white/5 p-2 rounded-lg">
          <p className="font-mono text-[var(--color-text-secondary)] uppercase tracking-tighter mb-1">Max</p>
          <p className="text-white">₹{crop.max_price}</p>
        </div>
        <div className="bg-[var(--color-neon-blue)]/10 p-2 rounded-lg border border-[var(--color-neon-blue)]/20">
          <p className="font-mono text-[var(--color-neon-blue)] uppercase tracking-tighter mb-1">Modal</p>
          <p className="text-white font-bold">₹{crop.modal_price}</p>
        </div>
      </div>

      <div className="flex justify-center items-center my-2">
        <PriceChangeIndicator />
      </div>

      <p className="mt-auto text-[10px] text-center text-[var(--color-text-secondary)] uppercase font-mono tracking-widest">Price per {crop.unit}</p>
    </div>
  );
}
