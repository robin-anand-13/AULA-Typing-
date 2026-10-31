import React, { useState } from 'react';
import { apiRequest } from '../../services/apiClient.js';
import { Sparkles, RotateCcw, Award, CheckCircle, BarChart3, Bot, ArrowRight, Share2, Check } from 'lucide-react';

export default function ResultsView({ result, onTryAgain, onNavigateToPractice }) {
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const fetchAiFeedback = async () => {
    setLoadingAi(true);
    setAiError('');
    try {
      const res = await apiRequest('/api/v1/ai/feedback', {
        method: 'POST',
        body: JSON.stringify({
          netWpm: result.netWpm,
          grossWpm: result.grossWpm,
          accuracy: result.accuracy,
          durationSeconds: result.elapsedSeconds
        })
      });
      setAiFeedback(res.data);
    } catch (err) {
      setAiError('Failed to load AI feedback: ' + err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleShare = () => {
    const text = `🎯 I scored ${result.netWpm} Net WPM with ${result.accuracy}% accuracy on Aula.Typing!`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner Card */}
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(119, 141, 122, 0.2)', borderRadius: '50%', marginBottom: '16px' }}>
          <Award size={40} color="var(--color-accent)" />
        </div>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '6px' }}>Benchmark Finished</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
          {result.passageTitle || 'Standard Benchmark'} · Server-Scored Session #{result.sessionId?.slice(0, 8)}
        </p>

        {/* 4 Core Primary Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginTop: '32px'
        }}>
          <div className="glass-panel-subtle" style={{ padding: '22px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>NET SPEED</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1.1, margin: '8px 0' }}>{result.netWpm}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Words per minute</div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '22px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>ACCURACY</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-success)', lineHeight: 1.1, margin: '8px 0' }}>{result.accuracy}%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Character fidelity</div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '22px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>GROSS SPEED</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, margin: '8px 0' }}>{result.grossWpm}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Raw insertion pace</div>
          </div>

          <div className="glass-panel-subtle" style={{ padding: '22px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>ELAPSED TIME</div>
            <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, margin: '8px 0' }}>{result.elapsedSeconds}s</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Server benchmark time</div>
          </div>
        </div>

        {/* Breakdown Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--glass-border)',
          flexWrap: 'wrap',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)'
        }}>
          <div>Correct Characters: <strong style={{ color: 'var(--color-success)' }}>{result.correctChars}</strong></div>
          <div>Typos / Errors: <strong style={{ color: '#f87171' }}>{result.incorrectChars}</strong></div>
          <div>Total Keystrokes: <strong style={{ color: 'var(--color-text-primary)' }}>{result.totalInsertions}</strong></div>
          <div>Corrections: <strong style={{ color: 'var(--color-accent)' }}>{result.corrections}</strong></div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '30px', flexWrap: 'wrap' }}>
          <button className="glass-btn primary" onClick={onTryAgain} style={{ padding: '12px 24px' }}>
            <RotateCcw size={16} /> Retake Test
          </button>
          <button className="glass-btn" onClick={onNavigateToPractice} style={{ padding: '12px 24px' }}>
            Practise Weak Areas <ArrowRight size={16} />
          </button>
          <button className="glass-btn" onClick={fetchAiFeedback} disabled={loadingAi} style={{ padding: '12px 24px' }}>
            <Sparkles size={16} color="var(--color-accent)" /> {loadingAi ? 'Consulting AI...' : 'Ask Gemini Coach'}
          </button>
          <button className="glass-btn" onClick={handleShare} style={{ padding: '12px 20px' }}>
            {copied ? <Check size={16} color="var(--color-success)" /> : <Share2 size={16} />}
            {copied ? 'Copied!' : 'Share Result'}
          </button>
        </div>
      </div>

      {/* Interval Trend Chart (SVG) */}
      {result.intervalData && result.intervalData.length > 1 && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <BarChart3 size={20} color="var(--color-accent)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Interval Pace & Stamina Consistency</h3>
          </div>

          <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '10px 0' }}>
            {result.intervalData.map((d, i) => {
              const maxWpm = Math.max(...result.intervalData.map(item => item.wpm), 60);
              const heightPercent = Math.min(100, Math.round((d.wpm / maxWpm) * 100));
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 700 }}>{d.wpm}</span>
                  <div style={{
                    width: '100%',
                    height: `${heightPercent}%`,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-accent)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.4s ease'
                  }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{d.second}s</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Coach Insights */}
      {aiError && (
        <div style={{ padding: '14px 20px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', color: '#fca5a5' }}>
          {aiError}
        </div>
      )}

      {aiFeedback && (
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(212, 196, 168, 0.15)', borderRadius: '10px' }}>
                <Bot size={24} color="var(--color-accent)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Gemini AI Coaching Evaluation</h3>
            </div>
            <span className="badge accent">
              {aiFeedback.source === 'gemini' ? 'Google Gemini Interactions' : 'Deterministic Rule Engine'}
            </span>
          </div>

          <p style={{ lineHeight: 1.7, color: 'var(--color-text-primary)', fontSize: '1.02rem', whiteSpace: 'pre-line' }}>
            {aiFeedback.coachSummary}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
            {aiFeedback.strengths && aiFeedback.strengths.length > 0 && (
              <div className="glass-panel-subtle" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--color-success)', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> Observed Strengths
                </h4>
                <ul style={{ paddingLeft: '18px', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {aiFeedback.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>
            )}

            {aiFeedback.recommendedDrills && aiFeedback.recommendedDrills.length > 0 && (
              <div className="glass-panel-subtle" style={{ padding: '20px' }}>
                <h4 style={{ color: 'var(--color-accent)', fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} /> Targeted Drills
                </h4>
                <ul style={{ paddingLeft: '18px', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {aiFeedback.recommendedDrills.map((d, idx) => <li key={idx}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
