import { useEffect, useState } from 'react'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { ProblemsTab } from './ProblemsTab'
import { OutputTab } from './OutputTab'
import { TerminalTab } from './TerminalTab'
import { TerminalToolbar } from './TerminalToolbar'
import { OutputToolbar } from './OutputToolbar'
import { SqlResultsTab, type PreviewState } from './SqlResultsTab'
import { SqlResultsToolbar, type SqlView } from './SqlResultsToolbar'
import { DbtTab } from './DbtTab'
import { PerformanceTab } from './PerformanceTab'
import { PortsTab } from './PortsTab'
import type { OutputLine } from '../../data/dbtOutput'

export type BottomTab = 'problems' | 'output' | 'terminal' | 'sql' | 'ports' | 'dbt' | 'performance'

type TabDef = { id: BottomTab; label: string }

// Always-present workbench tabs.
const PERMANENT_TABS: TabDef[] = [
  { id: 'problems', label: 'Problems' },
  { id: 'output', label: 'Output' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'sql', label: 'SQL Results' },
  { id: 'ports', label: 'Ports' },
]

// dbt-project-scoped tabs — their content follows the active dbt project.
const DBT_TABS: TabDef[] = [
  { id: 'dbt', label: 'Lineage' },
  { id: 'performance', label: 'Performance' },
]

export function BottomPanel({
  tab,
  onTabChange,
  onClose,
  maximized,
  onToggleMaximize,
  preview,
  onOpenResultsInEditor,
  outputChannel,
  onOutputChannelChange,
  dbtOutput,
  dbtRunning,
  onClearOutput,
  project,
  lineageNode,
  onLineageNodeChange,
  onOpenFile,
}: {
  tab: BottomTab
  onTabChange: (tab: BottomTab) => void
  onClose?: () => void
  maximized: boolean
  onToggleMaximize: () => void
  preview: PreviewState | null
  onOpenResultsInEditor?: (model: string) => void
  outputChannel: string
  onOutputChannelChange: (channel: string) => void
  dbtOutput: OutputLine[]
  dbtRunning: boolean
  onClearOutput?: () => void
  project: string
  lineageNode: string | null
  onLineageNodeChange: (nodeId: string) => void
  onOpenFile: (name: string) => void
}) {
  // SQL Results view (Results / Query History): default to results once some exist.
  const [sqlView, setSqlView] = useState<SqlView>(preview ? 'results' : 'history')
  useEffect(() => {
    if (preview) setSqlView('results')
  }, [preview?.key])

  const hasTabToolbar =
    tab === 'terminal' || tab === 'output' || tab === 'sql'

  const renderTab = (t: TabDef) => (
    <button
      key={t.id}
      onClick={() => onTabChange(t.id)}
      className={`relative px-3 text-[11px] font-medium uppercase tracking-wide ${
        tab === t.id ? 'text-text-bright' : 'text-text-muted hover:text-text'
      }`}
    >
      {t.label}
      {tab === t.id && (
        <span className="absolute -bottom-px left-2 right-2 h-0.5 bg-accent" />
      )}
    </button>
  )

  return (
    <div className="flex h-full flex-col bg-app-bg">
      {/* tab strip */}
      <div className="flex h-9 shrink-0 items-center justify-between border-t border-border pl-2">
        <div className="flex items-stretch">
          {PERMANENT_TABS.map(renderTab)}
          {/* divider between permanent tabs and the dbt-project-scoped tabs */}
          <span className="mx-1.5 h-4 w-px self-center bg-border" />
          {DBT_TABS.map(renderTab)}
        </div>
        <div className="flex items-center gap-1 pr-2 text-text-muted">
          {/* Per-tab toolbar (left of the divider) */}
          {tab === 'terminal' && <TerminalToolbar />}
          {tab === 'output' && (
            <OutputToolbar
              channel={outputChannel}
              onChannelChange={onOutputChannelChange}
              onClear={onClearOutput}
            />
          )}
          {tab === 'sql' && <SqlResultsToolbar view={sqlView} onViewChange={setSqlView} />}
          {hasTabToolbar && <span className="mx-1 h-4 w-px bg-border" />}

          {/* Global panel actions (present on every tab) */}
          <button
            onClick={onToggleMaximize}
            title={maximized ? 'Restore Panel Size' : 'Maximize Panel Size'}
            className="rounded p-1 hover:bg-hover-bg hover:text-text"
          >
            {maximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button onClick={onClose} title="Close Panel" className="rounded p-1 hover:bg-hover-bg hover:text-text">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'problems' && <ProblemsTab />}
        {tab === 'output' && (
          <OutputTab channel={outputChannel} dbtOutput={dbtOutput} running={dbtRunning} />
        )}
        {tab === 'terminal' && <TerminalTab />}
        {tab === 'sql' && (
          <SqlResultsTab view={sqlView} preview={preview} onOpenInEditor={onOpenResultsInEditor} />
        )}
        {tab === 'dbt' && (
          <DbtTab
            project={project}
            selected={lineageNode}
            onSelect={onLineageNodeChange}
            onOpenFile={onOpenFile}
          />
        )}
        {tab === 'performance' && <PerformanceTab project={project} onOpenFile={onOpenFile} />}
        {tab === 'ports' && <PortsTab />}
      </div>
    </div>
  )
}
