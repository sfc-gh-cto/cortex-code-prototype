import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronUp, Play, Square, Snowflake, SlidersHorizontal, Laptop, Check } from 'lucide-react'
import { CommandBuilder } from './CommandBuilder'
import { EXECUTION_MODES, type RunMode } from '../data/settings'
import { dbtProjectRoots } from '../data/files'
import { DbtLogo } from './ui/DbtLogo'

// Active dbt project selector. Opens a menu above the bar (up-chevron) listing
// every dbt project in the workspace.
function ProjectSelector({
  projects,
  value,
  onChange,
}: {
  projects: string[]
  value: string
  onChange: (project: string) => void
}) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ bottom: number; left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    const width = Math.max(r.width, 220)
    setPos({
      bottom: window.innerHeight - r.top + 6,
      left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
      width,
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={anchorRef}
        onClick={() => setOpen((o) => !o)}
        title="Active dbt project"
        className="flex h-6 shrink-0 items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 text-[12px] text-text hover:border-text-muted"
      >
        <DbtLogo size={13} />
        <span className="max-w-44 truncate">{value}</span>
        <ChevronUp size={12} className="text-text-muted" />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: pos.bottom, left: pos.left, width: pos.width }}
            className="z-[1000] overflow-hidden rounded-md border border-[#454545] bg-[#252526] py-1 shadow-2xl"
          >
            <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              dbt Projects
            </div>
            {projects.map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange(p)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-text hover:bg-hover-bg"
              >
                <DbtLogo size={13} />
                <span className="flex-1 truncate">{p}</span>
                {p === value && <Check size={14} className="shrink-0 text-accent" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}

// Execution-mode indicator. In local mode, a CTA advertises the upgrade; in
// managed mode, a read-only badge with a gear that opens the Settings tab.
function RunModeControl({
  mode,
  onChange,
  onOpenSettings,
}: {
  mode: RunMode
  onChange: (m: RunMode) => void
  onOpenSettings: () => void
}) {
  const ctaRef = useRef<HTMLButtonElement>(null)
  const [hover, setHover] = useState(false)
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null)
  const POP_W = 300

  useLayoutEffect(() => {
    if (!hover || !ctaRef.current) return
    const r = ctaRef.current.getBoundingClientRect()
    setPos({
      bottom: window.innerHeight - r.top + 8,
      left: Math.max(8, Math.min(r.right - POP_W, window.innerWidth - POP_W - 8)),
    })
  }, [hover])

  if (mode === 'local') {
    const snowflake = EXECUTION_MODES.find((m) => m.id === 'snowflake')!
    return (
      <>
        <button
          ref={ctaRef}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => onChange('snowflake')}
          className="flex h-6 shrink-0 items-center gap-1.5 rounded border border-[#29b5e8]/50 bg-[#29b5e8]/10 px-2.5 text-[11px] font-medium text-[#29b5e8] hover:bg-[#29b5e8]/20"
        >
          <Snowflake size={12} />
          Switch to Snowflake Managed
        </button>

        {hover &&
          pos &&
          createPortal(
            <div
              style={{ position: 'fixed', bottom: pos.bottom, left: pos.left, width: POP_W }}
              className="pointer-events-none z-[2000] rounded-md border border-[#454545] bg-[#252526] p-3 text-[12px] shadow-2xl"
            >
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-text">
                <Laptop size={13} className="text-text-muted" />
                You&apos;re running dbt locally
              </div>
              <p className="mt-1 text-text-muted">
                Local mode runs dbt from your machine — you maintain the dbt install, Python
                environment, and dependencies yourself.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-[#29b5e8]">
                <Snowflake size={12} />
                Switch to Snowflake Managed to:
              </div>
              <ul className="mt-1.5 space-y-1">
                {snowflake.bullets.map((b) => (
                  <li key={b} className="flex gap-1.5 text-text-muted">
                    <Check size={12} className="mt-0.5 shrink-0 text-[#29b5e8]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>,
            document.body,
          )}
      </>
    )
  }

  return (
    <button
      onClick={onOpenSettings}
      title="dbt execution settings"
      className="flex h-6 shrink-0 items-center gap-1.5 rounded border border-border-strong bg-chrome-bg px-2 text-[11px] text-text hover:border-text-muted"
    >
      <Snowflake size={12} className="text-[#29b5e8]" />
      <span>Snowflake Managed</span>
    </button>
  )
}

// Project-centric command bar pinned to the bottom of the workbench. Hosts the
// active project selector and a dbt command input (dbt today; dcm, etc. later).
export function ProjectCommandBar({
  command,
  onCommandChange,
  running,
  onRun,
  onStop,
  onOpenSettings,
  runMode,
  onRunModeChange,
}: {
  command: string
  onCommandChange: (value: string) => void
  running: boolean
  onRun: () => void
  onStop: () => void
  onOpenSettings: () => void
  runMode: RunMode
  onRunModeChange: (mode: RunMode) => void
}) {
  const inputRef = useRef<HTMLDivElement>(null)
  const [project, setProject] = useState(dbtProjectRoots[0] ?? 'tasty_bytes_dbt_demo')
  const [builderOpen, setBuilderOpen] = useState(false)
  // The "Build command…" chip shown while the input is focused (before typing).
  const [chipOpen, setChipOpen] = useState(false)
  const [chipPos, setChipPos] = useState<{ bottom: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!chipOpen || !inputRef.current) return
    const r = inputRef.current.getBoundingClientRect()
    setChipPos({ bottom: window.innerHeight - r.top + 6, left: r.left })
  }, [chipOpen])

  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-y border-border bg-chrome-bg px-2">
      <ProjectSelector projects={dbtProjectRoots} value={project} onChange={setProject} />

      {/* dbt command input */}
      <div
        ref={inputRef}
        className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 focus-within:border-accent"
      >
        <span className="shrink-0 font-mono text-text-muted">$</span>
        <input
          value={command}
          onChange={(e) => {
            onCommandChange(e.target.value)
            setChipOpen(false) // typing dismisses the chip
          }}
          onFocus={() => !builderOpen && setChipOpen(true)}
          onBlur={() => setChipOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !running) onRun()
          }}
          placeholder="Enter command (e.g., dbt run, dbt test, dbt compile)"
          className="min-w-0 flex-1 bg-transparent text-[12px] text-text outline-none placeholder:text-text-dim"
        />
      </div>

      {running ? (
        <button
          onClick={onStop}
          className="flex h-6 shrink-0 items-center gap-1.5 rounded bg-[#c4314b] px-3 text-[12px] font-medium text-white hover:bg-[#d13a55]"
        >
          <Square size={11} className="fill-current" />
          Stop
        </button>
      ) : (
        <button
          onClick={onRun}
          title="Run"
          className="flex h-6 shrink-0 items-center rounded bg-accent px-3 text-[12px] font-medium text-white hover:bg-accent-hover"
        >
          <Play size={12} className="fill-current" />
        </button>
      )}

      {/* Focus chip: a lightweight entry point into the full builder */}
      {chipOpen &&
        !builderOpen &&
        chipPos &&
        createPortal(
          <button
            // preventDefault keeps the input focused so clicking doesn't blur-close it
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setBuilderOpen(true)
              setChipOpen(false)
            }}
            style={{ position: 'fixed', bottom: chipPos.bottom, left: chipPos.left }}
            className="z-[1000] flex items-center gap-1.5 rounded-md border border-[#454545] bg-[#252526] px-2.5 py-1.5 text-[12px] text-text shadow-2xl hover:bg-hover-bg"
          >
            <SlidersHorizontal size={13} className="text-text-muted" />
            Build command…
          </button>,
          document.body,
        )}

      <CommandBuilder
        anchorRef={inputRef}
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onChange={onCommandChange}
      />

      <RunModeControl mode={runMode} onChange={onRunModeChange} onOpenSettings={onOpenSettings} />
    </div>
  )
}
