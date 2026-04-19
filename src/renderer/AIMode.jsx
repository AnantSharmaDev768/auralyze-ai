import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Waves, Film, Music, Gamepad2, Mic,
  Shield, Zap, Sparkles
} from "lucide-react";

// 🎯 ENHANCED PRESET LIBRARY (Linked to DSP Hardware)
const PRESET_LIBRARY = {
  cinematic: { 
    name: "Cinema Pro", icon: <Film size={20}/>, color: "#8B5CF6", desc: "Surgical Spatial Mesh",
    mesh: [90, 82, 60, 40, 35, 45, 65, 85, 95, 90],
    // 🔊 Hardware Instructions
    dsp: { eq: "32 8; 250 -3; 1000 -4; 8000 5; 16000 9", width: 90 }
  },
  music: { 
    name: "Hi-Fi Pure", icon: <Music size={20}/>, color: "#A855F7", desc: "Linear Reference",
    mesh: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    dsp: { eq: "32 0; 1000 0; 16000 0", width: 20 }
  },
  gaming: { 
    name: "Spatial Pro", icon: <Gamepad2 size={20}/>, color: "#C084FC", desc: "Tactical Positional Mesh",
    mesh: [30, 40, 65, 85, 95, 90, 75, 65, 55, 45],
    dsp: { eq: "32 -5; 1000 2; 4000 8; 12000 10", width: 75 }
  },
  vocal: { 
    name: "Voice Clarity", icon: <Mic size={20}/>, color: "#D946EF", desc: "Neural Speech Isolation",
    mesh: [10, 20, 35, 70, 95, 98, 85, 60, 40, 25],
    dsp: { eq: "125 -10; 500 5; 2000 8; 8000 -5", width: 10 }
  }
};

const AIMode = ({ isActive = true, currentMode, onModeChange }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🛰️ REAL-TIME HARDWARE PUSH
  const pushHardwareUpdate = (modeKey) => {
    if (!window.zenith || !isActive) return;
    
    const config = PRESET_LIBRARY[modeKey]?.dsp;
    if (config) {
      console.log(`[AI Mode] Pushing Hardware Sync: ${modeKey}`);
      window.zenith.applyCustomEq(config.eq);
      window.zenith.setSpatialWidth(config.width);
    }
  };

  const handleModeSelection = (key) => {
    if (!isActive) return;
    
    // 1. Update UI state (via App.jsx)
    onModeChange(key);
    
    // 2. Push real-time sound change to Manual Engine
    pushHardwareUpdate(key);
  };

  const handleOptimize = () => {
    if (!isActive || isAnalyzing) return;
    setIsAnalyzing(true);
    setProgress(0);
    
    // Trigger Master Hardware Optimization
    window.zenith?.runOptimization?.();

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setIsOptimized(true);
          // Apply a final "Perfected" DSP curve upon completion
          pushHardwareUpdate(currentMode);
          return 100;
        }
        return p + 5;
      });
    }, 60);
  };

  return (
    <div style={{...styles.container, opacity: isActive ? 1 : 0.5}}>
      <header style={styles.header}>
        <div style={styles.branding}>
          <Sparkles size={14} color="#8B5CF6" />
          <span style={styles.engineLabel}>TUNED BY KARTIK</span>
        </div>
        <div style={styles.coreVersion}>
          <Cpu size={12} /> NEURAL CORE v4.0
        </div>
      </header>

      <h1 style={styles.title}>Neural Dashboard</h1>
      <p style={styles.subtitle}>Surgical Intelligence Engine Active</p>

      {/* 📊 FREQUENCY MESH */}
      <div style={styles.spectrumBox}>
        <div style={styles.meshHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Waves size={16} color="#8B5CF6" />
            <span style={styles.meshTitle}>SYSTEM FREQUENCY MESH</span>
          </div>
          {isOptimized && <div style={styles.optimizedBadge}>OPTIMIZED</div>}
        </div>
        
        <div style={styles.meshContainer}>
          {(PRESET_LIBRARY[currentMode] || PRESET_LIBRARY.music).mesh.map((val, i) => (
            <div key={i} style={styles.barWrapper}>
              <motion.div 
                animate={{ height: `${val}%` }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                style={{ 
                  ...styles.bar, 
                  background: `linear-gradient(to top, ${PRESET_LIBRARY[currentMode]?.color || '#8B5CF6'}, transparent)` 
                }} 
              />
            </div>
          ))}
        </div>

        {isAnalyzing && (
          <div style={styles.scanContainer}>
            <motion.div 
              style={styles.scanLine} 
              animate={{ left: ["0%", "100%"] }} 
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
            />
          </div>
        )}
      </div>

      {/* 🎯 MODE SELECTOR (Now with Real-Time Audio Link) */}
      <div style={styles.modeGrid}>
        {Object.keys(PRESET_LIBRARY).map((key) => {
          const m = PRESET_LIBRARY[key];
          const isSelected = currentMode === key;
          return (
            <motion.div
              key={key}
              whileHover={{ y: isActive ? -5 : 0 }}
              onClick={() => handleModeSelection(key)}
              style={{
                ...styles.modeCard,
                cursor: isActive ? 'pointer' : 'default',
                border: isSelected ? `1px solid ${m.color}` : "1px solid rgba(255,255,255,0.05)",
                background: isSelected ? `${m.color}15` : "rgba(255,255,255,0.02)"
              }}
            >
              <div style={{ color: m.color, marginBottom: 12 }}>{m.icon}</div>
              <h3 style={styles.modeName}>{m.name}</h3>
              <p style={styles.modeDesc}>{m.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <button onClick={handleOptimize} style={{...styles.actionBtn, opacity: isActive ? 1 : 0.6}} disabled={!isActive}>
        {isAnalyzing ? `CALIBRATING NEURAL ARCHETYPES... ${progress}%` : "RUN NEURAL OPTIMIZATION"}
      </button>

      <AnimatePresence>
        {isOptimized && isActive && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.footer}>
            <Shield size={12} strokeWidth={3} />
            <span>NEURAL MESH: {currentMode.toUpperCase()} ACTIVE</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: { padding: "30px", maxWidth: "1000px", margin: "0 auto", transition: '0.3s ease' },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  branding: { display: "flex", alignItems: "center", gap: 8, background: 'rgba(139,92,246,0.1)', padding: '6px 16px', borderRadius: '40px' },
  engineLabel: { fontSize: 9, fontWeight: "900", color: "#8B5CF6", letterSpacing: "1px" },
  coreVersion: { fontSize: 10, color: "#475569", fontWeight: "bold", display: "flex", alignItems: "center", gap: 6 },
  title: { fontSize: "3rem", fontWeight: "900", color: "#fff", margin: "5px 0", letterSpacing: "-2px" },
  subtitle: { color: "#475569", fontSize: "0.9rem", marginBottom: 35, fontWeight: "bold" },
  spectrumBox: { background: "rgba(18,22,31,0.5)", padding: "35px", borderRadius: "32px", border: "1px solid rgba(139,92,246,0.1)", position: "relative", marginBottom: "25px" },
  meshHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: "20px" },
  meshTitle: { fontSize: 10, fontWeight: "900", color: "#475569", letterSpacing: "2px" },
  meshContainer: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px' },
  barWrapper: { width: '8%', height: '100%', display: 'flex', alignItems: 'flex-end' },
  bar: { width: '100%', borderRadius: '8px 8px 0 0' },
  scanContainer: { position: "absolute", inset: 0, overflow: 'hidden', borderRadius: "32px" },
  scanLine: { position: "absolute", top: 0, width: "2px", height: "100%", background: "#8B5CF6", boxShadow: "0 0 20px #8B5CF6" },
  optimizedBadge: { background: "#10B98120", color: "#10B981", fontSize: 9, padding: "4px 12px", borderRadius: "20px", fontWeight: "900" },
  modeGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" },
  modeCard: { padding: "25px", borderRadius: "24px", transition: "0.3s" },
  modeName: { color: "#fff", margin: "0 0 5px 0", fontSize: "1rem", fontWeight: "900" },
  modeDesc: { color: "#475569", fontSize: "0.75rem", margin: 0, fontWeight: "bold" },
  actionBtn: { width: "100%", marginTop: "25px", padding: "20px", border: "none", borderRadius: "20px", color: "#fff", fontWeight: "900", background: "#8B5CF6", cursor: "pointer", fontSize: "0.9rem" },
  footer: { position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "#000", padding: "12px 30px", borderRadius: "50px", border: "1px solid #8B5CF640", color: "#8B5CF6", fontSize: 10, display: 'flex', gap: 15, alignItems: 'center', fontWeight: "900", letterSpacing: "1px" }
};

export default AIMode;