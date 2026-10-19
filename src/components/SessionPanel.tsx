import {
  Plus,
  ChevronDown,
  History,
  MoreHorizontal,
  Maximize2,
  X,
  Copy,
  Pencil,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  PanelRight,
  ArrowUp,
} from 'lucide-react'
import {
  sessionTitle,
  sessionSql,
  sessionError,
  dbtRunSummary,
} from '../data/mockData'

function ToolIcon({ children }: { children: React.ReactNode }) {
  return <button className="text-text-muted hover:text-text">{children}</button>
}

export function SessionPanel({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex w-full min-w-0 flex-col bg-chrome-bg">
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        <span>Session</span>
        <div className="flex items-center gap-2.5">
          <ToolIcon><Plus size={14} /></ToolIcon>
          <ToolIcon><ChevronDown size={13} /></ToolIcon>
          <ToolIcon><History size={14} /></ToolIcon>
          <ToolIcon><MoreHorizontal size={15} /></ToolIcon>
          <ToolIcon><Maximize2 size={13} /></ToolIcon>
          <button onClick={onClose} title="Close Session" className="text-text-muted hover:text-text">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Workspace subtitle */}
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text">
          {sessionTitle}
        </span>
        <PanelRight size={14} className="text-text-muted" />
      </div>

      {/* Conversation */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3 text-[13px] leading-relaxed text-text">
        {/* SQL card */}
        <div className="overflow-hidden rounded-md border border-border-strong">
          <div className="flex items-center justify-between bg-app-bg/50 px-2.5 py-1 text-[11px] text-text-muted">
            <span>SQL</span>
            <div className="flex items-center gap-2">
              <Copy size={12} className="hover:text-text" />
              <Pencil size={12} className="hover:text-text" />
            </div>
          </div>
          <pre className="whitespace-pre-wrap break-words bg-editor-bg px-2.5 py-2 font-mono text-[12px] text-text">
            {sessionSql}
          </pre>
        </div>

        {/* Result card */}
        <div>
          <div className="mb-1 text-[11px] text-text-muted">Result</div>
          <pre className="whitespace-pre-wrap break-words rounded-md border border-border-strong bg-editor-bg px-2.5 py-2 font-mono text-[12px] text-[#f0a0a0]">
            {sessionError}
          </pre>
        </div>

        {/* AI explanation */}
        <p>
          The <code className="rounded bg-input-bg px-1 font-mono text-[12px] text-syntax-key">WAREHOUSE</code>{' '}
          parameter isn't valid there. Let me try a different approach — running it without that
          parameter and see what happens, or try the correct syntax:
        </p>

        {/* action pill */}
        <div className="flex items-center justify-between rounded-md border border-border-strong bg-app-bg/40 px-2.5 py-1.5">
          <span className="flex items-center gap-2 font-mono text-[12px] text-text-muted">
            <span className="text-text-dim">{'</>'}</span>
            Check syntax for EXECUTE DBT PROJECT
          </span>
          <Check size={14} className="text-[#3fb950]" />
        </div>

        <p>The dbt project compiled successfully. Here's the summary:</p>

        {/* summary bullets */}
        <ul className="space-y-1.5">
          {dbtRunSummary.map((row) => (
            <li key={row.label} className="flex gap-1.5">
              <span className="text-text-muted">•</span>
              <span>
                <span className="font-semibold">{row.label}:</span>{' '}
                {row.label === 'Target' ? (
                  <>
                    <code className="rounded bg-input-bg px-1 font-mono text-[11px] text-syntax-key">dev</code>{' '}
                    with 8 threads concurrency
                  </>
                ) : (
                  row.value
                )}
              </span>
            </li>
          ))}
        </ul>

        <p>
          There are a few <span className="font-semibold">deprecation warnings</span> about{' '}
          <code className="rounded bg-input-bg px-1 font-mono text-[12px] text-syntax-key">relationships</code>{' '}
          tests using top-level arguments instead of nesting them under the{' '}
          <code className="rounded bg-input-bg px-1 font-mono text-[12px] text-syntax-key">arguments</code>{' '}
          property, but these are non-blocking warnings (4 occurrences).
        </p>

        <p>
          It looks like the earlier warehouse error may have been a transient issue or the warehouse
          wasn't active at the time. It compiled fine now.
        </p>

        {/* feedback row */}
        <div className="flex items-center gap-3 text-text-muted">
          <RefreshCw size={13} className="hover:text-text" />
          <Copy size={13} className="hover:text-text" />
          <Undo />
          <ThumbsUp size={13} className="hover:text-text" />
          <ThumbsDown size={13} className="hover:text-text" />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 p-2">
        <div className="rounded-md border border-border-strong bg-editor-bg focus-within:border-accent">
          <textarea
            rows={2}
            placeholder="Describe a task or ask anything, / for skills, @ for context"
            className="w-full resize-none bg-transparent px-2.5 py-2 text-[13px] text-text outline-none placeholder:text-text-dim"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1.5">
              <button className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:bg-hover-bg hover:text-text">
                <Plus size={15} />
              </button>
              <button className="flex h-6 items-center gap-1 rounded px-1.5 text-[12px] text-text-muted hover:bg-hover-bg hover:text-text">
                <span className="text-syntax-key">⬡</span> Agent <ChevronDown size={12} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="flex h-6 items-center gap-1 rounded px-1.5 text-[12px] text-text-muted hover:bg-hover-bg hover:text-text">
                Auto <ChevronDown size={12} />
              </button>
              <button className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white hover:bg-accent-hover">
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 px-1 pt-1.5 text-[11px] text-text-muted">
          <Check size={12} /> Default Approvals <ChevronDown size={11} />
        </div>
      </div>
    </div>
  )
}

function Undo() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" className="text-text-muted hover:text-text">
      <path
        d="M4 5H9.5a3.5 3.5 0 010 7H6M4 5l2.5-2.5M4 5l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
