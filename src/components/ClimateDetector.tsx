import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Sparkles, Wind, Droplets, Thermometer, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ClimateDetector() {
  const { t } = useTranslation();
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyWeatherData | null>(null);
  const [earthquakes, setEarthquakes] = useState<EarthquakeData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<string[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const fetchEarthquakeData = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${latitude}&longitude=${longitude}&maxradiuskm=500&minmagnitude=2.5`);
      if (!response.ok) throw new Error('Failed to fetch earthquake data');
      const data = await response.json();
      const formattedQuakes = data.features.slice(0, 3).map((f: any) => ({
        id: f.id,
        mag: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        tsunami: f.properties.tsunami
      }));
      setEarthquakes(formattedQuakes);
    } catch (err) {
      console.error("Earthquake Fetch Error:", err);
    }
  };

  const fetchWeatherData = async (latitude: number, longitude: number, locationName?: string) => {
    setError(null);
    setCurrentWeather(null);
    setDailyForecast(null);
    setAiAdvice(null);
    setLiveUpdates([]);
    setEarthquakes([]);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
      if (!response.ok) throw new Error('Failed to fetch weather data.');
      const data = await response.json();
      setCurrentWeather(data.current_weather);
      setDailyForecast(data.daily);
      fetchEarthquakeData(latitude, longitude);
    } catch (err) {
      setError('Could not fetch weather data.');
      console.error(err);
    }
  };

  const generateLiveUpdate = async () => {
    if (!currentWeather) return;
    setLiveLoading(true);
    try {
      const { chatWithAI } = await import('../services/geminiService');
      const prompt = `
        As a real-time agricultural climate and geological monitor, provide a single, short, punchy "live update" sentence (max 15 words) based on these conditions:
        - Temperature: ${currentWeather.temperature}°C
        - Wind: ${currentWeather.windspeed} km/h
        ${earthquakes.length > 0 ? `- Recent Seismic Activity: ${earthquakes[0].mag} mag near ${earthquakes[0].place}` : ''}
        
        The update should sound like a live news flash for farmers. Include geological warnings if relevant.
      `;

      const response = await chatWithAI(prompt, []);
      const newUpdate = response?.trim() || "Monitoring climate conditions...";
      setLiveUpdates(prev => [newUpdate, ...prev].slice(0, 5));
    } catch (err) {
      console.error("Live Update Error:", err);
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    if (currentWeather) {
      generateLiveUpdate();
    }
  }, [currentWeather, earthquakes]);

  useEffect(() => {
    if (selectedLocation) {
      fetchWeatherData(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeatherData(position.coords.latitude, position.coords.longitude);
      }, () => {
        setError('Geolocation permission denied. Please enter a location.');
      });
    } else {
      setError('Geolocation is not supported by this browser. Please enter a location.');
    }
  }, [selectedLocation]);

  const handleLocationSearch = async () => {
    if (!locationInput) return;
    setLocationLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locationInput}&count=1&language=en&format=json`);
      if (!response.ok) throw new Error('Failed to fetch location data.');
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { latitude, longitude, name } = data.results[0];
        setSelectedLocation({ latitude, longitude, name });
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      setError('Could not search for location.');
      console.error(err);
    } finally {
      setLocationLoading(false);
    }
  };

  const getAiAdvice = async () => {
    if (!currentWeather || !dailyForecast) return;
    setAiLoading(true);
    try {
      const { chatWithAI } = await import('../services/geminiService');
      const prompt = `
        As an agricultural climate and geological hazard expert, analyze the following data for a farmer and provide concise, actionable advice.
        
        Current Weather:
        - Temperature: ${currentWeather.temperature}°C
        - Wind Speed: ${currentWeather.windspeed} km/h
        
        7-Day Forecast (Max/Min Temps):
        ${dailyForecast.time.map((t, i) => `${t}: ${dailyForecast.temperature_2m_max[i]}°C / ${dailyForecast.temperature_2m_min[i]}°C`).join('\n')}
        
        Recent Geological Activity (within 500km):
        ${earthquakes.length > 0 ? earthquakes.map(q => `- Mag ${q.mag} at ${q.place} (${new Date(q.time).toLocaleDateString()}) ${q.tsunami ? '[TSUNAMI WARNING]' : ''}`).join('\n') : 'No significant activity detected.'}

        Please identify:
        1. Immediate risks (frost, heat stress, high winds, seismic/tsunami threats).
        2. Best activities for the next 3 days (planting, harvesting, spraying, irrigation, safety measures).
        3. Crop Suitability: Based on the current temperature and upcoming forecast, which specific crops are most suitable to be planted or maintained right now?
        4. Any long-term climate or geological trends or warnings based on this data.
        
        Keep the response professional, encouraging, and easy to read. Use markdown.
      `;

      const response = await chatWithAI(prompt, []);
      setAiAdvice(response || "No advice available at this time.");
    } catch (err) {
      console.error("AI Advice Error:", err);
      setAiAdvice("Failed to get AI advice. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  const getWeatherDescription = (code: number) => {
    switch (code) {
      case 0: return 'Clear sky';
      case 1: case 2: case 3: return 'Mainly clear, partly cloudy, and overcast';
      case 45: case 48: return 'Fog and depositing rime fog';
      case 51: case 53: case 55: return 'Drizzle: Light, moderate, and dense intensity';
      case 56: case 57: return 'Freezing Drizzle: Light and dense intensity';
      case 61: case 63: case 65: return 'Rain: Slight, moderate and heavy intensity';
      case 66: case 67: return 'Freezing Rain: Light and heavy intensity';
      case 71: case 73: case 75: return 'Snow fall: Slight, moderate, and heavy intensity';
      case 77: return 'Snow grains';
      case 80: case 81: case 82: return 'Rain showers: Slight, moderate, and violent';
      case 85: case 86: return 'Snow showers: Slight and heavy';
      case 95: return 'Thunderstorm: Slight or moderate';
      case 96: case 99: return 'Thunderstorm with slight and heavy hail';
      default: return 'N/A';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold font-display text-white">{t('climate_detector')}</h2>
          <p className="text-[var(--color-text-secondary)]">Real-time climate monitoring and geological risk assessment.</p>
        </div>
        <div className="flex w-full md:w-auto space-x-2">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder={t('enter_location')}
            className="flex-grow md:w-64 p-3 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-white rounded-xl focus:outline-none focus:border-[var(--color-neon-blue)]"
          />
          <button
            onClick={handleLocationSearch}
            disabled={!locationInput || locationLoading}
            className="bg-[var(--color-neon-blue)] text-white p-3 rounded-xl hover:bg-[var(--color-neon-purple)] transition-all disabled:opacity-50"
          >
            {locationLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl text-red-400 flex items-center"
        >
          <AlertTriangle className="mr-3" size={20} />
          {error}
        </motion.div>
      )}
      
      {liveUpdates.length > 0 && (
        <div className="overflow-hidden bg-[var(--color-neon-cyan)]/5 border-y border-[var(--color-neon-cyan)]/20 py-2">
          <div className="flex items-center whitespace-nowrap animate-marquee">
            {liveUpdates.map((update, i) => (
              <span key={i} className="mx-8 text-xs font-mono text-[var(--color-neon-cyan)] flex items-center">
                <span className="w-2 h-2 bg-[var(--color-neon-cyan)] rounded-full mr-2 animate-pulse" />
                {update}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Current Weather & Forecast */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glassmorphism p-8 flex flex-col items-center justify-center text-center border-l-4 border-[var(--color-neon-cyan)]"
            >
              <p className="text-xs font-mono text-[var(--color-text-secondary)] uppercase tracking-widest mb-4">Current Temperature</p>
              {currentWeather ? (
                <>
                  <div className="relative">
                    <Thermometer className="absolute -left-12 top-1/2 -translate-y-1/2 text-[var(--color-neon-cyan)] opacity-20" size={64} />
                    <h3 className="text-7xl font-bold font-display text-white">{currentWeather.temperature}°</h3>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center text-[var(--color-text-secondary)] mb-1">
                        <Droplets size={14} className="mr-1" />
                        <span className="text-[10px] uppercase font-mono">Humidity</span>
                      </div>
                      <p className="text-xl font-bold text-white">{currentWeather.humidity}%</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center text-[var(--color-text-secondary)] mb-1">
                        <Wind size={14} className="mr-1" />
                        <span className="text-[10px] uppercase font-mono">Wind</span>
                      </div>
                      <p className="text-xl font-bold text-white">{currentWeather.windspeed} <span className="text-xs font-normal opacity-50">km/h</span></p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-pulse space-y-4">
                  <div className="h-16 w-32 bg-white/10 rounded-2xl mx-auto"></div>
                  <div className="h-8 w-48 bg-white/10 rounded-xl mx-auto"></div>
                </div>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glassmorphism p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <AlertTriangle size={18} className="mr-2 text-red-500" />
                Seismic Activity
              </h3>
              {earthquakes.length > 0 ? (
                <div className="space-y-4">
                  {earthquakes.map((q) => (
                    <div key={q.id} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-red-400">Mag {q.mag}</span>
                        <span className="text-[10px] font-mono text-white/40">{new Date(q.time).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-white/70 truncate">{q.place}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-8">
                  <Wind size={32} className="mb-2" />
                  <p className="text-xs">No recent seismic activity detected.</p>
                </div>
              )}
            </motion.div>
          </div>

          {dailyForecast && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glassmorphism p-6"
            >
              <h3 className="text-lg font-bold text-white mb-6">7-Day Outlook</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {dailyForecast.time.map((date, i) => (
                  <div key={date} className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-mono text-white/40 uppercase mb-2">
                      {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <div className="text-lg font-bold text-[var(--color-neon-cyan)] mb-1">
                      {dailyForecast.temperature_2m_max[i]}°
                    </div>
                    <div className="text-[10px] text-white/40 mb-3">
                      {dailyForecast.temperature_2m_min[i]}°
                    </div>
                    <div className="text-[8px] text-center text-white/60 leading-tight uppercase font-medium">
                      {getWeatherDescription(dailyForecast.weathercode[i]).split(',')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: AI Advisor */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glassmorphism p-8 bg-gradient-to-br from-[var(--color-neon-purple)]/10 to-transparent flex flex-col h-full border-t-4 border-[var(--color-neon-purple)]"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Sparkles className="h-6 w-6 text-[var(--color-neon-purple)] mr-3" />
              <h3 className="text-xl font-bold text-white">Climate Advisor</h3>
            </div>
            <button
              onClick={getAiAdvice}
              disabled={aiLoading || !currentWeather}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
            <AnimatePresence mode="wait">
              {aiAdvice ? (
                <motion.div 
                  key="advice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-invert prose-sm max-w-none"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAdvice}</ReactMarkdown>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-4 py-12"
                >
                  <Sparkles size={48} />
                  <p className="text-sm">Select a location to receive AI-powered climate and geological advice.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">Recommended Actions</h4>
            <div className="grid grid-cols-2 gap-3">
              {['Crop Insurance', 'Irrigation Subsidy', 'Disaster Relief', 'Green Credit'].map((action) => (
                <button key={action} className="p-3 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all group">
                  <p className="text-[10px] font-bold text-white group-hover:text-[var(--color-neon-purple)] transition-colors">{action}</p>
                  <p className="text-[8px] text-white/40 mt-1">Check eligibility</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface CurrentWeatherData {
  temperature: number;
  humidity: number;
  windspeed: number;
}

interface DailyWeatherData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

interface EarthquakeData {
  id: string;
  mag: number;
  place: string;
  time: number;
  tsunami: number;
}

function Loader2(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

