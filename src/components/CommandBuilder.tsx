import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Box,
  FileText,
  Code2,
  Play,
  CheckCheck,
  Hammer,
  Camera,
  BookOpen,
  Check,
} from 'lucide-react'
import type { ComponentType } from 'react'

type Operation = {
  id: string
  label: string
  icon: ComponentType<{ size?: number | string }>
}

const OPERATIONS: Operation[] = [
  { id: 'deps', label: 'Deps', icon: Box },
  { id: 'seed', label: 'Seed', icon: FileText },
  { id: 'compile', label: 'Compile', icon: Code2 },
  { id: 'run', label: 'Run', icon: Play },
  { id: 'test', label: 'Test', icon: CheckCheck },
  { id: 'build', label: 'Build', icon: Hammer },
  { id: 'snapshot', label: 'Snapshot', icon: Camera },
  { id: 'docs generate', label: 'Docs Generate', icon: BookOpen },
]

const PROFILES = ['tasty_bytes_dbt_demo', 'analytics_prod']
const ENVIRONMENTS = ['dev', 'prod', 'staging']
const VERSIONS = ['dbt Core 1.10.15 (default)', 'dbt Core 1.9.4', 'dbt Core 1.8.9']
const INTEGRATIONS = ['(None)', 'pypi_access_integration', 'external_dbt_packages']

const WIDTH = 380

// A command-builder popover: pick an operation + options and it compiles a dbt
// command string, pushed live into the command input as selections change.
export function CommandBuilder({
  anchorRef,
  open,
  onClose,
  onChange,
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
  onChange: (command: string) => void
}) {
  const [operation, setOperation] = useState('compile')
  const [profile, setProfile] = useState(PROFILES[0])
  const [environment, setEnvironment] = useState('dev')
  const [version, setVersion] = useState(VERSIONS[0])
  const [flags, setFlags] = useState('')
  const [integration, setIntegration] = useState(INTEGRATIONS[0])
  const [pos, setPos] = useState<{ bottom: number; left: number } | null>(null)

  const buildCommand = () => {
    const extra = flags.trim()
    return [`dbt ${operation}`, `--target ${environment}`, `--profile ${profile}`, extra]
      .filter(Boolean)
      .join(' ')
  }

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    setPos({
      bottom: window.innerHeight - r.top + 6,
      // Left-align to the input so the builder opens where the "Build command…"
      // chip sits, not on the far right edge of the input.
      left: Math.max(8, Math.min(r.left, window.innerWidth - WIDTH - 8)),
    })
  }, [open, anchorRef])

  // Push the compiled command into the input live as selections change.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })
  useEffect(() => {
    if (open) onChangeRef.current(buildCommand())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, operation, profile, environment, flags])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  if (!open || !pos) return null

  return createPortal(
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{ position: 'fixed', bottom: pos.bottom, left: pos.left, width: WIDTH }}
      className="z-[1000] flex max-h-[70vh] flex-col overflow-hidden rounded-md border border-[#454545] bg-[#252526] text-text shadow-2xl"
    >
      <div className="flex-1 overflow-y-auto p-3">
        {/* Operation */}
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Operation
        </div>
        <div className="mb-3">
          {OPERATIONS.map(({ id, label, icon: Icon }) => {
            const selected = id === operation
            return (
              <button
                key={id}
                onClick={() => setOperation(id)}
                className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-[13px] hover:bg-hover-bg"
              >
                <Icon size={15} />
                <span className="flex-1">{label}</span>
                {selected && <Check size={14} className="shrink-0 text-accent" />}
              </button>
            )
          })}
        </div>

        {/* Profile + Environment */}
        <div className="grid grid-cols-2 gap-2">
          <Field label="Profile">
            <Select value={profile} onChange={setProfile} options={PROFILES} />
          </Field>
          <Field label="Environment">
            <Select value={environment} onChange={setEnvironment} options={ENVIRONMENTS} />
          </Field>
        </div>

        {/* dbt Version */}
        <Field label="dbt Version">
          <Select value={version} onChange={setVersion} options={VERSIONS} />
        </Field>

        {/* Additional flags */}
        <Field label="Additional flags">
          <textarea
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            rows={2}
            placeholder={`--full-refresh --vars '{"key": "value"}'`}
            className="w-full resize-none rounded border border-border-strong bg-input-bg px-2 py-1.5 font-mono text-[12px] text-text outline-none placeholder:text-text-dim focus:border-accent"
          />
        </Field>

        {/* External Access Integration */}
        <Field label="External Access Integration">
          <Select value={integration} onChange={setIntegration} options={INTEGRATIONS} />
        </Field>
      </div>
    </div>,
    document.body,
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
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
      className="h-8 w-full rounded border border-border-strong bg-input-bg px-2 text-[13px] text-text outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}
