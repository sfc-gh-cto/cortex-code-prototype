import { useEffect, useRef, useState } from 'react'
import {
  X,
  ChevronRight,
  Play,
  Eye,
  FileCode,
  GitFork,
  BookOpen,
  SplitSquareHorizontal,
  Ellipsis,
  Copy,
  RefreshCw,
  ExternalLink,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { FileIcon } from './FileIcon'
import { highlightLine } from '../lib/highlight'
import { fileContents, PLACEHOLDER } from '../data/files'
import { compiledSql } from '../data/compiled'
import { CompiledView } from './views/CompiledView'
import type { DbtAction } from '../App'

// Per-model dbt actions. They live in the editor title (top right), never on the code.
const MODEL_ACTIONS: { action: DbtAction; label: string; short: string; icon: LucideIcon }[] = [
  { action: 'run', label: 'Run on Snowflake', short: 'Run', icon: Play },
  { action: 'preview', label: 'Preview Results', short: 'Preview', icon: Eye },
  { action: 'compile', label: 'Compile', short: 'Compile', icon: FileCode },
  { action: 'lineage', label: 'Show Lineage', short: 'Lineage', icon: GitFork },
  { action: 'docs', label: 'Generate Docs', short: 'Docs', icon: BookOpen },
]

export type TabKind = 'file' | 'lineage' | 'compiled'

export type Tab = {
  id: string
  name: string
  ext?: 'sql' | 'yml' | 'yaml' | 'csv' | 'md' | 'json'
  dirty?: boolean
  kind?: TabKind
  /** model name for lineage / compiled tabs */
  model?: string
}

function isRunnableModel(id: string) {
  return id.startsWith('models/') && id.endsWith('.sql')
}

function TitleAction({
  title,
  onClick,
  children,
}: {
  title: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-icon hover:bg-hover"
    >
      {children}
    </button>
  )
}

// The standard VS Code editor-title "More Actions" (…) overflow.
function MoreMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  const MenuItem = ({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1 text-left text-[13px] text-fg hover:bg-hover"
    >
      <Icon size={14} className="text-icon" />
      {label}
    </button>
  )

  return (
    <div ref={ref} className="relative">
      <TitleAction title="More Actions..." onClick={() => setOpen((o) => !o)}>
        <Ellipsis size={16} />
      </TitleAction>
      {open && (
        <div className="absolute right-0 top-8 z-50 min-w-[200px] overflow-hidden rounded-md border border-border-contrast bg-widget py-1 shadow-2xl">
          <MenuItem icon={SplitSquareHorizontal} label="Split Editor Right" onClick={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}

function Code({ id }: { id: string }) {
  const text = fileContents[id] ?? PLACEHOLDER
  const lines = text.replace(/\n$/, '').split('\n')
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-editor font-mono text-[13px] leading-[20px]">
      <div className="min-w-max py-2">
        {lines.map((line, i) => (
          <div key={i} className="flex min-w-full hover:bg-white/[0.02]">
            <span className="sticky left-0 w-[60px] shrink-0 select-none bg-editor pr-4 text-right text-fg-dim">
              {i + 1}
            </span>
            <span className="whitespace-pre pr-8 text-sx-text">{highlightLine(line)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabIcon({ tab }: { tab: Tab }) {
  if (tab.kind === 'lineage') return <GitFork size={15} className="text-fg-muted" />
  if (tab.kind === 'compiled') return <FileCode size={15} style={{ color: '#e38c3f' }} />
  return <FileIcon ext={tab.ext} size={15} />
}

export function EditorArea({
  tabs,
  activeId,
  target,
  onSelect,
  onClose,
  onAction,
}: {
  tabs: Tab[]
  activeId: string | null
  target: string
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onAction: (a: DbtAction) => void
}) {
  const active = tabs.find((t) => t.id === activeId) ?? null
  const kind: TabKind = active?.kind ?? 'file'
  const crumbs =
    active && kind === 'file'
      ? active.id.split('/')
      : active
        ? [active.model ?? '', kind === 'lineage' ? 'Lineage' : 'Compiled']
        : []
  const runnable = active ? kind === 'file' && isRunnableModel(active.id) : false
  const [copied, setCopied] = useState(false)

  const copyCompiled = () => {
    const sql = compiledSql(active?.model ?? 'orders')
    navigator.clipboard?.writeText(sql).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-editor">
      {/* Tabs + editor-title actions. 35px, like VS Code: a 1px accent on the
          active tab only, and a hairline under everything except that tab so
          the tab sits on the editor instead of floating into the status bar. */}
      <div className="flex h-[35px] shrink-0 bg-tabs-bar">
        <div className="flex h-full min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const isActive = t.id === activeId
            return (
              <div
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={`group relative flex h-full shrink-0 cursor-pointer items-center gap-1.5 border-r border-r-tabs-bar px-2.5 text-[13px] ${
                  isActive
                    ? 'bg-tab-active text-fg-bright'
                    : 'border-b border-b-[#2b2b2b] bg-tab-inactive text-[#969696] hover:text-fg'
                }`}
              >
                {isActive && <span className="absolute inset-x-0 top-0 h-px bg-accent" />}
                <TabIcon tab={t} />
                <span className="max-w-[160px] truncate">{t.name}</span>
                {t.dirty ? (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose(t.id)
                    }}
                    className="flex h-4 w-4 items-center justify-center rounded"
                  >
                    <span className="h-2 w-2 rounded-full bg-fg group-hover:hidden" />
                    <X size={14} className="hidden group-hover:block" />
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onClose(t.id)
                    }}
                    className="flex h-4 w-4 items-center justify-center rounded text-fg-muted opacity-0 hover:bg-hover group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )
          })}
          <div className="min-w-3 flex-1 border-b border-b-[#2b2b2b] bg-tabs-bar" />
        </div>

        {/* Editor-title actions stay in this row, never over the code. */}
        <div className="flex shrink-0 items-center gap-0.5 border-b border-b-[#2b2b2b] bg-tabs-bar pr-1 pl-1">
          {runnable &&
            MODEL_ACTIONS.map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.action}
                  title={a.label}
                  onClick={() => onAction(a.action)}
                  className="flex h-6 items-center gap-1 rounded px-1.5 text-[12px] text-[#cccccc] hover:bg-hover"
                >
                  <Icon size={13} className={a.action === 'run' ? 'fill-current text-success' : 'text-icon'} />
                  {a.short}
                </button>
              )
            })}
          {kind === 'compiled' && active && (
            <>
              <button
                title="Copy compiled SQL"
                onClick={copyCompiled}
                className="flex h-6 items-center gap-1 rounded px-1.5 text-[12px] text-[#cccccc] hover:bg-hover"
              >
                {copied ? <Check size={13} className="text-success" /> : <Copy size={13} className="text-icon" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                title="Recompile"
                onClick={() => onAction('compile')}
                className="flex h-6 items-center gap-1 rounded px-1.5 text-[12px] text-[#cccccc] hover:bg-hover"
              >
                <RefreshCw size={13} className="text-icon" />
                Recompile
              </button>
              <button
                title="Open in Snowsight"
                className="flex h-6 items-center gap-1 rounded px-1.5 text-[12px] text-[#cccccc] hover:bg-hover"
              >
                <ExternalLink size={13} className="text-icon" />
                Snowsight
              </button>
              <button
                title="Run on Snowflake"
                onClick={() => onAction('run')}
                className="flex h-6 items-center gap-1 rounded px-1.5 text-[12px] text-[#cccccc] hover:bg-hover"
              >
                <Play size={13} className="fill-current text-success" />
                Run
              </button>
            </>
          )}
          <TitleAction title="Split Editor">
            <SplitSquareHorizontal size={16} />
          </TitleAction>
          <MoreMenu />
        </div>
      </div>

      {/* Breadcrumbs */}
      {active && (
        <div className="flex h-[22px] shrink-0 items-center gap-1 border-b border-border bg-editor px-3 text-[12px] text-fg-muted">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={13} className="text-fg-dim" />}
              <span className="hover:text-fg">{c}</span>
            </span>
          ))}
        </div>
      )}

      {/* Body */}
      {!active ? (
        <div className="flex min-h-0 flex-1 items-center justify-center text-[13px] text-fg-dim">
          Open a file from the dbt project to get started
        </div>
      ) : kind === 'compiled' ? (
        <CompiledView model={active.model ?? 'orders'} target={target} />
      ) : (
        <Code id={active.id} />
      )}
    </div>
  )
}
