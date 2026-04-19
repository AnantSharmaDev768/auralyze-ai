import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Square, X, Power, PowerOff } from 'lucide-react';
import Sidebar from './Sidebar';
import AIMode from './AIMode';
import ManualMode from './ManualMode';
import Presets from './Presets';
import NeuralStage from './NeuralStage';
import Settings from './Settings';

export default function App() {
  
  const [activeTab, setActiveTab] = useState('devices');
  const [deviceName, setDeviceName] = useState("Master Audio Output");
  const [isActive, setIsActive] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const [engineState, setEngineState] = useState({
    activePreset: 'music',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    effects: { clarity: 0, ambience: 0, surround: 0, dynamicBoost: 0, bassBoost: 0 },
    spatial: { roomSize: 30 }
  });

  
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
     
      await new Promise(r => setTimeout(r, 800));
      try {
        
        const result = await window.zenith?.detectDevice();
        if (isMounted && result?.name) setDeviceName(result.name);
      } catch (err) { 
        console.error("Hardware Handshake Error:", err); 
      }
      if (isMounted) setIsInitialized(true);
    };
    init();
    return () => { isMounted = false; };
  }, []);

  // 🛰️ GLOBAL ENGINE UPDATE HANDLER
  const updateGlobalEngine = useCallback((newState) => {
    setEngineState(prev => ({
      ...prev,
      ...newState,
      
      effects: newState.effects ? { ...prev.effects, ...newState.effects } : prev.effects,
      spatial: newState.spatial ? { ...prev.spatial, ...newState.spatial } : prev.spatial,
      activePreset: newState.activePreset || prev.activePreset
    }));
  }, []);

  const handlePowerToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
   
    window.zenith?.togglePower?.(newState);
  };

  if (!isInitialized) return (
    <div style={styles.loadingContainer}>
      <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        ZENITH AI: CALIBRATING DSP CORE...
      </motion.div>
    </div>
  );

  return (
    <div style={styles.container}>
      <Sidebar activeTab={activeTab} setTab={setActiveTab} isActive={isActive} />
      
      <div style={styles.mainArea}>
        <div style={styles.topBar}>
          <div style={styles.dragZone}>
            <div style={styles.deviceInfo}>
              <div style={{...styles.statusDot, backgroundColor: isActive ? '#8B5CF6' : '#EF4444'}} />
              <span style={styles.deviceLabel}>HARDWARE SIGNATURE</span>
              <span style={styles.deviceName}>{deviceName}</span>
            </div>
          </div>

          <div style={styles.rightSection}>
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={handlePowerToggle} 
              style={{...styles.powerBtn, backgroundColor: isActive ? '#8B5CF6' : '#EF4444'}}
            >
              {isActive ? <Power size={14} color="white" /> : <PowerOff size={14} color="white" />}
            </motion.button>

            <div style={styles.windowControls}>
              <div onClick={() => window.zenith?.minimize?.()} style={styles.controlBtn}><Minus size={16} /></div>
              <div onClick={() => window.zenith?.maximize?.()} style={styles.controlBtn}><Square size={12} /></div>
              <div onClick={() => window.zenith?.close?.()} style={{...styles.controlBtn, color: '#EF4444'}}><X size={16} /></div>
            </div>
          </div>
        </div>

        <main style={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              {/* 🚀 DASHBOARD: Fixed onModeChange function */}
              {activeTab === 'dashboard' && (
                <AIMode 
                    isActive={isActive} 
                    currentMode={engineState.activePreset} 
                    onModeChange={(id) => updateGlobalEngine({ activePreset: id })} 
                />
              )}

              {/* 🚀 STUDIO LAB: Manual EQ Engine */}
              {activeTab === 'manual' && (
                <ManualMode 
                    isActive={isActive} 
                    engineState={engineState} 
                    onUpdate={updateGlobalEngine} 
                />
              )}

              {/* 🚀 SIGNATURE LIB: Archetype Selector */}
              {activeTab === 'presets' && (
                <Presets 
                    isActive={isActive} 
                    engineState={engineState} 
                    onApply={(id) => updateGlobalEngine({ activePreset: id })} 
                />
              )}

              {/* 🚀 NEURAL STAGE: Psychoacoustic Virtualization */}
              {activeTab === 'devices' && (
                <NeuralStage 
                    isActive={isActive} 
                    engineState={engineState} 
                />
              )}

              {/* 🚀 ENGINE CORE: System Settings */}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', width: '100vw', background: '#0B0E14', overflow: 'hidden' },
  loadingContainer: { height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0E14', color: '#8B5CF6', fontWeight: 'bold', letterSpacing: '2px' },
  mainArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  topBar: { height: '65px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', padding: '0 20px 0 30px', background: '#0B0E14' },
  dragZone: { flex: 1, WebkitAppRegion: 'drag', height: '100%', display: 'flex', alignItems: 'center' },
  deviceInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', boxShadow: '0 0 8px currentColor' },
  deviceLabel: { fontSize: '0.6rem', color: '#475569', fontWeight: '800', letterSpacing: '2px' },
  deviceName: { fontSize: '0.75rem', color: '#8B5CF6', fontWeight: '700' },
  rightSection: { display: 'flex', alignItems: 'center', gap: '15px', WebkitAppRegion: 'no-drag' },
  windowControls: { display: 'flex', gap: '5px', marginLeft: '10px' },
  powerBtn: { width: '32px', height: '32px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  controlBtn: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', color: '#64748B', transition: '0.2s', background: 'rgba(255,255,255,0.02)' },
  content: { flex: 1, overflowY: 'hidden' }
};