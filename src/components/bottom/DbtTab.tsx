import { useState } from 'react'
import {
  ChevronDown,
  RefreshCw,
  Square,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Info,
  Copy,
  X,
  Workflow,
  Columns3,
  Snowflake,
  Laptop,
} from 'lucide-react'
import { dbtOutputError } from '../../data/mockData'
import { LineageGraph } from './LineageGraph'

type RunMode = 'snowflake' | 'local'

type SubTab = 'lineage' | 'output' | 'docs' | 'compiled'

function Dropdown({
  icon,
  label,
  prefix,
}: {
  icon?: React.ReactNode
  label: string
  prefix?: string
}) {
  return (
    <button className="flex h-6 items-center gap-1.5 rounded border border-border-strong bg-chrome-bg px-2 text-[12px] text-text hover:border-text-muted">
      {icon}
      {prefix && <span className="text-text-muted">{prefix}</span>}
      <span>{label}</span>
      <ChevronDown size={12} className="text-text-muted" />
    </button>
  )
}

export function DbtTab() {
  const [sub, setSub] = useState<SubTab>('lineage')
  const [direction, setDirection] = useState<'upstream' | 'downstream'>('upstream')
  const [runMode, setRunMode] = useState<RunMode>('snowflake')

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar row 1: project + profile + run controls */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-2">
        <Dropdown
          icon={<Workflow size={13} className="text-[#4db8c4]" />}
          label="tasty_bytes_dbt_demo"
        />
        <Dropdown prefix="profile" label="dev" />
        <div className="flex items-center">
          <button className="flex h-6 items-center gap-1.5 rounded-l bg-accent px-2.5 text-[12px] font-medium text-white hover:bg-accent-hover">
            <RefreshCw size={12} />
            Compile
          </button>
          <button className="flex h-6 items-center rounded-r border-l border-white/20 bg-accent px-1 text-white hover:bg-accent-hover">
            <ChevronDown size={13} />
          </button>
          <button className="ml-1.5 flex h-6 w-6 items-center justify-center rounded border border-border-strong text-text-muted hover:text-text">
            <Square size={11} className="fill-current" />
          </button>
        </div>

        {/* run mode toggle (Local / Snowflake Managed) */}
        <button
          onClick={() => setRunMode((m) => (m === 'snowflake' ? 'local' : 'snowflake'))}
          title="Toggle dbt execution mode"
          className="ml-auto flex h-6 items-center gap-1.5 rounded-full border border-border-strong bg-chrome-bg px-2.5 text-[11px] text-text-muted hover:text-text"
        >
          {runMode === 'snowflake' ? (
            <>
              <Snowflake size={12} className="text-[#29b5e8]" />
              Snowflake Managed
            </>
          ) : (
            <>
              <Laptop size={12} className="text-text" />
              Local
            </>
          )}
        </button>
      </div>

      {/* Toolbar row 2: sub-tabs + nav + lineage controls */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-2">
        <div className="flex items-center gap-1">
          {(['lineage', 'output', 'docs', 'compiled'] as SubTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setSub(t)}
              className={`rounded px-2.5 py-1 text-[12px] capitalize ${
                sub === t ? 'bg-accent/80 text-white' : 'text-text-muted hover:text-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pl-1 text-text-muted">
          <ArrowLeft size={14} className="opacity-50" />
          <ArrowRight size={14} className="opacity-50" />
          <Info size={13} className="hover:text-text" />
          <RotateCw size={13} className="hover:text-text" />
        </div>

        {sub === 'lineage' && (
          <div className="ml-auto flex items-center gap-3">
            {/* upstream / downstream toggle */}
            <div className="flex items-center overflow-hidden rounded border border-border-strong text-[12px]">
              <button
                onClick={() => setDirection('upstream')}
                className={`px-2.5 py-1 ${
                  direction === 'upstream' ? 'bg-accent/80 text-white' : 'text-text-muted hover:text-text'
                }`}
              >
                Upstream
              </button>
              <button
                onClick={() => setDirection('downstream')}
                className={`px-2.5 py-1 ${
                  direction === 'downstream' ? 'bg-accent/80 text-white' : 'text-text-muted hover:text-text'
                }`}
              >
                Downstream
              </button>
            </div>
            {/* depth */}
            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
              <span>Depth:</span>
              <input
                defaultValue={5}
                className="h-6 w-10 rounded border border-border-strong bg-chrome-bg px-2 text-center text-text outline-none focus:border-accent"
              />
            </div>
            {/* columns */}
            <button className="flex h-6 items-center gap-1.5 rounded border border-border-strong px-2 text-[12px] text-text-muted hover:text-text">
              <Columns3 size={13} />
              Columns
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1">
        {sub === 'lineage' && <LineageGraph />}
        {sub === 'output' && <OutputContent />}
        {sub === 'docs' && (
          <div className="flex h-full items-center justify-center text-[13px] text-text-muted">
            dbt docs will render here
          </div>
        )}
        {sub === 'compiled' && (
          <div className="flex h-full items-center justify-center text-[13px] text-text-muted">
            Compiled SQL will appear here
          </div>
        )}
      </div>
    </div>
  )
}

function OutputContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Output
        </span>
        <button className="text-[11px] text-text-muted hover:text-text">Clear All</button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-2 font-mono text-[12.5px]">
        {dbtOutputError.map((entry, i) => (
          <div key={i} className="group mb-2 rounded border border-border/60">
            <div className="flex items-center gap-2 px-2 py-1">
              <X size={13} className="text-[#f14c4c]" />
              <span className="text-text">{entry.command}</span>
              {entry.time && (
                <span className="ml-auto flex items-center gap-2 text-[11px] text-text-muted">
                  <span>
                    {entry.time} · {entry.duration}
                  </span>
                  <Copy size={12} className="opacity-0 group-hover:opacity-100" />
                  <X size={13} className="opacity-0 group-hover:opacity-100" />
                </span>
              )}
            </div>
            {entry.detail && (
              <div className="whitespace-pre-wrap px-7 pb-2 text-[12px] text-[#f0a0a0]">
                {entry.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
