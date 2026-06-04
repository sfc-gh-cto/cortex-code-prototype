import { useState } from 'react'
import { Search, Snowflake, Laptop, Check } from 'lucide-react'
import { EXECUTION_MODES, type RunMode } from '../data/settings'

export function SettingsPage({
  runMode,
  onRunModeChange,
}: {
  runMode: RunMode
  onRunModeChange: (mode: RunMode) => void
}) {
  // Execution
  const [target, setTarget] = useState('dev')
  const [threads, setThreads] = useState(8)
  // Compute
  const [warehouse, setWarehouse] = useState('dex_wh')
  const [role, setRole] = useState('tasty_bytes_dbt_role')
  const [compute, setCompute] = useState('warehouse')
  // Scheduling
  const [scheduleOn, setScheduleOn] = useState(false)
  const [cron, setCron] = useState('0 6 * * *')
  const [taskWarehouse, setTaskWarehouse] = useState('dex_wh')
  // Secrets & External Access
  const [integration, setIntegration] = useState('(None)')
  // Version & Packages
  const [version, setVersion] = useState('dbt Core 1.10.15 (default)')
  const [autoDeps, setAutoDeps] = useState(true)
  // Governance & Cost
  const [queryTag, setQueryTag] = useState('dbt:tasty_bytes')
  // Observability
  const [logLevel, setLogLevel] = useState('info')
  const [retention, setRetention] = useState('30 days')
  // Local
  const [pythonPath, setPythonPath] = useState('.venv/bin/python')
  const [profilesPath, setProfilesPath] = useState('~/.dbt/profiles.yml')

  const managed = runMode === 'snowflake'

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-editor-bg">
      <div className="mx-auto max-w-3xl px-8 py-7">
        <h1 className="text-[20px] font-semibold text-text-bright">Settings</h1>
        <p className="mt-1 text-[13px] text-text-muted">
          Manage how dbt runs in this workspace.
        </p>

        <div className="mt-4 flex h-9 items-center gap-2 rounded border border-border-strong bg-input-bg px-3">
          <Search size={14} className="text-text-muted" />
          <input
            placeholder="Search settings"
            className="flex-1 bg-transparent text-[13px] text-text outline-none placeholder:text-text-dim"
          />
        </div>

        {/* ── Execution (always shown) ── */}
        <Section title="dbt" subtitle="Execution">
          <SettingRow title="Execution Mode" desc="Choose where dbt commands run for this project.">
            <div className="grid grid-cols-2 gap-3">
              {EXECUTION_MODES.map((m) => {
                const selected = m.id === runMode
                return (
                  <button
                    key={m.id}
                    onClick={() => onRunModeChange(m.id)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      selected
                        ? 'border-accent bg-accent/10'
                        : 'border-border-strong hover:border-text-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {m.id === 'snowflake' ? (
                        <Snowflake size={15} className="text-[#29b5e8]" />
                      ) : (
                        <Laptop size={15} className="text-text-muted" />
                      )}
                      <span className="text-[13px] font-medium text-text">{m.label}</span>
                      {m.recommended && (
                        <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          Recommended
                        </span>
                      )}
                      {selected && <Check size={14} className="ml-auto text-accent" />}
                    </div>
                    <ul className="mt-2 space-y-1">
                      {m.bullets.map((b) => (
                        <li key={b} className="flex gap-1.5 text-[12px] leading-snug text-text-muted">
                          <Check size={12} className="mt-0.5 shrink-0 text-text-dim" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </SettingRow>

          <SettingRow title="Default Target" desc="The profiles.yml output used when none is specified.">
            <Select value={target} onChange={setTarget} options={['dev', 'prod', 'staging']} />
          </SettingRow>

          <SettingRow title="Threads" desc="Maximum number of models dbt builds concurrently.">
            <input
              type="number"
              min={1}
              max={32}
              value={threads}
              onChange={(e) => setThreads(Number(e.target.value))}
              className="h-8 w-24 rounded border border-border-strong bg-input-bg px-2 text-[13px] text-text outline-none focus:border-accent"
            />
          </SettingRow>
        </Section>

        {managed ? (
          <>
            {/* ── Compute ── */}
            <Section title="dbt" subtitle="Compute">
              <SettingRow title="Compute" desc="How Snowflake provisions compute for managed runs.">
                <Select
                  value={compute}
                  onChange={setCompute}
                  options={['warehouse', 'serverless']}
                />
              </SettingRow>
              <SettingRow title="Warehouse" desc="Snowflake warehouse that powers managed runs.">
                <input
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="h-8 w-56 rounded border border-border-strong bg-input-bg px-2 text-[13px] text-text outline-none focus:border-accent"
                />
              </SettingRow>
              <SettingRow title="Role" desc="Snowflake role runs execute under (RBAC & grants).">
                <Select
                  value={role}
                  onChange={setRole}
                  options={['tasty_bytes_dbt_role', 'sysadmin', 'transformer']}
                />
              </SettingRow>
            </Section>

            {/* ── Scheduling & Orchestration ── */}
            <Section title="dbt" subtitle="Scheduling & Orchestration">
              <SettingRow
                title="Scheduled Runs"
                desc="Run this project on a schedule as a native Snowflake task."
              >
                <Toggle on={scheduleOn} onChange={setScheduleOn} label="Enable scheduled runs" />
              </SettingRow>
              {scheduleOn && (
                <>
                  <SettingRow title="Schedule (CRON)" desc="When the managed run is triggered.">
                    <input
                      value={cron}
                      onChange={(e) => setCron(e.target.value)}
                      className="h-8 w-56 rounded border border-border-strong bg-input-bg px-2 font-mono text-[13px] text-text outline-none focus:border-accent"
                    />
                  </SettingRow>
                  <SettingRow title="Task Warehouse" desc="Warehouse used by the scheduled task.">
                    <input
                      value={taskWarehouse}
                      onChange={(e) => setTaskWarehouse(e.target.value)}
                      className="h-8 w-56 rounded border border-border-strong bg-input-bg px-2 text-[13px] text-text outline-none focus:border-accent"
                    />
                  </SettingRow>
                </>
              )}
            </Section>

            {/* ── Secrets & External Access ── */}
            <Section title="dbt" subtitle="Secrets & External Access">
              <SettingRow
                title="External Access Integration"
                desc="Allow dbt deps to reach PyPI / git and external networks."
              >
                <Select
                  value={integration}
                  onChange={setIntegration}
                  options={['(None)', 'pypi_access_integration', 'external_dbt_packages']}
                />
              </SettingRow>
              <SettingRow title="Secrets" desc="Credentials and tokens available to managed runs.">
                <button className="h-8 rounded border border-border-strong bg-input-bg px-3 text-[13px] text-text hover:border-text-muted">
                  Manage secrets…
                </button>
              </SettingRow>
            </Section>

            {/* ── Version & Packages ── */}
            <Section title="dbt" subtitle="Version & Packages">
              <SettingRow title="dbt Version" desc="Version used for Snowflake Managed runs.">
                <Select
                  value={version}
                  onChange={setVersion}
                  options={['dbt Core 1.10.15 (default)', 'dbt Core 1.9.4', 'dbt Core 1.8.9']}
                />
              </SettingRow>
              <SettingRow
                title="Auto-install Packages"
                desc="Run dbt deps automatically when packages.yml changes."
              >
                <Toggle on={autoDeps} onChange={setAutoDeps} label="Auto-run dbt deps" />
              </SettingRow>
            </Section>

            {/* ── Governance & Cost ── */}
            <Section title="dbt" subtitle="Governance & Cost">
              <SettingRow title="Query Tag" desc="Tag managed-run queries for cost attribution in Snowflake.">
                <input
                  value={queryTag}
                  onChange={(e) => setQueryTag(e.target.value)}
                  className="h-8 w-56 rounded border border-border-strong bg-input-bg px-2 font-mono text-[13px] text-text outline-none focus:border-accent"
                />
              </SettingRow>
            </Section>

            {/* ── Observability ── */}
            <Section title="dbt" subtitle="Observability">
              <SettingRow title="Log Level" desc="Verbosity of managed run logs.">
                <Select value={logLevel} onChange={setLogLevel} options={['error', 'warn', 'info', 'debug']} />
              </SettingRow>
              <SettingRow title="Run History Retention" desc="How long to keep managed run history.">
                <Select
                  value={retention}
                  onChange={setRetention}
                  options={['7 days', '30 days', '90 days', '1 year']}
                />
              </SettingRow>
            </Section>
          </>
        ) : (
          /* ── Local environment (lean) ── */
          <Section title="dbt" subtitle="Local Environment">
            <SettingRow title="Python Interpreter" desc="Path to the Python environment with dbt installed.">
              <input
                value={pythonPath}
                onChange={(e) => setPythonPath(e.target.value)}
                className="h-8 w-72 rounded border border-border-strong bg-input-bg px-2 font-mono text-[13px] text-text outline-none focus:border-accent"
              />
            </SettingRow>
            <SettingRow title="profiles.yml Path" desc="Location of your dbt connection profiles.">
              <input
                value={profilesPath}
                onChange={(e) => setProfilesPath(e.target.value)}
                className="h-8 w-72 rounded border border-border-strong bg-input-bg px-2 font-mono text-[13px] text-text outline-none focus:border-accent"
              />
            </SettingRow>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-7">
      <div className="border-b border-border pb-2 text-[13px] font-semibold text-text-bright">
        {title} <span className="text-text-muted">›</span> {subtitle}
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  )
}

function SettingRow({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="py-4">
      <div className="text-[13px] font-medium text-text">{title}</div>
      <div className="mt-0.5 text-[12px] text-text-muted">{desc}</div>
      <div className="mt-2.5">{children}</div>
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
      className="h-8 min-w-56 rounded border border-border-strong bg-input-bg px-2 text-[13px] text-text outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  )
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button onClick={() => onChange(!on)} className="flex items-center gap-2 text-[13px] text-text">
      <span
        className={`relative h-4 w-7 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-border-strong'}`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? 'left-3.5' : 'left-0.5'}`}
        />
      </span>
      <span className="text-text-muted">{label}</span>
    </button>
  )
}
