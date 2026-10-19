import { useEffect, useState } from 'react'
import {
  BookOpen,
  Bug,
  Users,
  LifeBuoy,
  ExternalLink,
  ChevronDown,
  Plus,
  X,
  Play,
  type LucideIcon,
} from 'lucide-react'
import { Section } from '../Section'
import { CatalogTree } from './CatalogTree'
import { DbtLogo, SnowflakeMark } from '../icons'
import {
  DBT_VERSIONS,
  TARGETS,
  deferCompareOptions,
  helpLinks,
  type ProjectInfo,
  type ProjectConfig,
} from '../../data/extensionConfig'
import type { DbtAction } from '../../App'

const PANEL_COMMANDS: { id: DbtAction; label: string }[] = [
  { id: 'run', label: 'Run' },
  { id: 'build', label: 'Build' },
  { id: 'test', label: 'Test' },
  { id: 'compile', label: 'Compile' },
  { id: 'preview', label: 'Preview' },
  { id: 'lineage', label: 'Show lineage' },
  { id: 'docs', label: 'Generate docs' },
  { id: 'deps', label: 'Install dependencies' },
]

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[26px] items-center justify-between gap-2 px-4 py-0.5 text-[12.5px]">
      <span className="shrink-0 text-fg-muted">{label}</span>
      <div className="flex min-w-0 items-center gap-1 text-fg">{children}</div>
    </div>
  )
}

function Value({ children }: { children: React.ReactNode }) {
  return <span className="truncate font-mono text-[12px]">{children}</span>
}

function Dropdown({
  value,
  options,
  onChange,
  mono,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  mono?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-6 max-w-[160px] rounded border border-border-contrast bg-dropdown px-1 text-[12px] text-fg outline-none focus:border-focus ${
        mono ? 'font-mono' : ''
      }`}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
        on ? 'bg-accent' : 'bg-border-contrast'
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

// Placeholder setup steps. The real sequence isn't settled yet — these are
// Snowflake Managed stand-ins so the Get started checklist is clickable.
const SETUP_STEPS = [
  { id: 'connect', label: 'Connect' },
  { id: 'project', label: 'Project' },
  { id: 'execution', label: 'Profile' },
] as const

function SetupFlow({
  projects,
  project,
  cfg,
  onSelectProject,
  onUpdate,
  onComplete,
}: {
  projects: ProjectInfo[]
  project: ProjectInfo
  cfg: ProjectConfig
  onSelectProject: (id: string) => void
  onUpdate: (patch: Partial<ProjectConfig>) => void
  onComplete: (done: boolean) => void
}) {
  const [open, setOpen] = useState(0)
  const [finished, setFinished] = useState<boolean[]>(() => SETUP_STEPS.map(() => false))
  const complete = finished.every(Boolean)
  const step = SETUP_STEPS[open]

  useEffect(() => {
    onComplete(complete)
  }, [complete, onComplete])

  const finish = (index: number) => {
    setFinished((prev) => {
      const nextFinished = prev.map((done, i) => (i === index ? true : done))
      const next = nextFinished.findIndex((done) => !done)
      if (next >= 0) setOpen(next)
      return nextFinished
    })
  }

  const progress = open / (SETUP_STEPS.length - 1)

  if (complete) return null

  return (
    <div className="border-b border-border px-3 py-2.5">
      <div className="mb-2 text-[11px] font-semibold tracking-wide text-fg uppercase">Get started</div>

      <div className="relative mb-3">
        <div className="absolute top-[5px] right-[5.5px] left-[5.5px] h-px bg-border-contrast" />
        <div
          className="absolute top-[5px] left-[5.5px] h-px bg-accent"
          style={{ width: `calc((100% - 11px) * ${progress})` }}
        />
        <div className="relative flex items-start justify-between">
          {SETUP_STEPS.map((s, i) => {
            const done = finished[i]
            const current = i === open && !complete
            const align =
              i === 0 ? 'items-start' : i === SETUP_STEPS.length - 1 ? 'items-end' : 'items-center'
            return (
              <button
                key={s.id}
                onClick={() => setOpen(i)}
                className={`flex flex-col gap-1 ${align} ${i === 1 ? 'absolute left-1/2 -translate-x-1/2' : ''}`}
              >
                <span
                  className={`h-[11px] w-[11px] rounded-full border ${
                    done
                      ? 'border-success bg-success'
                      : current
                        ? 'border-accent bg-accent'
                        : 'border-fg-dim bg-sidebar'
                  }`}
                />
                <span className={`text-[11px] ${current ? 'text-fg-bright' : 'text-fg-muted'}`}>
                  {s.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded border border-border-contrast bg-[#1a1a1a] px-3 py-3">
        <div className="flex items-center gap-2">
          <DbtLogo size={22} />
          <div className="text-[13px] font-semibold text-fg">dbt on Snowflake</div>
        </div>
        <p className="mt-2 text-[12px] leading-snug text-fg-muted">
          Build and run models without leaving VS Code. dbt executes inside your Snowflake account,
          so there is nothing to install locally.
        </p>

        {!complete && step.id === 'project' && (
          <div className="mt-2.5 flex flex-col">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`flex h-[22px] items-center rounded px-1.5 text-left text-[12.5px] ${
                  p.id === project.id ? 'bg-list-active text-fg-bright' : 'text-fg hover:bg-hover'
                }`}
              >
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {!complete && step.id === 'execution' && (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="text-[12px] text-fg-muted">Profile</span>
            <Dropdown
              value={cfg.target}
              options={TARGETS}
              onChange={(target) => onUpdate({ target })}
            />
          </div>
        )}

        <button
          onClick={() => {
            if (step.id === 'project') onSelectProject(project.id)
            finish(open)
          }}
          className="mt-3 h-8 w-full rounded bg-[#f5c518] text-[13px] font-semibold text-[#1a1a1a] hover:bg-[#ffd84d]"
        >
          {step.id === 'connect' ? 'Get started' : step.id === 'project' ? 'Continue' : 'Finish setup'}
        </button>
      </div>
    </div>
  )
}

const HELP_ICON: Record<string, LucideIcon> = {
  docs: BookOpen,
  bug: Bug,
  community: Users,
  support: LifeBuoy,
}

// The dbt extension side panel. A workspace can hold several dbt projects, so an
// active-project selector sits at the top and every config below is scoped to it.
export function DbtExtensionPanel({
  projects,
  activeProject,
  project,
  cfg,
  onSelectProject,
  onUpdate,
  onRun,
}: {
  projects: ProjectInfo[]
  activeProject: string
  project: ProjectInfo
  cfg: ProjectConfig
  onSelectProject: (id: string) => void
  onUpdate: (patch: Partial<ProjectConfig>) => void
  onRun: (action: DbtAction) => void
}) {
  const setVar = (i: number, patch: Partial<{ key: string; value: string }>) =>
    onUpdate({ vars: cfg.vars.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) })
  const addVar = () => onUpdate({ vars: [...cfg.vars, { key: '', value: '' }] })
  const removeVar = (i: number) => onUpdate({ vars: cfg.vars.filter((_, idx) => idx !== i) })

  const [ready, setReady] = useState(false)
  const [command, setCommand] = useState<DbtAction>('run')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <SetupFlow
        projects={projects}
        project={project}
        cfg={cfg}
        onSelectProject={onSelectProject}
        onUpdate={onUpdate}
        onComplete={setReady}
      />

      {ready && (
        <>
      {/* Active project selector */}
      <div className="border-b border-border px-4 py-2.5">
        <div className="mb-1 text-[11px] uppercase tracking-wide text-fg-muted">dbt Project</div>
        <div className="relative">
          <select
            value={activeProject}
            onChange={(e) => onSelectProject(e.target.value)}
            className="h-7 w-full appearance-none rounded border border-border-contrast bg-dropdown pr-7 pl-7 text-[13px] font-medium text-fg outline-none focus:border-focus"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2">
            <DbtLogo size={14} />
          </span>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-fg-muted"
          />
        </div>
      </div>

      <Section title="Commands">
        <div className="pb-2">
          <Row label="Profile">
            <Dropdown value={cfg.target} options={TARGETS} onChange={(target) => onUpdate({ target })} />
          </Row>
          <div className="px-4 pt-1 pb-2">
            <div className="mb-1 text-[12px] text-fg-muted">Environment variables</div>
            {cfg.vars.map((v, i) => (
              <div key={i} className="mb-1 flex items-center gap-1">
                <input
                  value={v.key}
                  onChange={(e) => setVar(i, { key: e.target.value })}
                  placeholder="key"
                  className="h-6 w-[42%] rounded border border-border-contrast bg-input px-1.5 font-mono text-[12px] text-fg outline-none focus:border-focus"
                />
                <span className="text-fg-dim">:</span>
                <input
                  value={v.value}
                  onChange={(e) => setVar(i, { value: e.target.value })}
                  placeholder="value"
                  className="h-6 min-w-0 flex-1 rounded border border-border-contrast bg-input px-1.5 font-mono text-[12px] text-fg outline-none focus:border-focus"
                />
                <button
                  onClick={() => removeVar(i)}
                  title="Remove"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-icon hover:bg-hover"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={addVar}
              className="mt-1 flex items-center gap-1 rounded border border-border-contrast px-2 py-1 text-[12px] text-fg hover:bg-hover"
            >
              <Plus size={13} className="text-icon" /> Add variable
            </button>
          </div>
          <div className="flex items-center gap-1.5 border-t border-border px-4 pt-2 pb-1.5">
            <select
              value={command}
              onChange={(e) => setCommand(e.target.value as DbtAction)}
              className="h-7 min-w-0 flex-1 rounded border border-border-contrast bg-dropdown px-1.5 text-[12.5px] text-fg outline-none focus:border-focus"
            >
              {PANEL_COMMANDS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              title="Run"
              onClick={() => onRun(command)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#f5c518] text-[#1a1a1a] hover:bg-[#ffd84d]"
            >
              <Play size={13} className="fill-current" />
            </button>
          </div>
          <div className="px-4 pt-1">
            <div className="mb-1 text-[12px] text-fg-muted">Flags</div>
            <input
              value={cfg.flags}
              onChange={(e) => onUpdate({ flags: e.target.value })}
              placeholder="e.g. --select orders+ --exclude tag:slow"
              className="h-7 w-full rounded border border-border-contrast bg-input px-2 font-mono text-[12px] text-fg outline-none focus:border-focus"
            />
          </div>
          <div className="mt-2 border-t border-border pt-1">
            <Row label="dbt version">
              <Dropdown
                value={cfg.dbtVersion}
                options={DBT_VERSIONS}
                onChange={(dbtVersion) => onUpdate({ dbtVersion })}
              />
            </Row>
            <Row label="Defer to production">
              <Toggle on={cfg.deferOn} onChange={(deferOn) => onUpdate({ deferOn })} />
            </Row>
            {cfg.deferOn && (
              <>
                <Row label="Prod object">
                  <Value>{cfg.deferObject}</Value>
                </Row>
                <Row label="Compare to">
                  <Dropdown
                    value={cfg.deferCompareTo}
                    options={deferCompareOptions}
                    onChange={(deferCompareTo) => onUpdate({ deferCompareTo })}
                  />
                </Row>
              </>
            )}
          </div>
        </div>
      </Section>

      <div className="border-t border-border" />
      <Section title="Extension Info" defaultOpen={false}>
        <div className="pb-1">
          <Row label="Execution">
            <span className="flex items-center gap-1 rounded bg-snowflake/15 px-1.5 py-0.5 text-[11px] text-snowflake">
              <SnowflakeMark size={11} /> Snowflake Managed
            </span>
          </Row>
          <Row label="Account">
            <Value>{project.account}</Value>
          </Row>
          <Row label="Profile">
            <Value>{project.profile}</Value>
          </Row>
          <Row label="Warehouse">
            <Value>{project.warehouse}</Value>
          </Row>
          <Row label="Role">
            <Value>{project.role}</Value>
          </Row>
          <Row label="Threads">
            <Value>{project.threads}</Value>
          </Row>
        </div>
      </Section>

      <div className="border-t border-border" />
      <Section title="Snowflake Catalog" defaultOpen={false}>
        <CatalogTree />
      </Section>

      <div className="border-t border-border" />
      <Section title="Help" defaultOpen={false}>
        <div className="pb-1">
          {helpLinks.map((h) => {
            const Icon = HELP_ICON[h.id] ?? BookOpen
            return (
              <a
                key={h.id}
                className="flex cursor-pointer items-center gap-2 px-4 py-1 text-[12.5px] text-fg hover:bg-hover"
              >
                <Icon size={14} className="text-icon" />
                <span className="flex-1 truncate">{h.label}</span>
                <ExternalLink size={12} className="text-fg-dim" />
              </a>
            )
          })}
        </div>
      </Section>
        </>
      )}
    </div>
  )
}
