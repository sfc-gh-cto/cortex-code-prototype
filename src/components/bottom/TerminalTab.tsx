import { useEffect, useRef } from 'react'
import { SplitSquareHorizontal, Trash2 } from 'lucide-react'
import { useTerminal, PROMPT_USER, PROMPT_DIR, type Entry } from './terminalStore'

function Prompt() {
  return (
    <span className="select-none">
      <span className="text-[#3fb950]">{PROMPT_USER}</span>
      <span className="px-1 text-[#4daafc]">{PROMPT_DIR}</span>
      <span className="text-text">% </span>
    </span>
  )
}

function EntryLine({ entry }: { entry: Entry }) {
  if (entry.type === 'cmd') {
    return (
      <div className="whitespace-pre-wrap break-all">
        <Prompt />
        {entry.text}
      </div>
    )
  }
  return (
    <div className={`whitespace-pre-wrap break-all ${entry.type === 'err' ? 'text-error' : 'text-text'}`}>
      {entry.text}
    </div>
  )
}

function TerminalGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 6l2.2 2L4 10M7.5 10.5h4" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TerminalTabsList() {
  const { sessions, activeId, selectTerminal, killTerminal, newTerminal } = useTerminal()
  return (
    <div className="w-[148px] shrink-0 overflow-y-auto border-l border-border bg-chrome-bg py-1 text-[12px]">
      {sessions.map((s) => {
        const active = s.id === activeId
        return (
          <div
            key={s.id}
            onClick={() => selectTerminal(s.id)}
            className={`group/t flex cursor-pointer items-center gap-1.5 px-2 py-[3px] ${
              active ? 'bg-active-list text-text-bright' : 'text-text-muted hover:bg-hover-bg'
            }`}
          >
            <TerminalGlyph />
            <span className="flex-1 truncate">{s.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                newTerminal(s.shell)
              }}
              title="Split Terminal"
              className="opacity-0 hover:text-text group-hover/t:opacity-100"
            >
              <SplitSquareHorizontal size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                killTerminal(s.id)
              }}
              title="Kill Terminal"
              className="opacity-0 hover:text-text group-hover/t:opacity-100"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function TerminalTab() {
  const { sessions, active, activeId, setInput, runCommand } = useTerminal()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [activeId])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [active?.entries.length, active?.input])

  if (!active) {
    return (
      <div className="flex h-full items-center justify-center text-[12.5px] text-text-dim">
        No terminals open. Create one with the + button.
      </div>
    )
  }

  return (
    <div className="flex h-full">
      <div
        ref={scrollRef}
        onClick={() => inputRef.current?.focus()}
        className="relative min-w-0 flex-1 cursor-text overflow-y-auto px-3 py-1.5 font-mono text-[12.5px] leading-5 text-text"
      >
        {active.entries.map((e, i) => (
          <EntryLine key={i} entry={e} />
        ))}
        {/* live, editable prompt line */}
        <div className="flex items-center whitespace-pre">
          <Prompt />
          <input
            ref={inputRef}
            value={active.input}
            onChange={(e) => setInput(active.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                runCommand(active.id)
              }
            }}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-text caret-text outline-none"
          />
        </div>
      </div>
      {sessions.length > 1 && <TerminalTabsList />}
    </div>
  )
}
