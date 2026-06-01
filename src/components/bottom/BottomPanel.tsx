import { useState } from 'react'
import { ChevronUp, X } from 'lucide-react'
import { ProblemsTab } from './ProblemsTab'
import { OutputTab } from './OutputTab'
import { TerminalTab } from './TerminalTab'
import { SqlResultsTab } from './SqlResultsTab'
import { DbtTab } from './DbtTab'
import { PortsTab } from './PortsTab'

type Tab = 'problems' | 'output' | 'terminal' | 'sql' | 'dbt' | 'ports'

const TABS: { id: Tab; label: string }[] = [
  { id: 'problems', label: 'Problems' },
  { id: 'output', label: 'Output' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'sql', label: 'SQL Results' },
  { id: 'dbt', label: 'DBT' },
  { id: 'ports', label: 'Ports' },
]

export function BottomPanel({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>('dbt')

  return (
    <div className="flex h-full flex-col bg-app-bg">
      {/* tab strip */}
      <div className="flex h-9 shrink-0 items-center justify-between border-t border-border pl-2">
        <div className="flex items-stretch">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-3 text-[11px] font-medium uppercase tracking-wide ${
                tab === t.id ? 'text-text-bright' : 'text-text-muted hover:text-text'
              }`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute -bottom-px left-2 right-2 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-3 text-text-muted">
          <button onClick={onClose} title="Hide Panel" className="hover:text-text">
            <ChevronUp size={15} className="rotate-180" />
          </button>
          <button onClick={onClose} title="Close Panel" className="hover:text-text">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'problems' && <ProblemsTab />}
        {tab === 'output' && <OutputTab />}
        {tab === 'terminal' && <TerminalTab />}
        {tab === 'sql' && <SqlResultsTab />}
        {tab === 'dbt' && <DbtTab />}
        {tab === 'ports' && <PortsTab />}
      </div>
    </div>
  )
}
