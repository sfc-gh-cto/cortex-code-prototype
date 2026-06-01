import { useState } from 'react'
import { Copy } from 'lucide-react'
import { queryHistory } from '../../data/mockData'

export function SqlResultsTab() {
  const [sub, setSub] = useState<'results' | 'history'>('history')

  return (
    <div className="flex h-full flex-col">
      {/* sub tabs */}
      <div className="flex items-center gap-4 border-b border-border px-3">
        <button
          onClick={() => setSub('results')}
          className={`border-b-2 py-1.5 text-[12px] ${
            sub === 'results'
              ? 'border-accent text-text-bright'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Results
        </button>
        <button
          onClick={() => setSub('history')}
          className={`border-b-2 py-1.5 text-[12px] ${
            sub === 'history'
              ? 'border-accent text-text-bright'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          Query History
        </button>
      </div>

      {sub === 'history' ? (
        <div className="flex-1 overflow-y-auto">
          {queryHistory.map((row, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 border-b border-border/50 px-3 py-2 text-[12px] hover:bg-hover-bg"
            >
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                  row.status === 'success' ? 'bg-[#3fb950]' : 'bg-[#f14c4c]'
                }`}
              />
              <span className="w-20 shrink-0 text-text-muted">{row.time}</span>
              <span className="w-12 shrink-0 text-text-muted">{row.duration}</span>
              <span className="truncate font-mono text-text">{row.query}</span>
              {row.id && (
                <span className="ml-auto flex items-center gap-1 rounded bg-input-bg px-2 py-0.5 font-mono text-[11px] text-text-muted">
                  {row.id}
                  <Copy size={11} />
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-[13px] text-text-muted">
          Run a query to see results
        </div>
      )}
    </div>
  )
}
