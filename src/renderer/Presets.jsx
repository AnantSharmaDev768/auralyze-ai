import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Check, Music, Film, Gamepad2, Mic, 
  Sparkles, Activity, Search, Cpu, Target, 
  Headphones, Radio, Volume2
} from 'lucide-react';

const Presets = ({ onApply, isActive = true, engineState }) => {
  const [activeId, setActiveId] = useState(engineState?.activePreset || 'music');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const presets = [
    { 
      id: 'cinematic', name: 'Cinema Pro', description: 'Aggressive 7.1 Virtualization with LFE Sub-boost.',
      icon: <Film size={20} />, color: '#8B5CF6', category: 'cinematic', 
      mesh: [85, 75, 50, 40, 35, 45, 60, 85, 95, 80, 60, 40, 35, 45, 70, 90], // V-Shape
      dsp: { eq: "32 8; 250 -3; 1000 -4; 8000 5; 16000 9", width: 90 },
      tags: ['Spatial', 'IMAX'], xpReward: 50 
    },
    { 
      id: 'music', name: 'Hi-Fi Pure', description: 'Bit-perfect linear response for critical listening.',
      icon: <Music size={20} />, color: '#A855F7', category: 'music', 
      mesh: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50], // Flat
      dsp: { eq: "32 0; 1000 0; 16000 0", width: 25 },
      tags: ['Neutral', 'Studio'], xpReward: 30 
    },
    { 
      id: 'gaming', name: 'Spatial Pro', description: 'Tactical positional audio. High-frequency footstep boost.',
      icon: <Gamepad2 size={20} />, color: '#C084FC', category: 'gaming', 
      mesh: [30, 40, 60, 80, 95, 90, 70, 60, 50, 40, 45, 65, 85, 95, 80, 60], // Tactical Mid-High
      dsp: { eq: "32 -5; 1000 2; 4000 8; 12000 10", width: 75 },
      tags: ['Low Latency', 'Tactical'], xpReward: 75 
    },
    { 
      id: 'vocal', name: 'Voice Clarity', description: 'Neural speech isolation for podcasts and calls.',
      icon: <Mic size={20} />, color: '#D946EF', category: 'music', 
      mesh: [15, 20, 35, 70, 95, 98, 85, 60, 40, 30, 25, 20, 15, 10, 10, 10], // Mid-range focus
      dsp: { eq: "125 -10; 500 3; 2000 6; 8000 -5", width: 15 },
      tags: ['Neural', 'Clean'], xpReward: 40 
    },
    { 
      id: 'stadium', name: 'Live Arena', description: 'Massive diffusion matrix simulating stadium air.',
      icon: <Radio size={20} />, color: '#F472B6', category: 'cinematic', 
      mesh: [95, 85, 70, 50, 40, 55, 75, 90, 95, 85, 75, 60, 55, 70, 85, 95], // Wide Spread
      dsp: { eq: "32 10; 500 -2; 4000 4; 16000 12", width: 100 },
      tags: ['Atmospheric', 'Wide'], xpReward: 60 
    },
    { 
      id: 'midnight', name: 'Night Mode', description: 'Compressed dynamic range for low-volume richness.',
      icon: <Headphones size={20} />, color: '#6366F1', category: 'music', 
      mesh: [70, 65, 55, 45, 40, 40, 45, 55, 60, 65, 60, 55, 50, 55, 65, 70], // Compressed Warmth
      dsp: { eq: "32 6; 1000 -2; 16000 6", width: 40 },
      tags: ['Comfort', 'Warm'], xpReward: 45 
    }
  ];

  const categories = [
    { id: 'all', name: 'ALL ARCHETYPES' },
    { id: 'cinematic', name: 'MOVIES' },
    { id: 'gaming', name: 'GAMING' },
    { id: 'music', name: 'STUDIO' }
  ];

  const handleApply = (preset) => {
    if (!isActive) return;
    setActiveId(preset.id);
    if (window.zenith) {
        window.zenith.applyCustomEq(preset.dsp.eq);
        window.zenith.setSpatialWidth(preset.dsp.width);
    }
    if (onApply) onApply(preset.id);
  };

  const currentPreset = presets.find(p => p.id === activeId) || presets[1];
  const filteredPresets = presets.filter(p => 
    (selectedCategory === 'all' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.badge}><Sparkles size={12} /> <span>{isActive ? 'SIGNATURE LIBRARY ACTIVE' : 'ENGINE STANDBY'}</span></div>
        <h1 style={styles.title}>Signature <span style={styles.gradientText}>Library</span></h1>
      </header>

      {/* 📊 DETERMINISTIC STATIC MESH (Changes based on preset) */}
      <motion.div 
        animate={{ opacity: isActive ? 1 : 0.4 }}
        style={styles.spectrumBox}
      >
        <div style={styles.meshHeader}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
             <Activity size={16} color="#8B5CF6" />
             <span style={styles.meshTitle}>ACOUSTIC MESH: {currentPreset.name.toUpperCase()}</span>
          </div>
          <div style={styles.optimizedBadge}>DETERMINISTIC DSP</div>
        </div>
        <div style={styles.meshContainer}>
          {currentPreset.mesh.map((val, i) => (
            <motion.div 
              key={`${activeId}-${i}`}
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: i * 0.02 }}
              style={{ ...styles.bar, background: `linear-gradient(to top, ${currentPreset.color}, transparent)` }} 
            />
          ))}
        </div>
      </motion.div>

      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <Search size={16} color="#475569" />
          <input 
            placeholder="Search signatures..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={styles.searchInput}
          />
        </div>
        <div style={styles.categoryRack}>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                ...styles.catBtn,
                background: selectedCategory === cat.id ? 'rgba(139,92,246,0.15)' : 'transparent',
                borderColor: selectedCategory === cat.id ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
                color: selectedCategory === cat.id ? '#fff' : '#475569'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 🌑 WRAPPER FOR DIMMING CARDS */}
      <motion.div 
        animate={{ opacity: isActive ? 1 : 0.5, filter: isActive ? 'none' : 'grayscale(100%)' }}
        transition={{ duration: 0.4 }}
        style={styles.grid}
      >
        <AnimatePresence mode="popLayout">
          {filteredPresets.map((preset) => (
            <motion.div
              key={preset.id}
              layout
              onClick={() => handleApply(preset)}
              whileHover={isActive ? { y: -8, scale: 1.02 } : {}}
              style={{
                ...styles.card,
                border: activeId === preset.id ? `1px solid ${preset.color}` : '1px solid rgba(255,255,255,0.03)',
                background: activeId === preset.id ? `${preset.color}08` : '#12161F',
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            >
              <div style={styles.cardTop}>
                <div style={{...styles.iconBox, background: `${preset.color}15`, color: preset.color}}>
                  {preset.icon}
                </div>
                <div style={styles.xpBadge}>+{preset.xpReward} XP</div>
              </div>
              <h3 style={styles.presetName}>{preset.name}</h3>
              <p style={styles.presetDesc}>{preset.description}</p>
              
              <div style={styles.cardFooter}>
                 <div style={styles.tagGroup}>
                    {preset.tags.map(t => <span key={t} style={styles.tag}>#{t}</span>)}
                 </div>
                <div style={{...styles.playBtn, background: preset.color}}>
                  {activeId === preset.id ? <Check size={14} strokeWidth={4} /> : <Play size={14} fill="white" />}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const styles = {
  container: { padding: '30px', background: '#0B0E14', height: '100vh', overflowY: 'auto' },
  header: { marginBottom: '30px' },
  badge: { display: 'inline-flex', gap: '8px', background: 'rgba(139,92,246,0.1)', padding: '6px 16px', borderRadius: '40px', fontSize: '0.6rem', color: '#8B5CF6', fontWeight: '900', letterSpacing: '1px', marginBottom: '12px' },
  title: { fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-2px' },
  gradientText: { background: 'linear-gradient(135deg, #fff 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  spectrumBox: { background: 'rgba(18,22,31,0.5)', padding: '28px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '30px' },
  meshHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' },
  meshTitle: { fontSize: '0.65rem', color: '#475569', fontWeight: '900', letterSpacing: '2px' },
  optimizedBadge: { background: '#10B98115', color: '#10B981', fontSize: '0.55rem', padding: '4px 12px', borderRadius: '20px', fontWeight: '900' },
  meshContainer: { display: 'flex', alignItems: 'flex-end', gap: '5px', height: '80px' },
  bar: { flex: 1, borderRadius: '4px 4px 0 0', opacity: 0.6 },
  searchSection: { display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' },
  searchBar: { flex: 1, background: '#12161F', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
  searchInput: { background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.85rem', fontWeight: 'bold' },
  categoryRack: { display: 'flex', gap: '10px' },
  catBtn: { padding: '10px 22px', borderRadius: '14px', border: '1px solid', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer', transition: '0.3s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px', paddingBottom: '120px' },
  card: { padding: '28px', borderRadius: '32px', cursor: 'pointer', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  iconBox: { width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  xpBadge: { fontSize: '0.6rem', color: '#F59E0B', fontWeight: '900' },
  presetName: { fontSize: '1.3rem', fontWeight: '900', color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' },
  presetDesc: { fontSize: '0.8rem', color: '#475569', margin: '0 0 25px', lineHeight: '1.5', fontWeight: '700' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tagGroup: { display: 'flex', gap: '6px' },
  tag: { fontSize: '0.6rem', color: '#475569', fontWeight: '900' },
  playBtn: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }
};

export default Presets;