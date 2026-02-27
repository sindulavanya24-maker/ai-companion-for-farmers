import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const Profile = () => {
  const [connections, setConnections] = useState({
    swiggy: false,
    zomato: false,
  });

  const handleConnect = (platform: 'swiggy' | 'zomato') => {
    // Simulate connection process
    setConnections(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              JS
            </div>
            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-[var(--color-bg-dark)]"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-display font-bold mb-2">Jai Shankar</h1>
            <p className="text-[var(--color-text-secondary)] font-mono mb-4">Organic Farmer | Agri-Entrepreneur</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Mail className="w-4 h-4" />
                <span>shankar.farm@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <MapPin className="w-4 h-4" />
                <span>Andhra Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marketing Connections */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glassmorphism p-6"
        >
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-[var(--color-neon-cyan)]" />
            Marketing Connections
          </h2>
          
          <div className="space-y-4">
            {/* Swiggy Connection */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#FC8019] flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div>
                  <h3 className="font-semibold">Swiggy Instamart</h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">Direct Farm-to-Table Supply</p>
                </div>
              </div>
              <button 
                onClick={() => handleConnect('swiggy')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  connections.swiggy 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-[var(--color-neon-blue)] text-white hover:opacity-80'
                }`}
              >
                {connections.swiggy ? 'Connected' : 'Connect'}
              </button>
            </div>

            {/* Zomato Connection */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#E23744] flex items-center justify-center text-white font-bold text-xl">
                  Z
                </div>
                <div>
                  <h3 className="font-semibold">Zomato Hyperpure</h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">B2B Supply for Restaurants</p>
                </div>
              </div>
              <button 
                onClick={() => handleConnect('zomato')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  connections.zomato 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-[var(--color-neon-blue)] text-white hover:opacity-80'
                }`}
              >
                {connections.zomato ? 'Connected' : 'Connect'}
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-xs text-blue-200">
              Connecting to these platforms allows you to list your fresh produce directly on their marketplaces, reaching thousands of customers instantly.
            </p>
          </div>
        </motion.div>

        {/* Account Stats */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glassmorphism p-6"
        >
          <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[var(--color-neon-purple)]" />
            Farm Verification
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Organic Certification</span>
              <span className="text-green-400 font-mono">Verified</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Soil Health Score</span>
              <span className="text-[var(--color-neon-cyan)] font-mono">8.5/10</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Active Listings</span>
              <span className="text-white font-mono">12</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Total Sales</span>
              <span className="text-white font-mono">₹45,200</span>
            </div>
          </div>

          <div className="mt-8">
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] text-white font-semibold shadow-lg hover:opacity-90 transition-opacity">
              Edit Profile
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
