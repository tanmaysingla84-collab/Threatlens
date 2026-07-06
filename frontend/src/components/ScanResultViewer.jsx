import { motion } from 'framer-motion';

/**
 * ScanResultViewer
 * Renders the threat score dial, band, breakdown, and specific details
 * returned by the unified aggregator report.
 */
export default function ScanResultViewer({ result }) {
  if (!result) return null;

  const {
    type,
    input,
    threatScore,
    threatBand,
    scoreBreakdown = {},
    sources = [],
    sha256,
    fileMeta,
    createdAt
  } = result;

  // Band colors
  const bandColors = {
    High: {
      text: 'text-threat-high',
      bg: 'bg-threat-high/10',
      border: 'border-threat-high/20',
      glow: 'shadow-glow-red/20',
      dial: '#ef4444'
    },
    Medium: {
      text: 'text-threat-medium',
      bg: 'bg-threat-medium/10',
      border: 'border-threat-medium/20',
      glow: 'shadow-glow-orange/20',
      dial: '#f97316'
    },
    Low: {
      text: 'text-threat-low',
      bg: 'bg-threat-low/10',
      border: 'border-threat-low/20',
      glow: 'shadow-glow-yellow/20',
      dial: '#eab308'
    },
    Safe: {
      text: 'text-threat-safe',
      bg: 'bg-threat-safe/10',
      border: 'border-threat-safe/20',
      glow: 'shadow-glow-green/20',
      dial: '#22c55e'
    }
  };

  const activeBand = bandColors[threatBand] || bandColors.Safe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 mt-6"
    >
      {/* ─── Top Dashboard: Score & Metadata ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Threat Score Dial */}
        <div className={`glass-card p-6 flex flex-col items-center justify-center border ${activeBand.border} ${activeBand.glow} relative overflow-hidden`}>
          <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-4">Threat Score</p>
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circle Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="var(--color-bg-tertiary, #1f1f2e)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke={activeBand.dial}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="402"
                strokeDashoffset={402 - (402 * threatScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-mono tracking-tighter text-text-primary">{threatScore}</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${activeBand.bg} ${activeBand.text} mt-1`}>
                {threatBand}
              </span>
            </div>
          </div>
        </div>

        {/* Scan Metadata */}
        <div className="glass-card p-6 md:col-span-2 flex flex-col justify-between">
          <div>
            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-3">Scan Details</p>
            <div className="space-y-2.5">
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <span className="text-xs text-text-muted">Target Type</span>
                <span className="text-xs text-text-primary font-mono capitalize">{type}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle pb-2">
                <span className="text-xs text-text-muted">Indicator</span>
                <span className="text-xs text-accent-blue font-mono truncate max-w-md" title={input}>
                  {input}
                </span>
              </div>
              {sha256 && (
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-xs text-text-muted">SHA-256</span>
                  <span className="text-xs text-text-primary font-mono select-all">{sha256}</span>
                </div>
              )}
              {fileMeta && (
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-xs text-text-muted">File Size</span>
                  <span className="text-xs text-text-primary font-mono">
                    {(fileMeta.size / 1024).toFixed(2)} KB ({fileMeta.size} bytes)
                  </span>
                </div>
              )}
              <div className="flex justify-between pb-1">
                <span className="text-xs text-text-muted">Analyzed At</span>
                <span className="text-xs text-text-primary font-mono">
                  {new Date(createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Core Signals Breakdown */}
          <div className="mt-4 pt-4 border-t border-border-subtle flex flex-wrap gap-3">
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mr-1 flex items-center">Signals:</span>
            <SignalBadge label="VirusTotal (+40)" active={scoreBreakdown.virusTotalDetections > 0} color="red" />
            <SignalBadge label="Hybrid Analysis (+30)" active={scoreBreakdown.hybridAnalysisMalicious > 0} color="orange" />
            <SignalBadge label="MalwareBazaar (+20)" active={scoreBreakdown.malwareBazaarMatch > 0} color="yellow" />
            <SignalBadge label="AbuseIPDB (+10)" active={scoreBreakdown.abuseIpdbConfidenceHigh > 0} color="indigo" />
          </div>
        </div>
      </div>

      {/* ─── Source Integrations Results ───────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">Source Integrations Log</h3>
        <div className="space-y-4">
          {sources.map((source) => (
            <SourceCard key={source.source} source={source} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SignalBadge({ label, active, color }) {
  const colors = {
    red: active ? 'bg-threat-high/15 text-threat-high border-threat-high/30' : 'bg-bg-tertiary text-text-muted border-border-subtle opacity-40',
    orange: active ? 'bg-threat-medium/15 text-threat-medium border-threat-medium/30' : 'bg-bg-tertiary text-text-muted border-border-subtle opacity-40',
    yellow: active ? 'bg-threat-low/15 text-threat-low border-threat-low/30' : 'bg-bg-tertiary text-text-muted border-border-subtle opacity-40',
    indigo: active ? 'bg-accent-indigo/15 text-accent-indigo border-accent-indigo/30' : 'bg-bg-tertiary text-text-muted border-border-subtle opacity-40'
  };

  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${colors[color] || colors.red}`}>
      {label}
    </span>
  );
}

function SourceCard({ source }) {
  const { source: name, success, normalized, error } = source;
  
  const isNotFound = !success && error && (
    error.toLowerCase().includes('not found')
  );
  
  const displayName = name === 'threatminer' ? 'AlienVault OTX' : name;

  return (
    <div className="glass-card overflow-hidden border border-border-subtle">
      {/* Header */}
      <div className="px-5 py-3.5 bg-bg-secondary flex items-center justify-between border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase tracking-wider text-text-primary font-mono">{displayName}</span>
        </div>
        <div>
          {success ? (
            <span className="text-[10px] font-bold font-mono text-threat-safe bg-threat-safe/10 border border-threat-safe/25 px-2 py-0.5 rounded-full">
              SUCCESS
            </span>
          ) : isNotFound ? (
            <span className="text-[10px] font-bold font-mono text-threat-safe bg-threat-safe/10 border border-threat-safe/25 px-2 py-0.5 rounded-full" title={error}>
              CLEAN / UNKNOWN
            </span>
          ) : (
            <span className="text-[10px] font-bold font-mono text-threat-high bg-threat-high/10 border border-threat-high/25 px-2 py-0.5 rounded-full" title={error}>
              FAILED
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 text-xs">
        {!success ? (
          isNotFound ? (
            <p className="text-threat-safe font-mono bg-threat-safe/5 p-3 rounded-lg border border-threat-safe/10">
              No threat data found for this indicator. This is usually a good sign, meaning it hasn't been flagged as malicious by {displayName}.
            </p>
          ) : (
            <p className="text-threat-high font-mono bg-threat-high/5 p-3 rounded-lg border border-threat-high/10">
              {error || 'API configuration error or connection timed out.'}
            </p>
          )
        ) : normalized ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {/* Render dynamically depending on source */}
            {name === 'virustotal' && (
              <>
                {normalized.verdict === 'pending' ? (
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-threat-low font-mono bg-threat-low/5 p-3 rounded-lg border border-threat-low/15">
                      ⏳ URL submitted to VirusTotal — analysis still in progress.
                    </p>
                    {normalized.permalink && (
                      <a href={normalized.permalink} target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline flex items-center gap-1">
                        View VT Report when ready ↗
                      </a>
                    )}
                    {normalized.note && <p className="text-text-muted text-[11px] italic">{normalized.note}</p>}
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <p className="text-text-muted">Verdict: <span className={`font-bold ${normalized.verdict === 'clean' ? 'text-threat-safe' : 'text-threat-high'}`}>{normalized.verdict.toUpperCase()}</span></p>
                      <p className="text-text-muted">Detections: <span className="text-threat-high font-bold">{normalized.malicious}</span> / {normalized.totalEngines || (normalized.malicious + normalized.suspicious + normalized.harmless + normalized.undetected)} engines</p>
                      <p className="text-text-muted">Suspicious: <span className="text-threat-medium">{normalized.suspicious}</span></p>
                    </div>
                    <div className="space-y-1.5 flex flex-col justify-between items-start md:items-end">
                      <p className="text-text-muted">Reputation: <span className="text-accent-blue">{normalized.reputation ?? 'N/A'}</span></p>
                      {normalized.permalink && (
                        <a href={normalized.permalink} target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline mt-2 flex items-center gap-1">
                          View VT Report ↗
                        </a>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {name === 'malwarebazaar' && (
              <>
                <div className="space-y-1.5">
                  <p className="text-text-muted">Bazaar Match: <span className={`font-bold ${normalized.match ? 'text-threat-high' : 'text-text-muted'}`}>{normalized.match ? 'FOUND' : 'NOT FOUND'}</span></p>
                  {normalized.match && (
                    <>
                      <p className="text-text-muted">Signature: <span className="text-threat-high font-bold">{normalized.signature}</span></p>
                      <p className="text-text-muted">File Type: <span className="text-text-primary">{normalized.fileType}</span></p>
                    </>
                  )}
                </div>
                {normalized.match && (
                  <div className="space-y-1.5 flex flex-col justify-between items-start md:items-end">
                    <p className="text-text-muted">Size: <span className="text-text-primary">{(normalized.fileSize / 1024).toFixed(1)} KB</span></p>
                    {normalized.permalink && (
                      <a href={normalized.permalink} target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline mt-2 flex items-center gap-1">
                        View Bazaar Details ↗
                      </a>
                    )}
                  </div>
                )}
              </>
            )}

            {name === 'hybridanalysis' && (
              <>
                <div className="space-y-1.5">
                  <p className="text-text-muted">Sandbox Match: <span className={`font-bold ${normalized.match ? 'text-threat-high' : 'text-text-muted'}`}>{normalized.match ? 'FOUND' : 'NOT FOUND'}</span></p>
                  {normalized.match && (
                    <>
                      <p className="text-text-muted">Verdict: <span className={`font-bold ${normalized.verdict === 'malicious' ? 'text-threat-high' : 'text-threat-safe'}`}>{normalized.verdict.toUpperCase()}</span></p>
                      <p className="text-text-muted">Threat Score: <span className="text-text-primary font-bold">{normalized.threatScore} / 100</span></p>
                    </>
                  )}
                </div>
                {normalized.match && (
                  <div className="space-y-1.5 flex flex-col justify-between items-start md:items-end">
                    <p className="text-text-muted">Tags: <span className="text-text-primary">{normalized.behaviorTags.join(', ') || 'None'}</span></p>
                    {normalized.permalink && (
                      <a href={normalized.permalink} target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline mt-2 flex items-center gap-1">
                        View Sandbox Report ↗
                      </a>
                    )}
                  </div>
                )}
              </>
            )}

            {name === 'urlscan' && (
              <>
                {normalized.verdict === 'pending' ? (
                  <div className="md:col-span-2 space-y-2">
                    <p className="text-threat-low font-mono bg-threat-low/5 p-3 rounded-lg border border-threat-low/15">
                      ⏳ Scan submitted — URLScan.io is still processing this URL.
                    </p>
                    {normalized.permalink && (
                      <a href={normalized.permalink} target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline flex items-center gap-1">
                        View full URLScan report when ready ↗
                      </a>
                    )}
                    {normalized.note && <p className="text-text-muted text-[11px] italic">{normalized.note}</p>}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {/* Verdict badge */}
                      <p className="text-text-muted">Verdict:&nbsp;
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                          normalized.verdict === 'malicious' ? 'bg-threat-high/15 text-threat-high' :
                          normalized.verdict === 'suspicious' ? 'bg-threat-medium/15 text-threat-medium' :
                          'bg-threat-safe/15 text-threat-safe'
                        }`}>{normalized.verdict}</span>
                      </p>
                      {normalized.score > 0 && (
                        <p className="text-text-muted">Score: <span className="text-threat-medium font-bold">{normalized.score}</span></p>
                      )}
                      <p className="text-text-muted">Domain: <span className="text-text-primary font-semibold">{normalized.domain || '—'}</span></p>
                      <p className="text-text-muted">IP: <span className="text-text-primary font-mono">{normalized.ip || '—'}</span></p>
                      <p className="text-text-muted">Country: <span className="text-text-primary">{normalized.country || '—'}</span></p>
                      <p className="text-text-muted">Server: <span className="text-text-primary">{normalized.server || 'Unknown'}</span></p>
                      {normalized.redirects?.length > 0 && (
                        <p className="text-text-muted">Redirects: <span className="text-threat-medium font-bold">{normalized.redirects.length}</span> URLs observed</p>
                      )}
                      {normalized.permalink && (
                        <a href={normalized.permalink} target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline flex items-center gap-1 mt-1">
                          Full URLScan Report ↗
                        </a>
                      )}
                    </div>
                    <div className="flex justify-center md:justify-end items-start">
                      {normalized.screenshot ? (
                        <div className="relative group border border-border-subtle rounded overflow-hidden max-w-[200px] h-auto shadow">
                          <img src={normalized.screenshot} alt="URLScan Screenshot" className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <p className="text-text-muted italic">Screenshot unavailable</p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {name === 'threatminer' && (
              <>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-text-muted font-bold mb-1">Passive DNS (Top 4 records):</p>
                  {normalized.passiveDns && normalized.passiveDns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-bg-tertiary p-2.5 rounded border border-border-subtle">
                      {normalized.passiveDns.slice(0, 4).map((record, index) => (
                        <div key={index} className="flex justify-between border-b border-border-subtle/50 pb-1">
                          <span className="text-text-secondary truncate mr-2" title={record.ip || record.domain}>
                            {record.ip || record.domain}
                          </span>
                          <span className="text-text-muted">{record.last_seen || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted italic">No passive DNS entries discovered</p>
                  )}
                </div>
              </>
            )}

            {name === 'abuseipdb' && (
              <>
                <div className="space-y-1.5">
                  <p className="text-text-muted">Abuse Score: <span className={`font-bold ${normalized.abuseConfidenceScore >= 75 ? 'text-threat-high' : 'text-threat-safe'}`}>{normalized.abuseConfidenceScore}%</span></p>
                  <p className="text-text-muted">Total Reports: <span className="text-text-primary font-bold">{normalized.totalReports}</span></p>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end items-start md:items-end">
                  <p className="text-text-muted">ISP: <span className="text-text-primary">{normalized.isp}</span></p>
                  <p className="text-text-muted">Domain: <span className="text-text-primary">{normalized.domain || 'N/A'}</span></p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-text-muted italic">No parsed result returned by source.</p>
        )}
      </div>
    </div>
  );
}
