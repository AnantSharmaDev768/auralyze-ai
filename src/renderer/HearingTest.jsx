import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check, Activity } from 'lucide-react';

const HearingTest = ({ onComplete, onClose }) => {
  const [currentFreq, setCurrentFreq] = useState(0);
  const [testResults, setTestResults] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const audioContext = useRef(null);
  const oscillator = useRef(null);

  const frequencies = [
    { freq: 32, label: "32 Hz", desc: "Deep Bass" },
    { freq: 64, label: "64 Hz", desc: "Low Bass" },
    { freq: 125, label: "125 Hz", desc: "Mid Bass" },
    { freq: 250, label: "250 Hz", desc: "Upper Bass" },
    { freq: 500, label: "500 Hz", desc: "Lower Mids" },
    { freq: 1000, label: "1 kHz", desc: "Midrange" },
    { freq: 2000, label: "2 kHz", desc: "Upper Mids" },
    { freq: 4000, label: "4 kHz", desc: "Presence" },
    { freq: 8000, label: "8 kHz", desc: "Brilliance" },
    { freq: 16000, label: "16 kHz", desc: "Air" }
  ];

  const playTone = (freq) => {
    if (audioContext.current) audioContext.current.close();
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    oscillator.current = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    oscillator.current.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    oscillator.current.frequency.value = freq;
    gainNode.gain.value = 0.1;
    oscillator.current.start();
    setIsPlaying(true);
    setTimeout(() => {
      if (oscillator.current) { oscillator.current.stop(); setIsPlaying(false); }
    }, 2500);
  };

  const stopTone = () => {
    if (oscillator.current) { oscillator.current.stop(); setIsPlaying(false); }
  };

  const handleHeard = () => {
    setTestResults(prev => ({ ...prev, [frequencies[currentFreq].freq]: 0 }));
    if (currentFreq < frequencies.length - 1) setCurrentFreq(prev => prev + 1);
    else completeTest();
    stopTone();
  };

  const handleNotHeard = () => {
    setTestResults(prev => ({ ...prev, [frequencies[currentFreq].freq]: 6 }));
    if (currentFreq < frequencies.length - 1) setCurrentFreq(prev => prev + 1);
    else completeTest();
    stopTone();
  };

  const completeTest = () => {
    setTestComplete(true);
    const eq = Object.entries(testResults).map(([freq, loss]) => `${freq} ${Math.min(12, loss * 1.5)}`).join("; ");
    onComplete({ eq, results: testResults });
  };

  if (testComplete) {
    return (
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.modal}>
        <div style={styles.modalContent}>
          <div style={styles.successIcon}><Check size={48} color="#10B981" /></div>
          <h3>Hearing Profile Created</h3>
          <p>Zenith AI has generated a personalized compensation curve for your hearing.</p>
          <button onClick={onClose} style={styles.modalButton}>Continue to Dashboard</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.overlay}>
      <div style={styles.container}>
        <h2 style={styles.title}>Golden Ear Calibration</h2>
        <p style={styles.subtitle}>We'll play tones at different frequencies. Click "I Hear It" when you hear the tone.</p>
        <div style={styles.progressBar}><div style={{...styles.progressFill, width: `${((currentFreq + 1) / frequencies.length) * 100}%`}} /></div>
        <div style={styles.testArea}>
          <div style={styles.freqDisplay}><span style={styles.freqValue}>{frequencies[currentFreq].freq}</span><span style={styles.freqUnit}>Hz</span></div>
          <p style={styles.freqDesc}>{frequencies[currentFreq].desc}</p>
          <div style={styles.buttonGroup}>
            <button onClick={() => playTone(frequencies[currentFreq].freq)} style={styles.playBtn}><Volume2 size={20} /> Play Tone</button>
            <button onClick={stopTone} style={styles.stopBtn}>Stop</button>
          </div>
          <div style={styles.responseGroup}>
            <button onClick={handleHeard} style={styles.heardBtn}>✓ I Hear It</button>
            <button onClick={handleNotHeard} style={styles.notHeardBtn}>✗ I Don't Hear It</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  container: { width: '500px', padding: '40px', background: '#12161F', borderRadius: '24px', border: '1px solid rgba(59,130,246,0.3)', textAlign: 'center' },
  title: { fontSize: '1.5rem', fontWeight: '800', marginBottom: '10px', color: '#F8FAFC' },
  subtitle: { fontSize: '0.8rem', color: '#64748B', marginBottom: '30px' },
  progressBar: { height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '40px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#3B82F6', transition: 'width 0.3s' },
  testArea: { marginBottom: '30px' },
  freqDisplay: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '5px', marginBottom: '10px' },
  freqValue: { fontSize: '4rem', fontWeight: '900', color: '#3B82F6', fontFamily: 'monospace' },
  freqUnit: { fontSize: '1.2rem', color: '#64748B' },
  freqDesc: { fontSize: '0.8rem', color: '#64748B', marginBottom: '30px' },
  buttonGroup: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' },
  playBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#3B82F6', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer' },
  stopBtn: { padding: '12px 24px', background: 'transparent', border: '1px solid #64748B', borderRadius: '12px', color: '#F8FAFC', cursor: 'pointer' },
  responseGroup: { display: 'flex', gap: '12px' },
  heardBtn: { flex: 1, padding: '14px', background: '#10B981', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer' },
  notHeardBtn: { flex: 1, padding: '14px', background: 'transparent', border: '1px solid #EF4444', borderRadius: '12px', color: '#EF4444', fontWeight: '700', cursor: 'pointer' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalContent: { width: '400px', padding: '40px', background: '#12161F', borderRadius: '24px', textAlign: 'center' },
  successIcon: { marginBottom: '20px' },
  modalButton: { width: '100%', padding: '14px', background: '#3B82F6', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer', marginTop: '20px' }
};

export default HearingTest;