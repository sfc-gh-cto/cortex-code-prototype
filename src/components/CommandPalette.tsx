import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search } from 'lucide-react'
import { recentFiles } from '../data/files'
import { FileIcon } from './FileIcon'

type Provider = { label: string; hint?: string; shortcut?: string; prefix?: string }

const providers: Provider[] = [
  { label: 'Go to File', prefix: '' },
  { label: 'Show and Run Commands', hint: '>', shortcut: '⇧⌘P', prefix: '> ' },
  { label: 'Search for Text', hint: '%', prefix: '% ' },
  { label: 'Open Quick Chat', shortcut: '⌃⌘L' },
  { label: 'Open Agentic Browser', shortcut: '⌥⌘B' },
  { label: 'Go to Symbol in Editor', hint: '@', prefix: '@' },
  { label: 'Run Task', hint: 'task', prefix: 'task ' },
  { label: 'More', hint: '?', prefix: '?' },
]

const PREFIXES = ['>', '@', '%', '?', ':', 'task ']

export function CommandPalette({
  label,
  onOpenFile,
}: {
  label: string
  onOpenFile: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return
      if (triggerRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
    else setQuery('')
  }, [open])

  const q = query.trim().toLowerCase()
  const inCommandMode = PREFIXES.some((p) => q.startsWith(p.trim()) && p.trim() !== '')
  const showProviders = q === '' || inCommandMode
  const fileList =
    q === ''
      ? recentFiles
      : inCommandMode
        ? []
        : recentFiles.filter((f) => f.name.toLowerCase().includes(q))

  function pickProvider(p: Provider) {
    setQuery(p.prefix ?? '')
    inputRef.current?.focus()
  }

  function pickFile(name: string) {
    onOpenFile(name)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        className="flex h-6 w-[460px] max-w-[50%] items-center justify-center gap-2 rounded-md border border-border-strong bg-app-bg/60 px-3 text-text-muted hover:bg-app-bg"
      >
        <Search size={11} />
        <span className="truncate text-[12px] text-text">{label}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: 32, left: '50%', transform: 'translateX(-50%)', width: 600 }}
            className="z-[1000] overflow-hidden rounded-md border border-[#454545] bg-[#252526] shadow-2xl"
          >
            {/* search input */}
            <div className="p-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files by name (append : to go to line or @ to go to symbol)"
                className="h-7 w-full rounded border border-focus bg-input-bg px-2 text-[13px] text-text outline-none placeholder:text-text-dim"
              />
            </div>

            <div className="max-h-[420px] overflow-y-auto pb-1">
              {showProviders &&
                providers.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => pickProvider(p)}
                    className="group/row flex w-full items-center gap-2 px-3 py-[5px] text-left text-[13px] text-text hover:bg-accent hover:text-white"
                  >
                    <span className="flex-1 truncate">{p.label}</span>
                    {p.hint && (
                      <span className="rounded bg-input-bg px-1 text-[11px] text-text-muted group-hover/row:bg-white/20 group-hover/row:text-white">
                        {p.hint}
                      </span>
                    )}
                    {p.shortcut && (
                      <span className="text-[11px] text-text-muted group-hover/row:text-white/80">{p.shortcut}</span>
                    )}
                  </button>
                ))}

              {fileList.length > 0 && (
                <>
                  {showProviders && <div className="my-1 border-t border-[#454545]" />}
                  {fileList.map((f, i) => (
                    <button
                      key={f.name}
                      onClick={() => pickFile(f.name)}
                      className="group/row flex w-full items-center gap-2 px-3 py-[5px] text-left hover:bg-accent hover:text-white"
                    >
                      <FileIcon kind={f.kind} />
                      <span className="shrink-0 text-[13px] text-text group-hover/row:text-white">{f.name}</span>
                      <span className="flex-1 truncate text-[11px] text-text-dim group-hover/row:text-white/70">
                        {f.dir}
                      </span>
                      {q === '' && i === 0 && (
                        <span className="shrink-0 text-[11px] text-text-dim group-hover/row:text-white/70">
                          recently opened
                        </span>
                      )}
                    </button>
                  ))}
                </>
              )}

              {!showProviders && fileList.length === 0 && (
                <div className="px-3 py-4 text-center text-[13px] text-text-dim">No matching files</div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
