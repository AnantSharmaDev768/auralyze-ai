import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Activity, Mic, Radio, 
  Zap, Music, Waves, Cpu, 
  Save, Trash2, X, Power, Target
} from 'lucide-react';

const ManualMode = ({ isActive = true, engineState, onUpdate }) => {
  const [draggingNode, setDraggingNode] = useState(null);
  const [fftData, setFftData] = useState(Array(128).fill(0));
  const [customPresets, setCustomPresets] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const svgRef = useRef(null);
  
  const frequencies = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
  const freqValues = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  
  // FIXED SCALING
  const [dimensions, setDimensions] = useState({ width: 800, height: 320 });
  const centerY = dimensions.height / 2;

  // 🛡️ CRITICAL FIX: Ensure gains are always numbers to stop NaN and static
  const safeGains = useMemo(() => {
    if (!engineState?.gains || !Array.isArray(engineState.gains)) {
      return Array(10).fill(0);
    }
    return engineState.gains.map(g => (typeof g === 'number' && !isNaN(g)) ? g : 0);
  }, [engineState?.gains]);

  const stepX = dimensions.width / (safeGains.length - 1);

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current && svgRef.current.parentElement) {
        const parent = svgRef.current.parentElement;
        const { width } = parent.getBoundingClientRect();
        setDimensions({ width: Math.max(600, width - 20), height: 320 });
      }
    };
    window.addEventListener('resize', updateSize);
    setTimeout(updateSize, 100);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // ==================== 🛰️ THE SURGICAL BRIDGE - STABILIZED ====================
  const applyEQToHardware = useCallback((gains, effects) => {
    // 🛡️ Logic Shield: Prevent bad data from entering the DSP
    if (!gains || !Array.isArray(gains)) return;
    
    let finalGains = gains.map(g => (typeof g === 'number' && !isNaN(g)) ? g : 0);
    
    // Apply master effects to EQ bands (Keeping your exact logic)
    const clarity = effects?.clarity || 0;
    const ambience = effects?.ambience || 0;
    const bassBoost = effects?.bassBoost || 0;
    const dynamicBoost = effects?.dynamicBoost || 0;

    finalGains[7] += (clarity * 1.5); 
    finalGains[8] += (clarity * 2.5); 
    finalGains[9] += (ambience * 3.0);
    finalGains[4] -= (ambience * 0.8);
    finalGains[0] += (bassBoost * 2.8);
    finalGains[1] += (bassBoost * 1.8);
    finalGains = finalGains.map(g => g + (dynamicBoost * 0.2));

    const clampedGains = finalGains.map(g => Math.min(20, Math.max(-15, g)));
    const eqString = clampedGains.map((g, i) => `${freqValues[i]} ${g.toFixed(1)}`).join('; ');
    
    // Direct hardware push
    if (window.zenith) {
      window.zenith.applyCustomEq?.(eqString);
      window.zenith.setSpatialWidth?.((effects?.surround || 0) * 28);
      window.zenith.applyCompression?.(dynamicBoost * 1.8);
    }
    
    console.log('[ManualMode] EQ Applied:', eqString.substring(0, 100));
  }, [freqValues]);

  // Apply EQ whenever gains or effects change
  useEffect(() => {
    if (isActive && engineState) {
      applyEQToHardware(safeGains, engineState.effects);
    }
  }, [safeGains, engineState?.effects, isActive, applyEQToHardware]);

  // ==================== 🖱️ UI STATE HANDLERS ====================
  const handleManualGainChange = (index, val) => {
    const newGains = [...safeGains];
    newGains[index] = val;
    onUpdate({ gains: newGains });
  };

  const handleEffectSlider = (id, val) => {
    const newEffects = { ...engineState.effects, [id]: parseInt(val) };
    onUpdate({ effects: newEffects });
  };

  const handleMouseMove = (e) => {
    if (draggingNode === null || !svgRef.current || !isActive) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleY = dimensions.height / rect.height;
    let mouseY = (e.clientY - rect.top) * scaleY;
    const newGain = Math.max(-12, Math.min(12, Math.round(((centerY - mouseY) / 12) * 2) / 2));
    handleManualGainChange(draggingNode, newGain);
  };

  // ==================== 🛰️ LIVE SIGNAL BRIDGE ====================
  useEffect(() => {
    const handleAudio = (event, data) => { if (data && Array.isArray(data)) setFftData(data); };
    window.ipcRenderer?.on('audio-data', handleAudio);
    return () => window.ipcRenderer?.removeListener('audio-data', handleAudio);
  }, []);

  const getCubicBezierPoints = useMemo(() => {
    const points = safeGains.map((g, i) => ({ x: i * stepX, y: centerY - (g * 12) }));
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]; const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) * 0.45;
      const cp2x = p1.x - (p1.x - p0.x) * 0.45;
      path += ` C ${cp1x} ${p0.y}, ${cp2x} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [safeGains, stepX, centerY]);

  // Load Presets
  useEffect(() => {
    const saved = localStorage.getItem('zenith_custom_presets');
    if (saved) setCustomPresets(JSON.parse(saved));
  }, []);

  const saveCurrentPreset = () => {
    if (!newPresetName.trim()) return;
    const preset = { 
      id: Date.now(), 
      name: newPresetName, 
      gains: [...safeGains], 
      effects: { ...engineState.effects } 
    };
    const updated = [preset, ...customPresets];
    localStorage.setItem('zenith_custom_presets', JSON.stringify(updated));
    setCustomPresets(updated);
    setNewPresetName("");
    setIsSaving(false);
  };

  const loadPreset = (preset) => {
    onUpdate({ gains: preset.gains, effects: preset.effects });
  };

  const deletePreset = (id, e) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    localStorage.setItem('zenith_custom_presets', JSON.stringify(updated));
    setCustomPresets(updated);
  };

  const resetAll = () => {
    onUpdate({ 
      gains: Array(10).fill(0), 
      effects: { clarity: 0, ambience: 0, surround: 0, dynamicBoost: 0, bassBoost: 0 } 
    });
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        filter: isActive ? 'grayscale(0%) brightness(100%)' : 'grayscale(100%) brightness(40%)',
        opacity: isActive ? 1 : 0.7
      }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      style={styles.container} 
      onMouseMove={handleMouseMove} 
      onMouseUp={() => setDraggingNode(null)}
    >
      <header style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <motion.div 
            animate={{ boxShadow: isActive ? '0 0 30px rgba(139,92,246,0.4)' : '0 0 0px transparent' }}
            style={styles.badge}
          >
            <Cpu size={16} color={isActive ? "#8B5CF6" : "#475569"} /> 
            <span style={{letterSpacing: '2px'}}>NEURAL ENGINE CORE v4.0</span>
          </motion.div>
          <h1 style={styles.title}>Studio Lab</h1>
          <p style={styles.subtitle}>Surgical Intelligence — Reference Grade DSP Infrastructure</p>
        </div>
        <div style={styles.headerAction}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsSaving(true)} style={styles.saveBtn} disabled={!isActive}>
            <Save size={18} /> <span>SAVE SIGNATURE</span>
          </motion.button>
          <button onClick={resetAll} style={styles.resetBtn}>
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      {/* Custom Presets Row */}
      {customPresets.length > 0 && (
        <div style={styles.presetsRow}>
          {customPresets.map(preset => (
            <div key={preset.id} onClick={() => loadPreset(preset)} style={styles.presetChip}>
              <Music size={12} color="#8B5CF6" />
              <span>{preset.name}</span>
              <X size={10} style={styles.deleteIcon} onClick={(e) => deletePreset(preset.id, e)} />
            </div>
          ))}
        </div>
      )}

      <div style={styles.mainLayout}>
        <section style={{...styles.fxRack, border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.05)'}}>
          <h2 style={styles.sectionHeader}>NEURAL EFFECTS RACK</h2>
          {[
            { id: 'clarity', name: 'Clarity', icon: <Target size={20}/>, color: '#C084FC', glow: 'rgba(192,132,252,0.4)' },
            { id: 'ambience', name: 'Ambience', icon: <Radio size={20}/>, color: '#D946EF', glow: 'rgba(217,70,239,0.4)' },
            { id: 'surround', name: 'Surround', icon: <Waves size={20}/>, color: '#A855F7', glow: 'rgba(168,85,247,0.4)' },
            { id: 'dynamicBoost', name: 'Dynamic', icon: <Zap size={20}/>, color: '#F0ABFC', glow: 'rgba(240,171,252,0.4)' },
            { id: 'bassBoost', name: 'Bass Boost', icon: <Music size={20}/>, color: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' }
          ].map(fx => (
            <div key={fx.id} style={styles.fxCard}>
              <div style={styles.fxLabelGroup}>
                <div style={{...styles.fxIconBox, color: isActive ? fx.color : '#475569', boxShadow: isActive ? `0 0 12px ${fx.glow}` : 'none'}}>{fx.icon}</div>
                <span style={styles.fxName}>{fx.name.toUpperCase()}</span>
                <span style={{...styles.fxValue, color: isActive ? fx.color : '#475569'}}>{engineState.effects[fx.id]}</span>
              </div>
              <input 
                type="range" min="0" max="10" 
                disabled={!isActive}
                value={engineState.effects[fx.id]} 
                onChange={(e) => handleEffectSlider(fx.id, e.target.value)} 
                style={{...styles.fxSlider, '--accent': fx.color}} 
              />
            </div>
          ))}
        </section>

        <section style={{...styles.eqMeshPanel, border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.05)'}}>
          <div style={styles.meshHeader}>
            <div style={styles.meshStatus}><Activity size={18} color={isActive ? "#8B5CF6" : "#475569"} /><span>SYSTEM FREQUENCY MESH (REAL-TIME)</span></div>
            <div style={{...styles.optimizedBadge, background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent', color: isActive ? '#10B981' : '#475569'}}>SURGICAL ACTIVE</div>
          </div>

          <div style={styles.svgContainer}>
            <svg ref={svgRef} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} style={styles.svg}>
              <defs>
                <linearGradient id="splineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={isActive ? "0.3" : "0"} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
                <filter id="neon"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <line x1="0" y1={centerY} x2={dimensions.width} y2={centerY} stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
              
              {fftData.map((val, i) => ( 
                <rect key={i} x={(i * dimensions.width) / fftData.length} y={dimensions.height - (val / 255) * 280} width={(dimensions.width / fftData.length) - 1} height={(val / 255) * 280} fill={isActive ? "rgba(139, 92, 246, 0.05)" : "rgba(255,255,255,0.01)"} /> 
              ))}

              <path d={`M 0,${dimensions.height} ${getCubicBezierPoints} L ${dimensions.width},${dimensions.height} Z`} fill="url(#splineGrad)" />
              <path d={getCubicBezierPoints} fill="none" stroke={isActive ? "#8B5CF6" : "#1E293B"} strokeWidth="4" filter={isActive ? "url(#neon)" : "none"} strokeLinecap="round" />

              {safeGains.map((g, i) => (
                <g key={i} onMouseDown={(e) => { if(isActive) { e.stopPropagation(); setDraggingNode(i); } }} style={{cursor: isActive ? 'pointer' : 'default'}}>
                  <circle cx={i * stepX} cy={centerY - (g * 12)} r="18" fill="transparent" />
                  <motion.circle animate={{ r: isActive ? [7, 11, 7] : 7 }} transition={{ repeat: Infinity, duration: 3 }} cx={i * stepX} cy={centerY - (g * 12)} r="8" fill="none" stroke="#8B5CF6" strokeWidth="2" opacity={isActive ? 0.6 : 0} />
                  <circle cx={i * stepX} cy={centerY - (g * 12)} r="5" fill={isActive ? "#FFFFFF" : "#334155"} />
                </g>
              ))}
            </svg>
          </div>

          <div style={styles.dialRack}>
            {safeGains.map((g, i) => (
              <div key={i} style={styles.dialItem}>
                <div style={{...styles.dialBox, background: isActive ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.02)', border: isActive ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent'}}>
                  <span style={{...styles.dialValText, color: isActive ? '#fff' : '#475569'}}>{g > 0 ? `+${g}` : g}</span>
                </div>
                <span style={styles.dialLabel}>{frequencies[i]}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Save Modal */}
      <AnimatePresence>
        {isSaving && (
          <div style={styles.modalOverlay} onClick={() => setIsSaving(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3 style={styles.modalTitle}>Save Custom Preset</h3>
              <input type="text" placeholder="Enter preset name..." value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} style={styles.modalInput} autoFocus />
              <div style={styles.modalActions}>
                <button onClick={() => setIsSaving(false)} style={styles.modalCancel}>Cancel</button>
                <button onClick={saveCurrentPreset} style={styles.modalConfirm}>Save Preset</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        input[type="range"] { -webkit-appearance: none; background: transparent; }
        input[type="range"]::-webkit-slider-runnable-track { height: 4px; background: rgba(255,255,255,0.05); border-radius: 4px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #8B5CF6; cursor: pointer; border: 2px solid #0B0E14; margin-top: -4px; }
      `}</style>
    </motion.div>
  );
};

// ... Styles remain exactly the same
const styles = {
  container: { padding: '24px 32px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: '24px', overflow: 'auto', background: '#0B0E14' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' },
  headerTitleGroup: { display: 'flex', flexDirection: 'column' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.08)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.65rem', color: '#8B5CF6', fontWeight: '700', border: '1px solid rgba(139,92,246,0.2)', width: 'fit-content' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#fff', margin: '8px 0 0 0', letterSpacing: '-0.05em' },
  subtitle: { color: '#64748B', fontSize: '0.75rem', fontWeight: '500' },
  headerAction: { display: 'flex', gap: '12px' },
  saveBtn: { background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', border: 'none', padding: '10px 24px', borderRadius: '14px', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' },
  resetBtn: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '14px', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  presetsRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  presetChip: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.08)', padding: '6px 14px', borderRadius: '30px', cursor: 'pointer', fontSize: '0.7rem', color: '#F8FAFC', border: '1px solid rgba(139,92,246,0.15)' },
  deleteIcon: { marginLeft: '4px', opacity: 0.6, cursor: 'pointer', transition: '0.2s', '&:hover': { opacity: 1, color: '#EF4444' } },
  mainLayout: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', flex: 1, minHeight: 0 },
  fxRack: { background: 'rgba(18,22,31,0.4)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'auto' },
  sectionHeader: { fontSize: '0.65rem', fontWeight: '700', color: '#475569', letterSpacing: '2px', marginBottom: '0' },
  fxCard: { display: 'flex', flexDirection: 'column', gap: '12px' },
  fxLabelGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  fxIconBox: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fxName: { flex: 1, fontSize: '0.85rem', fontWeight: '700', color: '#F8FAFC', letterSpacing: '0.5px' },
  fxValue: { fontSize: '0.9rem', fontWeight: '700' },
  fxSlider: { width: '100%', height: '4px', WebkitAppearance: 'none', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', outline: 'none' },
  eqMeshPanel: { background: 'rgba(18,22,31,0.4)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 },
  meshHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  meshStatus: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem', fontWeight: '700', color: '#94A3B8' },
  optimizedBadge: { fontSize: '0.6rem', padding: '4px 12px', borderRadius: '30px', fontWeight: '700', border: '1px solid currentColor' },
  svgContainer: { position: 'relative', width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '16px', flex: 1, marginBottom: '20px', minHeight: '280px' },
  svg: { width: '100%', height: '100%', overflow: 'visible' },
  dialRack: { display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' },
  dialItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '55px' },
  dialBox: { padding: '6px 12px', borderRadius: '12px', minWidth: '50px', textAlign: 'center' },
  dialValText: { fontSize: '0.9rem', fontWeight: '800', fontFamily: 'monospace' },
  dialLabel: { fontSize: '0.6rem', color: '#475569', fontWeight: '600' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#1E293B', borderRadius: '20px', padding: '28px', width: '340px', border: '1px solid rgba(139,92,246,0.2)' },
  modalTitle: { fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#F8FAFC' },
  modalInput: { width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', color: '#F8FAFC', fontSize: '0.8rem', outline: 'none', marginBottom: '20px' },
  modalActions: { display: 'flex', gap: '12px' },
  modalCancel: { flex: 1, padding: '10px', background: 'transparent', border: '1px solid #64748B', borderRadius: '10px', color: '#F8FAFC', cursor: 'pointer' },
  modalConfirm: { flex: 1, padding: '10px', background: '#8B5CF6', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }
};

export default ManualMode;