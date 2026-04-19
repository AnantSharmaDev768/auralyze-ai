import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, Volume2, VolumeX, Zap, Activity, 
  Shield, Target, Sparkles, Film, RotateCw, 
  Settings2, ChevronDown, Wind, Disc, Move
} from 'lucide-react';

const NeuralStage = () => {
  const [isEngaged, setIsEngaged] = useState(false);
  const [activePreset, setActivePreset] = useState('cinema');
  const [showManual, setShowManual] = useState(false);
  
  const [manualSettings, setManualSettings] = useState({
    expansion: 75,
    reverb: 40,
    bassFocus: 60,
    air: 50
  });

  const [speakers, setSpeakers] = useState([
    { id: 'C',   x: 0,    y: -220, active: true },
    { id: 'FL',  x: -140, y: -180, active: true },
    { id: 'FR',  x: 140,  y: -180, active: true },
    { id: 'SL',  x: -240, y: 0,    active: true },
    { id: 'SR',  x: 240,  y: 0,    active: true },
    { id: 'BL',  x: -140, y: 180,  active: true },
    { id: 'BR',  x: 140,  y: 180,  active: true },
  ]);

  const presets = {
    studio: { 
        name: 'Reference Studio', 
        config: { FL: [-110,-150], FR: [110,-150], SL: [-180,0], SR: [180,0], BL: [-110,150], BR: [110,150] },
        values: { expansion: 30, reverb: 10, bassFocus: 20, air: 30 }
    },
    cinema: { 
        name: 'IMAX Theater', 
        config: { FL: [-160,-200], FR: [160,-200], SL: [-260,0], SR: [260,0], BL: [-160,200], BR: [160,200] },
        values: { expansion: 85, reverb: 65, bassFocus: 80, air: 55 }
    },
    arena: { 
        name: 'Live Arena', 
        config: { FL: [-180,-220], FR: [180,-220], SL: [-280,40], SR: [280,40], BL: [-180,240], BR: [180,240] },
        values: { expansion: 100, reverb: 90, bassFocus: 70, air: 85 }
    }
  };

  const pushToDSP = useCallback((engaged, settings) => {
    if (!window.zenith) return;
    if (!engaged) {
      window.zenith.applyCustomEq("32 0; 1000 0; 16000 0");
      window.zenith.setSpatialWidth(0);
      return;
    }
    const b = settings.bassFocus / 5;
    const a = settings.air / 6;
    window.zenith.applyCustomEq(`32 ${b}; 500 -2; 8000 ${a}; 16000 ${a*1.5}`);
    window.zenith.setSpatialWidth(settings.expansion);
  }, []);

  const handlePresetChange = (key) => {
    setActivePreset(key);
    const p = presets[key];
    setManualSettings(p.values);
    setSpeakers(prev => prev.map(s => p.config[s.id] ? { ...s, x: p.config[s.id][0], y: p.config[s.id][1] } : s));
    if (isEngaged) pushToDSP(true, p.values);
  };

  return (
    <div style={styles.container}>
      {/* 🚀 HEADER SECTION */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.aiBadge}><Sparkles size={12} /> <span>{isEngaged ? '7.1 NEURAL CORE ACTIVE' : 'ENGINE STANDBY'}</span></div>
          <h1 style={styles.title}>Neural <span style={styles.gradientText}>Orbit</span></h1>
        </div>

        <button 
          onClick={() => { setIsEngaged(!isEngaged); pushToDSP(!isEngaged, manualSettings); }}
          style={{
            ...styles.powerBtn, 
            background: isEngaged ? '#8B5CF6' : 'rgba(255,255,255,0.05)',
            boxShadow: isEngaged ? '0 0 25px rgba(139,92,246,0.3)' : 'none'
          }}
        >
          <Zap size={16} fill={isEngaged ? "white" : "none"} />
          <span>{isEngaged ? 'SYSTEM LIVE' : 'INITIALIZE'}</span>
        </button>
      </div>

      <div style={styles.mainLayout}>
        {/* 🎬 DYNAMIC STAGE AREA (SMOOTH DIMMING) */}
        <motion.div 
          initial={false}
          animate={{ 
            opacity: isEngaged ? 1 : 0.5, 
            filter: isEngaged ? 'grayscale(0%)' : 'grayscale(100%) blur(1px)' 
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={styles.stageArea}
        >
          <div style={styles.radarContainer}>
            <motion.div 
               animate={isEngaged ? { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0 }} 
               transition={{ repeat: Infinity, duration: 4 }} 
               style={styles.centralGlow} 
            />
            
            <div style={styles.userCore}>
               <div style={{...styles.headsetBox, borderColor: isEngaged ? '#8B5CF6' : '#1E293B'}}>
                 <Headphones size={42} color={isEngaged ? '#fff' : '#475569'} />
               </div>
            </div>

            {speakers.map(s => (
              <motion.div
                key={s.id}
                animate={{ x: s.x, y: s.y, scale: isEngaged ? 1 : 0.85 }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                style={{
                  ...styles.speakerNode,
                  borderColor: isEngaged ? '#8B5CF6' : '#1E293B',
                  opacity: isEngaged ? 1 : 0.2
                }}
              >
                <Volume2 size={12} color={isEngaged ? '#8B5CF6' : '#475569'} />
                <span style={styles.nodeLabel}>{s.id}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 🎛️ CONTROL RACK (SMOOTH DIMMING) */}
        <div style={styles.controlRack}>
          <motion.div 
            animate={{ opacity: isEngaged ? 1 : 0.4 }}
            transition={{ duration: 0.4 }}
            style={{...styles.panelCard, pointerEvents: isEngaged ? 'auto' : 'none'}}
          >
             <div style={styles.panelHeader} onClick={() => setShowManual(!showManual)}>
                <Settings2 size={14} color="#8B5CF6" /> 
                <span style={{ fontWeight: 900, letterSpacing: '0.5px' }}>MANUAL DSP CONSOLE</span> 
                <ChevronDown size={14} style={{ transform: showManual ? 'rotate(180deg)' : 'none', transition: '0.3s' }}/>
             </div>
             
             <AnimatePresence>
                {showManual && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      style={{ overflow: 'hidden' }}
                    >
                        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <ManualSlider label="Field Width" val={manualSettings.expansion} onChange={(v) => { setManualSettings({...manualSettings, expansion: v}); pushToDSP(isEngaged, {...manualSettings, expansion: v}); }} />
                          <ManualSlider label="Room Air" val={manualSettings.air} onChange={(v) => { setManualSettings({...manualSettings, air: v}); pushToDSP(isEngaged, {...manualSettings, air: v}); }} />
                          <ManualSlider label="LFE Rumble" val={manualSettings.bassFocus} onChange={(v) => { setManualSettings({...manualSettings, bassFocus: v}); pushToDSP(isEngaged, {...manualSettings, bassFocus: v}); }} />
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>
          </motion.div>

          <motion.div 
            animate={{ opacity: isEngaged ? 1 : 0.4 }}
            transition={{ duration: 0.4 }}
            style={{...styles.panelCard, pointerEvents: isEngaged ? 'auto' : 'none'}}
          >
            <h3 style={styles.panelTitle}>7D ACOUSTIC MODELS</h3>
            {Object.keys(presets).map(k => (
                <button 
                  key={k} 
                  onClick={() => handlePresetChange(k)} 
                  style={{
                    ...styles.presetBtn, 
                    background: activePreset === k ? 'rgba(139,92,246,0.1)' : '#12161F', 
                    borderColor: activePreset === k ? '#8B5CF6' : 'transparent'
                  }}
                >
                    <Disc size={14} color={activePreset === k ? '#8B5CF6' : '#475569'} />
                    <span style={{fontWeight: '900', fontSize: '0.8rem', marginLeft: '12px'}}>{presets[k].name}</span>
                </button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ManualSlider = ({ label, val, onChange }) => (
    <div style={styles.sliderGroup}>
        <div style={styles.sliderLabel}><span>{label}</span> <span style={{fontWeight: 900}}>{val}%</span></div>
        <input type="range" min="0" max="100" value={val} onChange={(e) => onChange(parseInt(e.target.value))} style={styles.slider} />
    </div>
);

const styles = {
  container: { padding: '30px', background: '#0B0E14', height: '100vh', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  aiBadge: { display: 'inline-flex', gap: '8px', background: 'rgba(139,92,246,0.1)', padding: '6px 14px', borderRadius: '40px', fontSize: '0.6rem', color: '#8B5CF6', fontWeight: '900' },
  title: { fontSize: '2.5rem', fontWeight: '900', margin: '5px 0', letterSpacing: '-2px' },
  gradientText: { background: 'linear-gradient(135deg, #fff 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  powerBtn: { display: 'flex', gap: '12px', padding: '12px 30px', borderRadius: '15px', color: '#fff', cursor: 'pointer', border: 'none', fontWeight: '900', fontSize: '0.8rem', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  mainLayout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px', flex: 1 },
  stageArea: { background: 'rgba(18,22,31,0.4)', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  radarContainer: { position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  centralGlow: { position: 'absolute', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%' },
  headsetBox: { width: '100px', height: '100px', borderRadius: '30px', background: '#12161F', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' },
  speakerNode: { position: 'absolute', width: '55px', height: '55px', borderRadius: '16px', border: '1.5px solid', background: '#0B0E14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  nodeLabel: { fontSize: '0.5rem', fontWeight: '900', color: '#475569', marginTop: '3px' },
  controlRack: { display: 'flex', flexDirection: 'column', gap: '20px' },
  panelCard: { background: '#12161F', padding: '25px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.04)' },
  panelHeader: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#8B5CF6', cursor: 'pointer' },
  sliderGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sliderLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700', color: '#475569' },
  slider: { width: '100%', accentColor: '#8B5CF6', cursor: 'pointer' },
  panelTitle: { fontSize: '0.6rem', color: '#475569', letterSpacing: '2px', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase' },
  presetBtn: { display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '18px', border: '1px solid', cursor: 'pointer', color: '#fff', width: '100%', marginBottom: '10px', transition: '0.2s' }
};

export default NeuralStage;