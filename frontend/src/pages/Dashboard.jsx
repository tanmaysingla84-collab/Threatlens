import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const QUICK_ACTIONS = [
  { to: '/analyze/file',   label: 'Analyze File',   desc: 'Upload & hash check',   icon: '⬡' },
  { to: '/analyze/url',    label: 'Scan URL',        desc: 'URL reputation check',  icon: '⊕' },
  { to: '/analyze/ip',     label: 'IP Lookup',       desc: 'IP abuse & geo intel',  icon: '⊗' },
  { to: '/analyze/domain', label: 'Domain Lookup',   desc: 'Passive DNS & WHOIS',   icon: '◎' },
  { to: '/analyze/hash',   label: 'Hash Lookup',     desc: 'Hash reputation check', icon: '⊞' },
];

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('threatlens_scans') || '[]');
      setHistory(stored);
    } catch (e) {
      setHistory([]);
    }
  }, []);

  const todayStr = new Date().toDateString();
  const todaysScans = history.filter(s => new Date(s.createdAt).toDateString() === todayStr).length;
  const highRiskScans = history.filter(s => s.threatBand === 'High').length;
  
  const STAT_CARDS = [
    { label: 'Total Scans', value: history.length, icon: '⬡', color: 'text-accent-blue', glow: 'shadow-glow-blue' },
    { label: "Today's Scans", value: todaysScans, icon: '◈', color: 'text-accent-purple', glow: 'shadow-glow-purple' },
    { label: 'High Risk Findings', value: highRiskScans, icon: '⊗', color: 'text-threat-high', glow: 'shadow-glow-high' },
    { label: 'API Sources Active', value: '6', icon: '⊕', color: 'text-threat-safe', glow: 'shadow-glow-safe' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your local threat intelligence operations center</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between">
              <p className="stat-label">{card.label}</p>
              <span className={`text-xl ${card.color}`}>{card.icon}</span>
            </div>
            <p className={`stat-value ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
          {history.length > 0 && (
            <Link to="/history" className="text-accent-blue text-sm hover:underline font-medium">
              View all history →
            </Link>
          )}
        </div>
        <div className="glass-card overflow-hidden">
          {history.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <span className="text-3xl text-text-tertiary mb-3">◷</span>
              <p className="text-text-primary font-semibold">No recent activity</p>
              <p className="text-text-muted text-xs mt-1">Run a scan using the quick actions below to see your activity.</p>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {history.slice(0, 5).map((scan, idx) => (
                    <motion.tr 
                      key={scan.scanId || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                      onClick={() => navigate('/history')}
                      className="hover:bg-bg-cardHover transition-colors cursor-pointer"
                    >
                      <td className="p-4 text-sm text-text-secondary whitespace-nowrap">
                        {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.to}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.25 }}
            >
              <Link
                to={action.to}
                className="glass-card p-4 flex flex-col items-center text-center gap-2 hover:border-accent-indigo/40 group"
              >
                <span className="text-2xl text-accent-indigo group-hover:text-accent-purple transition-colors">{action.icon}</span>
                <p className="text-sm font-semibold text-text-primary">{action.label}</p>
                <p className="text-xs text-text-muted">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
