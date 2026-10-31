import React, { useState, useEffect } from 'react';
import TypingTestView from './components/typing/TypingTestView.jsx';
import ResultsView from './components/results/ResultsView.jsx';
import HistoryView from './components/history/HistoryView.jsx';
import PracticeView from './components/practice/PracticeView.jsx';
import SettingsView from './components/settings/SettingsView.jsx';
import KeyboardModelViewer from './components/three/KeyboardModelViewer.jsx';
import Intro3DLogo from './components/three/Intro3DLogo.jsx';
import { apiRequest } from './services/apiClient.js';
import { 
  Keyboard, 
  History as HistoryIcon, 
  Target, 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Award 
} from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [currentTab, setCurrentTab] = useState('home'); // home, test, practice, results, history, settings
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark-ocean');
  const [lastResult, setLastResult] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch summary metrics for Home Dashboard
  useEffect(() => {
    apiRequest('/api/v1/analytics/summary')
      .then(res => setSummary(res.data))
      .catch(() => {});
  }, [currentTab]);

  const toggleTheme = (newTheme) => {
    const next = typeof newTheme === 'string' ? newTheme : (theme === 'dark-ocean' ? 'warm-earth' : 'dark-ocean');
    setTheme(next);
  };

  const handleTestComplete = (result) => {
    setLastResult(result);
    setCurrentTab('results');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 3D Intro Splash Screen */}
      {showIntro && <Intro3DLogo onComplete={() => setShowIntro(false)} />}

      {/* High-End Glass Navigation Header */}
      <header className="glass-panel" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        margin: '14px 24px',
        padding: '12px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            padding: '7px',
            background: 'var(--color-accent)',
            borderRadius: '10px',
            color: 'var(--color-bg-deep)',
            boxShadow: '0 4px 12px var(--glow-accent)',
            display: 'flex'
          }}>
            <Keyboard size={20} />
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              AULA<span style={{ color: 'var(--color-accent)' }}>.TYPING</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--color-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              3D Speed Benchmark
            </span>
          </div>
        </div>

        {/* Navigation Tabs (5 Prompt-mandated Views) */}
        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className={`glass-btn ${currentTab === 'home' ? 'primary' : ''}`}
            onClick={() => setCurrentTab('home')}
          >
            Home
          </button>
          <button
            className={`glass-btn ${currentTab === 'test' ? 'primary' : ''}`}
            onClick={() => setCurrentTab('test')}
          >
            Typing Test
          </button>
          <button
            className={`glass-btn ${currentTab === 'practice' ? 'primary' : ''}`}
            onClick={() => setCurrentTab('practice')}
          >
            <Target size={15} /> Practice
          </button>
          <button
            className={`glass-btn ${currentTab === 'history' ? 'primary' : ''}`}
            onClick={() => setCurrentTab('history')}
          >
            <HistoryIcon size={15} /> History
          </button>
          <button
            className={`glass-btn ${currentTab === 'settings' ? 'primary' : ''}`}
            onClick={() => setCurrentTab('settings')}
          >
            <SettingsIcon size={15} /> Settings
          </button>

          {/* Theme Quick-Toggle */}
          <button 
            className="glass-btn" 
            onClick={() => toggleTheme()}
            title={`Switch to ${theme === 'dark-ocean' ? 'Warm Earth' : 'Dark Ocean'} theme`}
            style={{ padding: '8px 12px', marginLeft: '4px' }}
          >
            {theme === 'dark-ocean' ? <Sun size={15} /> : <Moon size={15} />}
            <span style={{ fontSize: '0.78rem' }}>{theme === 'dark-ocean' ? 'Dark Ocean' : 'Warm Earth'}</span>
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '20px 24px 40px', maxWidth: '1160px', margin: '0 auto', width: '100%' }}>
        {/* 1. HOME DASHBOARD */}
        {currentTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Hero Showcase with Interactive 3D Turntable */}
            <div className="glass-panel" style={{
              padding: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '36px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span className="badge">Authentic Aula F75 GLB Model</span>
                  <span className="badge accent">MongoDB Powered</span>
                </div>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '18px', letterSpacing: '-0.02em' }}>
                  Precision Mechanical Typing Benchmark
                </h1>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.65, fontSize: '1.05rem', marginBottom: '28px' }}>
                  Evaluate your typing cadence against verified server-authoritative scoring metrics. Inspect your velocity trendline, explore targeted muscle-memory drills, and receive Gemini AI diagnostic coaching.
                </p>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <button className="glass-btn primary" onClick={() => setCurrentTab('test')} style={{ padding: '12px 26px', fontSize: '1rem' }}>
                    Start Typing Test <ArrowRight size={17} />
                  </button>
                  <button className="glass-btn" onClick={() => setCurrentTab('practice')} style={{ padding: '12px 22px' }}>
                    Explore Practice Drills
                  </button>
                </div>
              </div>

              {/* Genuine 3D Model Rendering with Orbit Controls */}
              <div style={{
                borderRadius: '20px',
                background: 'rgba(10, 20, 32, 0.4)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)'
              }}>
                <KeyboardModelViewer height="420px" />
              </div>
            </div>

            {/* Historical Snapshot or Empty State */}
            {summary && summary.totalTests > 0 ? (
              <div className="glass-panel" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={20} color="var(--color-accent)" /> Historical Snapshot
                  </h3>
                  <button className="glass-btn" onClick={() => setCurrentTab('history')} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                    Full History <ArrowRight size={14} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="glass-panel-subtle" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PERSONAL BEST</span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-accent)' }}>{summary.bestWpm}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Net Words / Minute</span>
                  </div>
                  <div className="glass-panel-subtle" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>AVERAGE SPEED</span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>{summary.averageWpm}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Historical Average</span>
                  </div>
                  <div className="glass-panel-subtle" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ACCURACY LEVEL</span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-success)' }}>{summary.averageAccuracy}%</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Keystroke Precision</span>
                  </div>
                  <div className="glass-panel-subtle" style={{ padding: '18px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>RECORDED TESTS</span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800 }}>{summary.totalTests}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Completed Benchmarks</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Ready to Begin Your First Benchmark?</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 20px' }}>
                  Complete your first 30, 60, or 120-second typing test. The backend scoring engine records your historical attempts with MongoDB persistence.
                </p>
                <button className="glass-btn primary" onClick={() => setCurrentTab('test')} style={{ padding: '10px 24px' }}>
                  Take First Benchmark <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Architecture Highlights Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <ShieldCheck size={22} color="var(--color-accent)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Deterministic Engine v1.0</h3>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Scoring metrics are authoritative and server-verified. Durations and grapheme accuracy are calculated strictly on the backend to guarantee fairness.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Sparkles size={22} color="var(--color-success)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Gemini AI Diagnostics</h3>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Provides personalized coaching summaries, strength evaluations, and targeted drills with a smart deterministic fallback.
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <Award size={22} color="var(--color-accent)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Zero-Friction Access</h3>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Anonymous visitor persistence allows immediate benchmark testing and MongoDB continuity without creating user accounts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. TYPING TEST */}
        {currentTab === 'test' && (
          <TypingTestView onTestComplete={handleTestComplete} />
        )}

        {/* 3. PRACTICE DRILLS */}
        {currentTab === 'practice' && (
          <PracticeView />
        )}

        {/* 4. RESULTS VIEW */}
        {currentTab === 'results' && (
          <ResultsView 
            result={lastResult} 
            onTryAgain={() => setCurrentTab('test')} 
            onNavigateToPractice={() => setCurrentTab('practice')} 
          />
        )}

        {/* 5. HISTORY & ANALYTICS */}
        {currentTab === 'history' && (
          <HistoryView />
        )}

        {/* 6. SETTINGS & DIAGNOSTICS */}
        {currentTab === 'settings' && (
          <SettingsView currentTheme={theme} onThemeChange={toggleTheme} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        color: 'var(--color-text-muted)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--glass-border)',
        margin: '20px 24px 0'
      }}>
        Aula.Typing · Designed with Dark Ocean & Warm Earth Glassmorphism · Three.js 3D & MongoDB Powered
      </footer>
    </div>
  );
}
