import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* ─── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border-subtle bg-bg-secondary">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border-subtle flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-glow-blue group-hover:shadow-glow-purple transition-shadow duration-300">
              TL
            </div>
            <div>
              <span className="font-bold text-sm text-gradient">ThreatLens</span>
              <p className="text-[10px] text-text-muted leading-none mt-0.5">SOC Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">Analysis</p>
          {NAV_ITEMS.slice(0, 1).map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}

          <div className="border-t border-border-subtle my-3" />
          <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">Scan Targets</p>
          {NAV_ITEMS.slice(1, 6).map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}

          <div className="border-t border-border-subtle my-3" />
          <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">History</p>
          {NAV_ITEMS.slice(6).map((item) => (
            <SidebarLink key={item.to} item={item} />
          ))}


        </nav>


      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-secondary/60 backdrop-blur-sm flex-shrink-0">
          <div />
          <div className="flex items-center gap-3">
            {/* DB connection indicator */}
            <span className="flex items-center gap-1.5 text-xs text-text-muted font-mono px-2.5 py-1 rounded-lg bg-bg-tertiary border border-border-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-threat-safe animate-pulse" />
              Live
            </span>
            <span className="text-xs text-text-muted font-mono px-2.5 py-1 rounded-lg bg-bg-tertiary border border-border-subtle">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            key={window.location.pathname}
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

function SidebarLink({ item }) {
  return (
    <NavLink
      to={item.to}
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
