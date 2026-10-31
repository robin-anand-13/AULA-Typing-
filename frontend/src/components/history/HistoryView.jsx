import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/apiClient.js';
import { History, Calendar, Award, Zap, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

export default function HistoryView() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiRequest('/api/v1/typing/history'),
      apiRequest('/api/v1/analytics/summary')
    ])
      .then(([histRes, sumRes]) => {
        setHistory(histRes.data || []);
        setSummary(sumRes.data || null);
      })
      .catch(err => {
        setError('Failed to fetch historical benchmarks: ' + err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Aggregated Analytics Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>ALL-TIME BEST</span>
              <Award size={18} color="var(--color-accent)" />
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--color-accent)', margin: '6px 0' }}>
              {summary.bestWpm}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Net Words / Minute</span>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>AVERAGE VELOCITY</span>
              <Zap size={18} />
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, margin: '6px 0' }}>
              {summary.averageWpm}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Across all attempts</span>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>MEAN ACCURACY</span>
              <ShieldCheck size={18} color="var(--color-success)" />
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, color: 'var(--color-success)', margin: '6px 0' }}>
              {summary.averageAccuracy}%
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Precision baseline</span>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>TESTS RECORDED</span>
              <Clock size={18} />
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 800, margin: '6px 0' }}>
              {summary.totalTests}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>MongoDB verified</span>
          </div>
        </div>
      )}

      {/* Main Attempts History Table */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History size={22} color="var(--color-accent)" />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>MongoDB Performance History</h3>
          </div>
          <span className="badge accent">Anonymous Visitor Continuity</span>
        </div>

        {error && (
          <div style={{ padding: '14px 20px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Retrieving benchmark attempts from database...
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Saved Benchmarks Yet</h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Take your first test on the Typing Test tab. All attempts are saved automatically to MongoDB!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.map((item, idx) => (
              <div
                key={item.sessionId || idx}
                className="glass-panel-subtle"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 24px',
                  flexWrap: 'wrap',
                  gap: '14px',
                  transition: 'background 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                    {item.passageTitle || 'Typing Benchmark'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Calendar size={13} /> {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'} · {item.durationSeconds || 60}s duration
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                      {item.netWpm}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>NET WPM</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
                      {item.accuracy}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>ACCURACY</div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'none', minWidth: '60px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.grossWpm}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>GROSS</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
