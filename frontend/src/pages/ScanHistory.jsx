import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScanResultViewer from '../components/ScanResultViewer';

export default function ScanHistory() {
  const [history, setHistory] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('threatlens_scans') || '[]');
      setHistory(stored);
    } catch (e) {
      setHistory([]);
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local scan history?')) {
      localStorage.removeItem('threatlens_scans');
      setHistory([]);
      setSelectedScan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex justify-between items-end">
        <div>
          <h1>Scan History</h1>
          <p>Your recent scans, saved locally in your browser</p>
        </div>
        {history.length > 0 && !selectedScan && (
          <button onClick={clearHistory} className="text-xs px-3 py-1.5 rounded-lg border border-threat-high/30 text-threat-high hover:bg-threat-high/10 transition-colors">
            Clear History
          </button>
        )}
      </div>

      {selectedScan ? (
        <div className="mb-6 space-y-4">
          <button 
            onClick={() => setSelectedScan(null)}
            className="text-accent-blue text-sm hover:underline flex items-center gap-1 font-medium"
          >
            ← Back to History List
          </button>
          <ScanResultViewer result={selectedScan} />
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {history.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <span className="text-4xl text-text-tertiary mb-4">≡</span>
              <h3 className="text-lg font-bold text-text-primary">No Scan History</h3>
              <p className="text-text-muted text-sm mt-2">You haven't run any scans yet. Run a scan to see it saved here locally.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-secondary border-b border-border-subtle">
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Indicator</th>
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Verdict</th>
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider">Score</th>
                    <th className="p-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {history.map((scan, idx) => (
                    <motion.tr 
                      key={scan.scanId || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-bg-cardHover transition-colors"
                    >
                      <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                        {new Date(scan.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm font-mono uppercase text-accent-indigo">
                        {scan.type}
                      </td>
                      <td className="p-4 text-sm font-mono text-text-primary truncate max-w-[200px]" title={scan.input}>
                        {scan.input}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          scan.threatBand === 'High' ? 'bg-threat-high/15 text-threat-high border border-threat-high/30' :
                          scan.threatBand === 'Medium' ? 'bg-threat-medium/15 text-threat-medium border border-threat-medium/30' :
                          scan.threatBand === 'Low' ? 'bg-threat-low/15 text-threat-low border border-threat-low/30' :
                          'bg-threat-safe/15 text-threat-safe border border-threat-safe/30'
                        }`}>
                          {scan.threatBand}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-mono text-text-secondary">
                        {scan.threatScore}/100
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setSelectedScan(scan)}
                          className="bg-bg-tertiary hover:bg-bg-secondary border border-border-subtle text-text-primary text-xs py-1.5 px-3 rounded-lg transition-colors"
                        >
                          View Report
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
