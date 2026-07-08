import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { to: '/dashboard',        label: 'Dashboard',       icon: '◈' },
  { to: '/analyze/file',     label: 'File Analysis',   icon: '⬡' },
  { to: '/analyze/url',      label: 'URL Scan',        icon: '⊕' },
  { to: '/analyze/ip',       label: 'IP Lookup',       icon: '⊗' },
  { to: '/analyze/domain',   label: 'Domain Lookup',   icon: '◎' },
  { to: '/analyze/hash',     label: 'Hash Lookup',     icon: '⊞' },
  { to: '/history',          label: 'Scan History',    icon: '≡' },
];

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col border-r border-border-subtle bg-bg-secondary transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border-subtle flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 group" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-glow-blue group-hover:shadow-glow-purple transition-shadow duration-300">
              TL
            </div>
            <div>
              <span className="font-bold text-sm text-gradient">ThreatXLens</span>
              <p className="text-[10px] text-text-muted leading-none mt-0.5">SOC Platform</p>
            </div>
          </Link>
          <button 
            className="md:hidden text-text-muted hover:text-text-primary p-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">Analysis</p>
          {NAV_ITEMS.slice(0, 1).map((item) => (
            <SidebarLink key={item.to} item={item} onClick={() => setIsMobileMenuOpen(false)} />
          ))}

          <div className="border-t border-border-subtle my-3" />
          <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">Scan Targets</p>
          {NAV_ITEMS.slice(1, 6).map((item) => (
            <SidebarLink key={item.to} item={item} onClick={() => setIsMobileMenuOpen(false)} />
          ))}

          <div className="border-t border-border-subtle my-3" />
          <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">History</p>
          {NAV_ITEMS.slice(6).map((item) => (
            <SidebarLink key={item.to} item={item} onClick={() => setIsMobileMenuOpen(false)} />
          ))}
        </nav>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-border-subtle bg-bg-secondary/60 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-text-secondary hover:text-text-primary p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="text-xl">☰</span>
            </button>
            <div className="md:hidden font-bold text-sm text-gradient ml-2">ThreatXLens</div>
          </div>
          <div className="flex items-center gap-3">
            {/* DB connection indicator */}
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted font-mono px-2.5 py-1 rounded-lg bg-bg-tertiary border border-border-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-threat-safe animate-pulse" />
              Live
            </span>
            <span className="text-xs text-text-muted font-mono px-2.5 py-1 rounded-lg bg-bg-tertiary border border-border-subtle">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
         ${isActive
           ? 'bg-accent-indigo/12 text-accent-indigo border border-accent-indigo/25 shadow-glow-blue/10'
           : 'text-text-secondary hover:text-text-primary hover:bg-bg-cardHover'
         }`
      }
    >
      <span className="text-base w-5 text-center">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}
