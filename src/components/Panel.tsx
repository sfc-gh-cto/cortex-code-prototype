import { Columns2, X, ChevronDown, Ellipsis } from 'lucide-react'
import type { OutputLine, Tone } from '../data/runOutput'
import { previewColumns, previewRows } from '../data/runOutput'
import { LineageView } from './views/LineageView'
import { useState } from 'react'

export type PanelTab = 'problems' | 'output' | 'terminal' | 'results' | 'lineage'

const TABS: { id: PanelTab; label: string }[] = [
  { id: 'problems', label: 'Problems' },
  { id: 'output', label: 'Output' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'results', label: 'Query Results' },
  { id: 'lineage', label: 'Lineage' },
]

const TONE_COLOR: Record<Tone, string> = {
  text: 'var(--color-fg)',
  muted: 'var(--color-fg-dim)',
  cmd: 'var(--color-sx-variable)',
  ok: 'var(--color-success)',
  warn: 'var(--color-warn)',
  err: 'var(--color-error)',
  info: 'var(--color-snowflake)',
}

function OutputPane({ lines }: { lines: OutputLine[] }) {
  return (
    <div className="h-full overflow-auto px-3 py-1.5 font-mono text-[12.5px] leading-[18px]">
      {lines.length === 0 ? (
        <div className="text-fg-dim">No output yet. Run a dbt command to see logs here.</div>
      ) : (
        lines.map((l, i) =>
          l ? (
            <div key={i} className="whitespace-pre-wrap" style={{ color: TONE_COLOR[l.tone] }}>
              {l.text || '\u00a0'}
            </div>
          ) : null,
        )
      )}
    </div>
  )
}

function ResultsPane({ hasRun }: { hasRun: boolean }) {
  if (!hasRun) {
    return (
      <div className="flex h-full items-center justify-center text-[12.5px] text-fg-dim">
        Run <span className="mx-1 font-mono text-fg-muted">dbt: Preview</span> on a model to see
        query results.
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-3 py-1 text-[11.5px] text-fg-muted">
        <span className="font-semibold text-fg">ORDERS</span>
        <span>{previewRows.length} rows</span>
        <span>·</span>
        <span>0.42s</span>
        <span>·</span>
        <span>2.1 MB scanned</span>
        <span>·</span>
        <span className="text-snowflake">DBT_WH (X-Small)</span>
        <span>·</span>
        <span className="font-mono">query 01b2c3d4-0000-a1b2</span>
        <div className="flex-1" />
        <button className="flex items-center gap-1 text-link hover:underline">
          Open in Snowsight
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr className="sticky top-0 bg-tab-inactive">
              {previewColumns.map((c) => (
                <th
                  key={c}
                  className="border-b border-r border-border px-3 py-1 text-left font-semibold text-fg"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-hover">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="border-b border-r border-border px-3 py-1 font-mono text-fg"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TerminalPane() {
  return (
    <div className="h-full overflow-auto px-3 py-1.5 font-mono text-[12.5px] leading-[18px] text-fg">
      <div>
        <span className="text-success">tasty_bytes</span>
        <span className="text-fg-muted"> on </span>
        <span className="text-sx-variable">main</span>
        <span className="text-fg-muted"> via </span>
        <span className="text-snowflake">❄ Snowflake Managed</span>
      </div>
      <div className="mt-0.5">
        <span className="text-sx-keyword">$</span> <span className="animate-pulse">▋</span>
      </div>
    </div>
  )
}

function ProblemsPane() {
  return (
    <div className="flex h-full items-center justify-center text-[12.5px] text-fg-dim">
      No problems have been detected in the workspace.
    </div>
  )
}

export function Panel({
  tab,
  onTab,
  onClose,
  outputLines,
  hasPreview,
  lineageModel,
}: {
  tab: PanelTab
  onTab: (t: PanelTab) => void
  onClose: () => void
  outputLines: OutputLine[]
  hasPreview: boolean
  lineageModel: string
}) {
  const [showColumns, setShowColumns] = useState(false)
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden border-t border-panel-border bg-panel">
      {/* Header: tabs + actions. Same 35px title row as the editor tabs. */}
      <div className="flex h-[35px] shrink-0 items-center justify-between pr-1">
        <div className="flex h-full items-stretch">
          {TABS.map((t) => {
            const active = t.id === tab
            return (
              <button
                key={t.id}
                onClick={() => onTab(t.id)}
                className={`relative flex items-center px-2.5 text-[11px] font-normal tracking-wide uppercase ${
                  active ? 'text-fg-bright' : 'text-fg-muted hover:text-fg'
                }`}
              >
                {t.label}
                {active && <span className="absolute inset-x-0 bottom-0 h-px bg-fg-bright" />}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1">
          {tab === 'output' && (
            <button className="flex h-6 items-center gap-1 rounded border border-border-contrast bg-dropdown px-2 text-[12px] text-fg">
              dbt
              <ChevronDown size={13} className="text-icon" />
            </button>
          )}
          {tab === 'lineage' && (
            <button
              title="Column lineage"
              onClick={() => setShowColumns((s) => !s)}
              className={`flex h-6 items-center gap-1 rounded px-1.5 text-[12px] hover:bg-hover ${
                showColumns ? 'text-fg-bright' : 'text-fg-muted'
              }`}
            >
              <Columns2 size={13} />
              Columns
            </button>
          )}
          <button className="flex h-6 w-6 items-center justify-center rounded text-icon hover:bg-hover">
            <Ellipsis size={16} />
          </button>
          <button
            onClick={onClose}
            title="Close Panel"
            className="flex h-6 w-6 items-center justify-center rounded text-icon hover:bg-hover"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'output' && <OutputPane lines={outputLines} />}
        {tab === 'results' && <ResultsPane hasRun={hasPreview} />}
        {tab === 'terminal' && <TerminalPane />}
        {tab === 'problems' && <ProblemsPane />}
        {tab === 'lineage' && (
          <div className="flex h-full min-h-0 flex-col">
            <LineageView model={lineageModel} showColumns={showColumns} />
          </div>
        )}
      </div>
    </div>
  )
}
