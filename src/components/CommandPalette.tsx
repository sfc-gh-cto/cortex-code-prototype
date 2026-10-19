import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { commands, type Command } from '../data/commands'

export function CommandPalette({
  open,
  onClose,
  onRun,
  defaultFlags = '',
}: {
  open: boolean
  onClose: () => void
  onRun: (cmd: Command, flags?: string) => void
  defaultFlags?: string
}) {
  const [query, setQuery] = useState('>')
  const [index, setIndex] = useState(0)
  // Two-step flow: once a flag-taking command is picked, collect additional flags.
  const [pending, setPending] = useState<Command | null>(null)
  const [flags, setFlags] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const flagsRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('>')
      setIndex(0)
      setPending(null)
      setFlags('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const term = query.replace(/^>/, '').trim().toLowerCase()
  const filtered = useMemo(
    () => commands.filter((c) => `${c.category} ${c.title}`.toLowerCase().includes(term)),
    [term],
  )

  if (!open) return null

  const choose = (c: Command | undefined) => {
    if (!c) return
    if (c.takesFlags) {
      // Step 2: open the secondary flags input, prefilled with the project defaults.
      setPending(c)
      setFlags(defaultFlags)
      requestAnimationFrame(() => {
        flagsRef.current?.focus()
        flagsRef.current?.select()
      })
      return
    }
    onRun(c)
    onClose()
  }

  const runWithFlags = () => {
    if (!pending) return
    onRun(pending, flags.trim())
    onClose()
  }

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(filtered[index])
    }
  }

  const onFlagsKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      runWithFlags()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      // Back to the command list.
      setPending(null)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex justify-center" onMouseDown={onClose}>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ marginTop: 8 }}
        className="h-fit w-[600px] max-w-[90vw] overflow-hidden rounded-md border border-border-contrast bg-quickinput shadow-2xl"
      >
        {pending ? (
          // Step 2 — secondary input for additional flags.
          <>
            <div className="flex items-center gap-1 px-2 pt-2 text-[12px] text-fg-muted">
              <button
                onClick={() => {
                  setPending(null)
                  requestAnimationFrame(() => inputRef.current?.focus())
                }}
                className="flex items-center rounded px-0.5 text-fg-muted hover:text-fg"
                title="Back"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-fg-muted">{pending.category}:</span>
              <span className="text-fg">{pending.title}</span>
            </div>
            <div className="p-1">
              <input
                ref={flagsRef}
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                onKeyDown={onFlagsKeyDown}
                className="h-7 w-full rounded-sm border border-focus bg-input px-2 font-mono text-[13px] text-fg outline-none"
                placeholder="Additional flags, e.g. --full-refresh --select orders+"
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-2 text-[11.5px] text-fg-dim">
              <span>Press Enter to run on Snowflake Managed · Esc to go back</span>
            </div>
          </>
        ) : (
          // Step 1 — command list.
          <>
            <div className="p-1">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIndex(0)
                }}
                onKeyDown={onListKeyDown}
                className="h-7 w-full rounded-sm border border-focus bg-input px-2 text-[13px] text-fg outline-none"
                placeholder="Type the name of a command to run"
              />
            </div>
            <div className="max-h-[360px] overflow-y-auto pb-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-[13px] text-fg-dim">No matching commands</div>
              ) : (
                filtered.map((c, i) => (
                  <button
                    key={c.id}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => choose(c)}
                    className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] ${
                      i === index ? 'bg-list-active text-fg-bright' : 'text-fg hover:bg-hover'
                    }`}
                  >
                    <span className="text-fg-muted">{c.category}:</span>
                    <span className="flex-1 truncate">{c.title}</span>
                    {c.takesFlags && (
                      <span className="shrink-0 rounded bg-black/30 px-1 text-[10px] text-fg-dim">
                        flags
                      </span>
                    )}
                    {c.keybinding && (
                      <span className="shrink-0 font-mono text-[11px] text-fg-muted">
                        {c.keybinding}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
