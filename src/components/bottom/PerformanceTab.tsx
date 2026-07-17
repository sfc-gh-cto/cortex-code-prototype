import { CheckCircle2, XCircle, Clock, Database } from 'lucide-react'
import { performanceByProject } from '../../data/mockData'

// Human-readable duration: 480 → "480ms", 4200 → "4.2s".
function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function fmtRows(n: number): string {
  return n.toLocaleString('en-US')
}

// Per-project dbt model execution stats. `project` is the active dbt project,
// driven by the command bar's project selector (linked in Shell).
export function PerformanceTab({
  project,
  onOpenFile,
}: {
  project: string
  onOpenFile: (name: string) => void
}) {
  const perf = performanceByProject[project]

  if (!perf || perf.models.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-[13px] text-text-muted">
        No performance data for {project}. Run the project to collect model timings.
      </div>
    )
  }

  const slowest = Math.max(...perf.models.map((m) => m.durationMs))
  // Slowest models first — that's what the user is usually hunting for.
  const models = [...perf.models].sort((a, b) => b.durationMs - a.durationMs)

  return (
    <div className="flex h-full flex-col">
      {/* summary bar */}
      <div className="flex h-7 shrink-0 items-center gap-4 border-b border-border px-3 text-[11px] text-text-muted">
        <span>
          <span className="text-text">{perf.models.length}</span> models
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> <span className="text-text">{fmtDuration(perf.totalMs)}</span> total
        </span>
        <span className="text-text-dim">last run at {perf.invokedAt}</span>
      </div>

      {/* model timing table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-chrome-bg text-left text-[11px] text-text-muted">
              <th className="border-b border-border px-3 py-1.5 font-semibold">Model</th>
              <th className="w-24 border-b border-border px-3 py-1.5 text-right font-semibold">Rows</th>
              <th className="w-64 border-b border-border px-3 py-1.5 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => {
              const pct = slowest > 0 ? Math.max(4, (m.durationMs / slowest) * 100) : 0
              const file = `${m.model}.${m.language === 'python' ? 'py' : 'sql'}`
              return (
                <tr
                  key={m.model}
                  onClick={() => onOpenFile(file)}
                  className="cursor-pointer hover:bg-hover-bg"
                >
                  <td className="border-b border-border px-3 py-1.5">
                    <span className="flex items-center gap-1.5">
                      {m.status === 'success' ? (
                        <CheckCircle2 size={13} className="shrink-0 text-[#4ec9b0]" />
                      ) : (
                        <XCircle size={13} className="shrink-0 text-[#f14c4c]" />
                      )}
                      <span className="font-mono text-text">{m.model}</span>
                      {m.language === 'python' && (
                        <span className="rounded bg-[#3776ab]/20 px-1 text-[9px] font-medium uppercase tracking-wide text-[#6ca8dd]">
                          py
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="border-b border-border px-3 py-1.5 text-right font-mono text-text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Database size={11} className="text-text-dim" />
                      {fmtRows(m.rows)}
                    </span>
                  </td>
                  <td className="border-b border-border px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-input-bg">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-14 shrink-0 text-right font-mono text-text-muted">
                        {fmtDuration(m.durationMs)}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
