import { useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ScanResultViewer from '../components/ScanResultViewer';

export default function UrlAnalysis() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Automatically prefix with http:// if protocol not supplied
    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'http://' + targetUrl;
    }

    try {
      const response = await api.post('/analyze/url', { url: targetUrl });
      const scanResult = response.data?.data;
      
      if (scanResult) {
        setResult(scanResult);

        // Save scan payload to browser localStorage (Phase 6 history compatibility)
        const history = JSON.parse(localStorage.getItem('threatlens_scans') || '[]');
        history.unshift(scanResult);
        localStorage.setItem('threatlens_scans', JSON.stringify(history));
      } else {
        throw new Error('Analysis report empty');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'An error occurred during URL scanning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="text-xl font-bold text-text-primary">URL Analysis</h1>
        <p className="text-text-muted text-xs">Analyze suspicious links for redirect chains, server headers, screenshots, and reputation alerts</p>
      </div>

      <div className="glass-card p-6 border border-border-subtle">
        <form onSubmit={handleScan} className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs font-semibold select-none font-mono">⊕</span>
            <input
              type="text"
              placeholder="Enter suspicious link (e.g., example.com/malicious-payload)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-default hover:border-border-hover focus:border-accent-blue rounded-xl py-2.5 pl-10 pr-4 text-xs text-text-primary focus:outline-none transition-colors"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!urlInput.trim() || loading}
            className="px-5 py-2.5 bg-gradient-primary hover:bg-gradient-hover text-white text-xs font-bold rounded-xl shadow-glow-blue disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 flex items-center gap-2 flex-shrink-0"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Scanning...
              </>
            ) : (
              'Scan Link'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-threat-high/10 border border-threat-high/20 rounded-xl text-threat-high text-xs font-mono">
          [ERROR] {error}
        </div>
      )}

      <ScanResultViewer result={result} />
    </div>
  );
}
