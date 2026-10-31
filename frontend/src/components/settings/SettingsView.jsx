import React, { useState } from 'react';
import { getVisitorId } from '../../services/apiClient.js';
import { Settings as SettingsIcon, Palette, Database, Bot, User, Trash2, CheckCircle2 } from 'lucide-react';

export default function SettingsView({ currentTheme, onThemeChange }) {
  const [visitorId, setVisitorId] = useState(getVisitorId());
  const [cleared, setCleared] = useState(false);

  const handleResetVisitor = () => {
    localStorage.removeItem('visitor_id');
    const newId = getVisitorId();
    setVisitorId(newId);
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <SettingsIcon size={24} color="var(--color-accent)" />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Platform Settings & Diagnostics</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Configure appearance, review database connectivity, and manage anonymous visitor preferences.
        </p>

        {/* Theme Settings */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={18} color="var(--color-accent)" /> Appearance Themes
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div 
              onClick={() => onThemeChange('dark-ocean')}
              className="glass-panel-subtle"
              style={{
                padding: '20px',
                cursor: 'pointer',
                border: currentTheme === 'dark-ocean' ? '2px solid var(--color-accent)' : '1px solid var(--glass-border)',
                background: currentTheme === 'dark-ocean' ? 'var(--glass-bg-hover)' : 'var(--glass-bg-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Dark Ocean (Default)</strong>
                {currentTheme === 'dark-ocean' && <CheckCircle2 size={16} color="var(--color-accent)" />}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '8px 0 14px' }}>
                Deep Navy (#0D1B2A), Steel Blue (#415A77), Warm Sand (#D4C4A8)
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#0D1B2A', '#1B263B', '#415A77', '#778D7A', '#D4C4A8', '#F4F1DE'].map(c => (
                  <div key={c} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.2)' }} />
                ))}
              </div>
            </div>

            <div 
              onClick={() => onThemeChange('warm-earth')}
              className="glass-panel-subtle"
              style={{
                padding: '20px',
                cursor: 'pointer',
                border: currentTheme === 'warm-earth' ? '2px solid var(--color-accent)' : '1px solid var(--glass-border)',
                background: currentTheme === 'warm-earth' ? 'var(--glass-bg-hover)' : 'var(--glass-bg-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Warm Earth</strong>
                {currentTheme === 'warm-earth' && <CheckCircle2 size={16} color="var(--color-accent)" />}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '8px 0 14px' }}>
                Espresso Brown (#3E2522), Taupe (#8C6E63), Caramel (#D3A376)
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#3E2522', '#8C6E63', '#D3A376', '#FFE0B2', '#FFF2DF'].map(c => (
                  <div key={c} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,0.2)' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status Diagnostics */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--color-accent)" /> Integrations & Identity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="glass-panel-subtle" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Anonymous Visitor Identifier</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{visitorId}</div>
              </div>
              <button className="glass-btn" onClick={handleResetVisitor} style={{ fontSize: '0.8rem' }}>
                <Trash2 size={14} /> {cleared ? 'Reset!' : 'Reset Visitor'}
              </button>
            </div>

            <div className="glass-panel-subtle" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Backend Server Engine</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Express + TypeScript on Port 3001</div>
              </div>
              <span className="badge">Online (v1.0)</span>
            </div>

            <div className="glass-panel-subtle" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Gemini AI Coach Engine</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Interactive Diagnostics with Deterministic Fallback</div>
              </div>
              <span className="badge accent">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
