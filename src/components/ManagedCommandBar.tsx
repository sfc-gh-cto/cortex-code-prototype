import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ChevronUp,
  Check,
  Play,
  SlidersHorizontal,
  Hammer,
  FlaskConical,
  FileCog,
  Sprout,
  Camera,
  Package,
  BookOpen,
  Plus,
  X,
  type LucideIcon,
} from 'lucide-react'

// Snowflake Managed runs dbt via EXECUTE DBT PROJECT, a curated subset. We expose
// the operation + free-text flags inline, and group the run context (connection +
// runtime) into two popovers so the bar stays compact.
export const MANAGED_OPS = ['run', 'build', 'test', 'compile', 'seed', 'snapshot', 'deps', 'docs generate']
const PROFILES = ['tasty_bytes_dbt_demo', 'analytics_prod']

// Each dbt operation gets its own glyph so the Run button reflects the selection.
const OP_ICONS: Record<string, LucideIcon> = {
  run: Play,
  build: Hammer,
  test: FlaskConical,
  compile: FileCog,
  seed: Sprout,
  snapshot: Camera,
  deps: Package,
  'docs generate': BookOpen,
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const ENVIRONMENTS = ['dev', 'prod', 'staging']
const VERSIONS = ['dbt Core 1.10.15 (default)', 'dbt Core 1.9.4', 'dbt Core 1.8.9']
const INTEGRATIONS = ['(None)', 'pypi_access_integration', 'external_dbt_packages']

export type VarOverride = { key: string; value: string }

export type ManagedConfig = {
  operation: string
  flags: string
  profile: string
  environment: string
  varsEnabled: boolean
  vars: VarOverride[]
  version: string
  integration: string
}

export const DEFAULT_MANAGED: ManagedConfig = {
  operation: 'run',
  flags: '',
  profile: PROFILES[0],
  environment: 'dev',
  varsEnabled: false,
  vars: [],
  version: VERSIONS[0],
  integration: INTEGRATIONS[0],
}

const cleanVersion = (v: string) => v.match(/\d+\.\d+\.\d+/)?.[0] ?? v

// `--vars '{k: v, …}'` from the override editor (only the filled-in rows).
function varsArg(c: ManagedConfig): string {
  if (!c.varsEnabled) return ''
  const pairs = c.vars.filter((v) => v.key.trim())
  if (!pairs.length) return ''
  const body = pairs.map((v) => `${v.key.trim()}: ${v.value.trim()}`).join(', ')
  return `--vars '{${body}}'`
}

// dbt-style command string fed to the runner (e.g. `dbt run --target dev …`).
export function managedDbtCommand(c: ManagedConfig): string {
  return [
    `dbt ${c.operation}`,
    `--profile ${c.profile}`,
    `--target ${c.environment}`,
    varsArg(c),
    c.flags.trim(),
  ]
    .filter(Boolean)
    .join(' ')
}

// The actual SQL Snowflake executes — shown read-only for transparency.
export function managedSql(project: string, c: ManagedConfig): string {
  const args = [
    c.operation,
    `--profile ${c.profile}`,
    `--target ${c.environment}`,
    varsArg(c),
    c.flags.trim(),
  ]
    .filter(Boolean)
    .join(' ')
  const lines = [
    `EXECUTE DBT PROJECT ${project}`,
    `  ARGS='${args}'`,
    `  DBT_VERSION='${cleanVersion(c.version)}'`,
  ]
  if (c.integration && c.integration !== '(None)') {
    lines.push(`  EXTERNAL_ACCESS_INTEGRATIONS = (${c.integration})`)
  }
  lines.push(`  WAREHOUSE='DBT_WH';`)
  return lines.join('\n')
}

// A pill button that opens a panel above the command bar.
function Pill({
  label,
  icon,
  title,
  active,
  width = 240,
  maxWidth,
  children,
}: {
  label?: React.ReactNode
  icon?: React.ReactNode
  title?: string
  active?: boolean
  width?: number
  maxWidth?: number
  children: (close: () => void) => React.ReactNode
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({
      bottom: window.innerHeight - r.top + 6,
      left: Math.max(8, Math.min(r.left, window.innerWidth - width - 8)),
    })
  }, [open, width])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
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
        ref={ref}
        onClick={() => setOpen((o) => !o)}
        title={title}
        style={maxWidth ? { maxWidth } : undefined}
        className={`flex h-6 min-w-0 items-center gap-1.5 rounded border px-2 text-[12px] ${
          maxWidth ? '' : 'shrink-0'
        } ${
          active
            ? 'border-accent/60 bg-accent/10 text-text'
            : 'border-border-strong bg-input-bg text-text hover:border-text-muted'
        }`}
      >
        {icon}
        {label}
        <ChevronUp size={11} className="shrink-0 text-text-muted" />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: pos.bottom, left: pos.left, width }}
            className="z-[1000] overflow-hidden rounded-md border border-[#454545] bg-[#252526] text-text shadow-2xl"
          >
            {children(() => setOpen(false))}
          </div>,
          document.body,
        )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </div>
      {children}
    </div>
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded border border-border-strong bg-input-bg px-2 text-[12.5px] text-text outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

// Clickable radio-style option rows — clearer than a native <select> in a popover.
function OptionList({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="-mx-1 flex flex-col">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[13px] hover:bg-hover-bg ${
            o === value ? 'text-text' : 'text-text-muted'
          }`}
        >
          <span className="flex-1">{o}</span>
          {o === value && <Check size={14} className="shrink-0 text-accent" />}
        </button>
      ))}
    </div>
  )
}

// A pill label that names the setting then shows its current value, e.g.
// "Profile  tasty_bytes_dbt_demo" — words instead of an ambiguous icon.
function PillLabel({ name, value }: { name: string; value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-text-muted">{name}</span>
      <span className="truncate font-medium">{value}</span>
    </span>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
        on ? 'bg-accent' : 'bg-border-strong'
      }`}
    >
      <span
        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
          on ? 'left-3.5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export function ManagedCommandBar({
  project,
  value,
  onChange,
}: {
  project: string
  value: ManagedConfig
  onChange: (c: ManagedConfig) => void
}) {
  const set = <K extends keyof ManagedConfig>(key: K, v: ManagedConfig[K]) =>
    onChange({ ...value, [key]: v })

  const setVar = (i: number, field: keyof VarOverride, v: string) =>
    set('vars', value.vars.map((row, idx) => (idx === i ? { ...row, [field]: v } : row)))
  const addVar = () => set('vars', [...value.vars, { key: '', value: '' }])
  const removeVar = (i: number) => set('vars', value.vars.filter((_, idx) => idx !== i))

  // Surface a dot when any advanced setting differs from the defaults.
  const advancedActive = value.integration !== '(None)' || value.version !== VERSIONS[0]
  const varsActive = value.varsEnabled && value.vars.some((v) => v.key.trim())

  // The generated SQL is informational, surfaced as a hover/focus preview over
  // the flags input rather than competing for space as its own pill.
  const flagsRef = useRef<HTMLDivElement>(null)
  const [sqlOpen, setSqlOpen] = useState(false)
  const [sqlPos, setSqlPos] = useState<{ bottom: number; left: number } | null>(null)
  const SQL_W = 440

  useLayoutEffect(() => {
    if (!sqlOpen || !flagsRef.current) return
    const r = flagsRef.current.getBoundingClientRect()
    setSqlPos({
      bottom: window.innerHeight - r.top + 8,
      left: Math.max(8, Math.min(r.left, window.innerWidth - SQL_W - 8)),
    })
  }, [sqlOpen, value])

  return (
    <div className="flex h-6 min-w-0 flex-1 items-center gap-1.5">
      {/* Profile (dbt connection) — independent of environment/target */}
      <Pill label={<PillLabel name="Profile" value={value.profile} />} width={240} maxWidth={140}>
        {(close) => (
          <div className="p-2">
            <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Profile
            </div>
            <OptionList
              value={value.profile}
              onChange={(v) => {
                set('profile', v)
                close()
              }}
              options={PROFILES}
            />
          </div>
        )}
      </Pill>

      {/* Environment (dbt target) + optional variable overrides */}
      <Pill
        label={<PillLabel name="Environment" value={value.environment} />}
        active={varsActive}
        width={320}
        maxWidth={140}
      >
        {() => (
          <div className="flex flex-col p-2">
            <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Target
            </div>
            <OptionList
              value={value.environment}
              onChange={(v) => set('environment', v)}
              options={ENVIRONMENTS}
            />

            <div className="mt-2 border-t border-[#454545] pt-2.5">
              <div className="flex items-center justify-between px-2">
                <div>
                  <div className="text-[12.5px] text-text">Override variables</div>
                  <div className="text-[11px] text-text-muted">Passed as --vars to dbt</div>
                </div>
                <Toggle on={value.varsEnabled} onChange={(on) => set('varsEnabled', on)} />
              </div>

              {value.varsEnabled && (
                <div className="mt-2 flex flex-col gap-1.5 px-2">
                  {value.vars.map((row, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input
                        value={row.key}
                        onChange={(e) => setVar(i, 'key', e.target.value)}
                        placeholder="key"
                        className="h-7 min-w-0 flex-1 rounded border border-border-strong bg-input-bg px-2 font-mono text-[12px] text-text outline-none focus:border-accent placeholder:text-text-dim"
                      />
                      <span className="text-text-muted">=</span>
                      <input
                        value={row.value}
                        onChange={(e) => setVar(i, 'value', e.target.value)}
                        placeholder="value"
                        className="h-7 min-w-0 flex-1 rounded border border-border-strong bg-input-bg px-2 font-mono text-[12px] text-text outline-none focus:border-accent placeholder:text-text-dim"
                      />
                      <button
                        onClick={() => removeVar(i)}
                        title="Remove"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-text-muted hover:bg-hover-bg hover:text-text"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addVar}
                    className="mt-0.5 flex items-center gap-1.5 self-start rounded px-1.5 py-1 text-[12px] text-accent hover:bg-hover-bg"
                  >
                    <Plus size={13} /> Add variable
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Pill>

      {/* Free-text flags (incl. model selection, e.g. --select orders) */}
      <div
        ref={flagsRef}
        onMouseEnter={() => setSqlOpen(true)}
        onMouseLeave={() => setSqlOpen(false)}
        className="flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 focus-within:border-accent"
      >
        <input
          value={value.flags}
          onChange={(e) => set('flags', e.target.value)}
          onFocus={() => setSqlOpen(true)}
          onBlur={() => setSqlOpen(false)}
          placeholder="flags & selection, e.g. --select orders+ --full-refresh"
          className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-text outline-none placeholder:text-text-dim"
        />
      </div>

      {/* Advanced = dbt Version + External Access Integration (less common) */}
      <Pill
        icon={<SlidersHorizontal size={12} className="text-text-muted" />}
        title="Advanced settings"
        active={advancedActive}
        width={300}
      >
        {() => (
          <div className="flex flex-col gap-3 p-3">
            <Field label="dbt Version">
              <Select value={value.version} onChange={(v) => set('version', v)} options={VERSIONS} />
            </Field>
            <Field label="External Access Integration">
              <Select
                value={value.integration}
                onChange={(v) => set('integration', v)}
                options={INTEGRATIONS}
              />
            </Field>
          </div>
        )}
      </Pill>

      {/* Generated SQL preview — informational, shown on flags hover/focus */}
      {sqlOpen &&
        sqlPos &&
        createPortal(
          <div
            style={{ position: 'fixed', bottom: sqlPos.bottom, left: sqlPos.left, width: SQL_W }}
            className="pointer-events-none z-[2000] overflow-hidden rounded-md border border-[#454545] bg-[#252526] shadow-2xl"
          >
            <div className="border-b border-[#454545] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Snowflake will execute
            </div>
            <pre className="overflow-x-auto whitespace-pre px-3 py-2.5 font-mono text-[12px] leading-5 text-text">
              {managedSql(project, value)}
            </pre>
          </div>,
          document.body,
        )}
    </div>
  )
}

// Split Run button: the primary part runs the selected operation; the chevron
// opens an operation picker. Used in managed mode in place of a separate pill.
export function ManagedRunButton({
  operation,
  onOperationChange,
  onRun,
}: {
  operation: string
  onOperationChange: (op: string) => void
  onRun: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null)
  const WIDTH = 180

  useLayoutEffect(() => {
    if (!open || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({
      bottom: window.innerHeight - r.top + 6,
      left: Math.max(8, Math.min(r.right - WIDTH, window.innerWidth - WIDTH - 8)),
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const ActiveIcon = OP_ICONS[operation] ?? Play

  return (
    <div ref={ref} className="flex h-6 shrink-0 items-stretch overflow-hidden rounded">
      <button
        onClick={onRun}
        title="Run"
        className="flex items-center gap-1.5 bg-accent px-3 text-[12px] font-medium text-white hover:bg-accent-hover"
      >
        <ActiveIcon size={12} />
        {capitalize(operation)}
      </button>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Choose operation"
        className="flex items-center border-l border-white/20 bg-accent px-1 text-white hover:bg-accent-hover"
      >
        <ChevronUp size={13} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{ position: 'fixed', bottom: pos.bottom, left: pos.left, width: WIDTH }}
            className="z-[1000] overflow-hidden rounded-md border border-[#454545] bg-[#252526] py-1 text-text shadow-2xl"
          >
            {MANAGED_OPS.map((op) => {
              const Icon = OP_ICONS[op] ?? Play
              return (
                <button
                  key={op}
                  onClick={() => {
                    onOperationChange(op)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-hover-bg"
                >
                  <Icon size={14} className="shrink-0 text-text-muted" />
                  <span className="flex-1">{capitalize(op)}</span>
                  {op === operation && <Check size={14} className="text-accent" />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
