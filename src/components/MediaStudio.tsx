import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Video, Sparkles, Download, Loader2, Play, AlertCircle, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function MediaStudio() {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const generateMedia = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedMedia(null);

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      if (mediaType === 'image') {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `Agricultural scene: ${prompt}` }] },
          config: { imageConfig: { aspectRatio: "16:9" } }
        });

        const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          setGeneratedMedia({
            url: `data:image/png;base64,${imagePart.inlineData.data}`,
            type: 'image'
          });
        } else {
          throw new Error('No image generated');
        }
      } else {
        // Video generation with Veo
        if (!hasApiKey) {
          setError('Please select a paid API key for video generation.');
          setIsGenerating(false);
          return;
        }

        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: `Agricultural cinematic video: ${prompt}`,
          config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
          const videoResponse = await fetch(downloadLink, {
            method: 'GET',
            headers: { 'x-goog-api-key': process.env.API_KEY || '' },
          });
          const blob = await videoResponse.blob();
          setGeneratedMedia({
            url: URL.createObjectURL(blob),
            type: 'video'
          });
        } else {
          throw new Error('No video generated');
        }
      }
    } catch (err: any) {
      console.error('Media generation error:', err);
      if (err.message?.includes('Requested entity was not found')) {
        setHasApiKey(false);
        setError('API key error. Please re-select your key.');
      } else {
        setError('Failed to generate media. Please try a different prompt.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-bold font-display text-white">AI Media Studio</h2>
          <p className="text-[var(--color-text-secondary)]">Generate high-quality agricultural visuals and videos.</p>
        </div>
        {!hasApiKey && mediaType === 'video' && (
          <button 
            onClick={handleOpenKeySelector}
            className="flex items-center space-x-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full border border-amber-500/30 hover:bg-amber-500/30 transition-all"
          >
            <Key size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Select Video API Key</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="glassmorphism p-6 space-y-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button 
                onClick={() => setMediaType('image')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${mediaType === 'image' ? 'bg-[var(--color-neon-blue)] text-white' : 'text-white/40 hover:text-white'}`}
              >
                <ImageIcon size={18} />
                <span className="text-sm font-bold">Photo</span>
              </button>
              <button 
                onClick={() => setMediaType('video')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${mediaType === 'video' ? 'bg-[var(--color-neon-purple)] text-white' : 'text-white/40 hover:text-white'}`}
              >
                <Video size={18} />
                <span className="text-sm font-bold">Video</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-white/40 uppercase tracking-widest">Visual Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mediaType === 'image' ? "e.g., A lush organic farm with a modern irrigation system at sunset..." : "e.g., A cinematic drone shot of a golden wheat field during harvest..."}
                className="w-full h-32 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-[var(--color-neon-blue)] transition-all resize-none"
              />
            </div>

            <button 
              onClick={generateMedia}
              disabled={isGenerating || !prompt}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all shadow-lg ${mediaType === 'image' ? 'bg-[var(--color-neon-blue)] shadow-blue-500/20' : 'bg-[var(--color-neon-purple)] shadow-purple-500/20'} disabled:opacity-50`}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              <span>{isGenerating ? 'Generating...' : `Generate ${mediaType === 'image' ? 'Photo' : 'Video'}`}</span>
            </button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
                <AlertCircle className="text-red-400 shrink-0" size={18} />
                <p className="text-xs text-red-400 leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          <div className="glassmorphism p-6 border-l-4 border-emerald-400">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Pro Tip</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Use descriptive words like "cinematic", "photorealistic", or "macro" to get better results from the AI.
            </p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
          <div className="glassmorphism h-full min-h-[400px] flex items-center justify-center relative overflow-hidden group">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[var(--color-neon-blue)]/20 border-t-[var(--color-neon-blue)] rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--color-neon-blue)]" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">Crafting your visual...</p>
                    <p className="text-xs text-white/40 mt-1">This may take up to {mediaType === 'video' ? '2 minutes' : '30 seconds'}</p>
                  </div>
                </motion.div>
              ) : generatedMedia ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full flex flex-col"
                >
                  <div className="flex-grow flex items-center justify-center p-4">
                    {generatedMedia.type === 'image' ? (
                      <img 
                        src={generatedMedia.url} 
                        alt="Generated" 
                        className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <video 
                        src={generatedMedia.url} 
                        controls 
                        autoPlay 
                        loop 
                        className="max-w-full max-h-full rounded-2xl shadow-2xl"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-6 right-6 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={generatedMedia.url} 
                      download={`agri-${mediaType}-${Date.now()}`}
                      className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4 opacity-20"
                >
                  {mediaType === 'image' ? <ImageIcon size={64} className="mx-auto" /> : <Video size={64} className="mx-auto" />}
                  <p className="text-sm font-medium">Your generated media will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-neon-blue)]/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--color-neon-purple)]/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Visual Inspiration</h3>
          <p className="text-xs text-white/40 uppercase font-mono tracking-widest">Animated Gallery</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { seed: 'farm', label: 'Sustainable Farming' },
            { seed: 'crops', label: 'Harvest Quality' },
            { seed: 'greenhouse', label: 'Smart Greenhouse' },
            { seed: 'soil', label: 'Soil Health' }
          ].map((item, i) => (
            <motion.div 
              key={item.seed}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img 
                src={`https://picsum.photos/seed/${item.seed}/800/450`} 
                alt={item.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-xs font-bold text-white">{item.label}</p>
              </div>
              <div className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={12} className="text-white fill-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
