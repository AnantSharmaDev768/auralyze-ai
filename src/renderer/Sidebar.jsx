import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  SlidersHorizontal, 
  Headphones, 
  Waves, 
  Settings, 
  Activity, 
  Sparkles 
} from 'lucide-react';

const Sidebar = React.memo(({ activeTab, setTab, isActive }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'manual', label: 'Studio Lab', icon: <SlidersHorizontal size={18} /> },
    { id: 'presets', label: 'Signature Lib', icon: <Headphones size={18} /> },
    { id: 'devices', label: 'Neural Stage', icon: <Waves size={18} /> }, // Updated label & icon
    { id: 'settings', label: 'Engine Core', icon: <Settings size={18} /> },
  ];

  const handleTabClick = (tabId) => {
    setTab(tabId);
  };

  return (
    <div style={styles.sidebar}>
      {/* 💎 BRANDING SECTION */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>
          <Activity size={20} color="#8B5CF6" />
        </div>
        <div>
          <h1 style={styles.logoText}>ZENITH<span style={{ color: '#8B5CF6' }}>AI</span></h1>
          <p style={styles.tagline}>AURALYZE ENGINE</p>
        </div>
      </div>

      {/* 🚀 NAVIGATION RACK */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActiveTab = activeTab === item.id;
          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabClick(item.id)}
              style={{
                ...styles.navItem,
                background: isActiveTab ? 'rgba(139,92,246,0.1)' : 'transparent',
                borderLeft: isActiveTab ? '3px solid #8B5CF6' : '3px solid transparent',
              }}
            >
              <div style={{ 
                color: isActiveTab ? '#8B5CF6' : '#475569',
                transition: '0.3s' 
              }}>
                {item.icon}
              </div>
              <span style={{ 
                color: isActiveTab ? '#F8FAFC' : '#475569',
                fontWeight: isActiveTab ? '700' : '500',
                fontSize: '0.8rem',
                transition: '0.3s'
              }}>
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </nav>

      {/* 💊 SYSTEM STATUS PILL */}
      <div style={styles.footer}>
        <div style={{
          ...styles.powerBadge, 
          borderColor: isActive ? 'rgba(139,92,246,0.2)' : 'rgba(239,68,68,0.2)',
          background: isActive ? 'rgba(139,92,246,0.03)' : 'rgba(239,68,68,0.03)'
        }}>
          <motion.div 
            animate={{ 
              scale: isActive ? [1, 1.4, 1] : 1,
              opacity: isActive ? [1, 0.6, 1] : 1
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              ...styles.powerDot, 
              background: isActive ? '#8B5CF6' : '#EF4444',
              boxShadow: isActive ? '0 0 10px #8B5CF6' : '0 0 10px #EF4444'
            }} 
          />
          <span style={{
            ...styles.powerText,
            color: isActive ? '#F8FAFC' : '#EF4444'
          }}>
            {isActive ? 'MESH ACTIVE' : 'BYPASSED'}
          </span>
          {isActive && <Sparkles size={10} color="#8B5CF6" />}
        </div>
      </div>
    </div>
  );
});

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    background: '#0B0E14', // Synchronized with main background
    borderRight: '1px solid rgba(255,255,255,0.03)',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 0',
    zIndex: 100,
  },
  logoContainer: {
    padding: '0 25px',
    marginBottom: '50px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'rgba(139,92,246,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(139,92,246,0.1)',
  },
  logoText: {
    fontSize: '1.3rem',
    fontWeight: '900',
    margin: 0,
    color: '#F8FAFC',
    letterSpacing: '-1px',
  },
  tagline: {
    fontSize: '0.55rem',
    color: '#475569',
    margin: '2px 0 0',
    letterSpacing: '2px',
    fontWeight: '800',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '0 15px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  footer: {
    padding: '25px',
    marginTop: 'auto',
  },
  powerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    borderRadius: '16px',
    border: '1px solid',
    justifyContent: 'center',
    transition: '0.5s ease',
  },
  powerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  powerText: {
    fontSize: '0.65rem',
    fontWeight: '900',
    letterSpacing: '1.5px',
    transition: '0.3s',
  },
};

export default Sidebar;