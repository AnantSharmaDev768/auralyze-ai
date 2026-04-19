import React from 'react';
import { Settings as SettingsIcon, Monitor, Palette, Info } from 'lucide-react';

const Settings = () => {
  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#F8FAFC', margin: 0 }}>Engine Core</h2>
        <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '5px' }}>System configuration & audio processing preferences</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        <div style={{ background: 'rgba(18,22,31,0.6)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem', color: '#64748B', marginBottom: '20px' }}>
            <Monitor size={16} color="#3B82F6" /> <span>SYSTEM BEHAVIOR</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span>Zenith AI v4.0</span>
            <span style={{ color: '#10B981' }}>Running</span>
          </div>
        </div>

        <div style={{ background: 'rgba(18,22,31,0.6)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', fontSize: '0.65rem', color: '#64748B' }}>
            <Info size={12} color="#64748B" />
            <span>Zenith AI v4.0 — Surgical Neural Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;