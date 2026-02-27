import { useState, useEffect } from 'react';
import marketData from '../data/market.json';
import CropPriceCard from './CropPriceCard';
import MarketForecaster from './MarketForecaster';
import PriceHistoryModal from './PriceHistoryModal';
import CameraScanner from './CameraScanner';
import { Camera } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

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

export default function Market() {
  const [cropPrices, setCropPrices] = useState<CropPrice[]>([]);
  const [filteredCropPrices, setFilteredCropPrices] = useState<CropPrice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [state, setState] = useState('All');
  const [market, setMarket] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState<CropPrice | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [identifyingCrop, setIdentifyingCrop] = useState(false);

  useEffect(() => {
    setCropPrices(marketData as CropPrice[]);
    setFilteredCropPrices(marketData as CropPrice[]);
  }, []);

  useEffect(() => {
    let result = cropPrices;

    if (searchTerm) {
      result = result.filter(crop => 
        crop.crop.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (state !== 'All') {
      result = result.filter(crop => crop.state === state);
    }

    if (market !== 'All') {
      result = result.filter(crop => crop.market === market);
    }

    setFilteredCropPrices(result);
  }, [searchTerm, state, market, cropPrices]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold font-display text-white">Market Prices</h1>
          <p className="text-[var(--color-text-secondary)]">Real-time agricultural commodity rates across India.</p>
        </div>
      </div>

      <MarketForecaster />
      
      {/* Search and Filters */}
      <div className="glassmorphism p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input 
            type="text"
            placeholder="Search by crop name..."
            className="w-full p-3 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-white rounded-xl placeholder-gray-500 focus:outline-none focus:border-[var(--color-neon-blue)] transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select value={state} onChange={e => setState(e.target.value)} className="w-full p-3 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-white rounded-xl focus:outline-none focus:border-[var(--color-neon-blue)] transition-all">
            <option value="All">All States</option>
            {[...new Set(cropPrices.map(c => c.state))].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={market} onChange={e => setMarket(e.target.value)} className="w-full p-3 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-white rounded-xl focus:outline-none focus:border-[var(--color-neon-blue)] transition-all">
            <option value="All">All Markets</option>
            {[...new Set(cropPrices.filter(c => state === 'All' || c.state === state).map(c => c.market))].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={() => setIsCameraOpen(true)} className="w-full p-3 bg-[var(--color-neon-purple)] text-white rounded-xl font-semibold hover:bg-[var(--color-neon-blue)] transition-all flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Camera size={20} className="mr-2" />
            {identifyingCrop ? 'Identifying...' : 'Scan Crop'}
          </button>
        </div>
      </div>

      {/* Crop Prices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCropPrices.map(crop => (
          <CropPriceCard key={crop.id} crop={crop} onClick={() => setSelectedCrop(crop)} />
        ))}
      </div>

      <PriceHistoryModal crop={selectedCrop} onClose={() => setSelectedCrop(null)} />

      {isCameraOpen && 
        <CameraScanner 
          onClose={() => setIsCameraOpen(false)} 
          onCropIdentified={async (imageDataUrl) => {
            setIsCameraOpen(false);
            setIdentifyingCrop(true);
            try {
              const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
              const imagePart = {
                inlineData: {
                  data: imageDataUrl.split(',')[1],
                  mimeType: 'image/jpeg'
                }
              };
              const result = await model.generateContent(['What crop is in this image? Respond with only the name of the crop.', imagePart]);
              const response = await result.response;
              const identifiedCrop = response.text().trim();
              setSearchTerm(identifiedCrop);
            } catch (error) {
              console.error('Crop identification error:', error);
              alert('Could not identify the crop. Please try again.');
            } finally {
              setIdentifyingCrop(false);
            }
          }}
        />
      }
    </div>
  );
}
