import { useEffect, useRef, useState } from 'react'
import {
  X,
  ChevronRight,
  SplitSquareHorizontal,
  MoreHorizontal,
  Play,
  Hammer,
  Table,
  Eye,
  Code2,
  FileCode2,
  BookText,
  Settings,
} from 'lucide-react'
import { tokenColors } from '../data/mockData'
import {
  displayName,
  getFileContent,
  getFileKind,
  getFilePath,
  isDbtModel,
  isResultsTab,
  resultsTabModel,
} from '../data/files'
import { FileIcon } from './FileIcon'
import { Tooltip } from './ui/Tooltip'
import { PortalMenu, type MenuEntry } from './ui/Menu'
import { ResultsTable } from './bottom/ResultsTable'
import { ModelDocsPane } from './bottom/DocsEditor'
import { SettingsPage } from './SettingsPage'
import { isSettingsTab, type RunMode } from '../data/settings'

// A table glyph with a small eye, signalling "preview the data".
function DataPreviewIcon({ size = 15 }: { size?: number }) {
  return (
    <span className="relative inline-flex">
      <Table size={size} />
      <span className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center rounded-full bg-chrome-bg p-px text-text-muted group-hover:bg-hover-bg group-hover:text-text">
        <Eye size={9} />
      </span>
    </span>
  )
}

type EditorAction = { key: string; label: string; icon: React.ReactNode; onClick: () => void }

// File action icons with responsive overflow: at most 4 icons are shown, and
// fewer as the pane narrows; the remainder collapse into a "More" dropdown.
function ToolbarActions({ actions, paneWidth }: { actions: EditorAction[]; paneWidth: number }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const moreRef = useRef<HTMLButtonElement>(null)

  // Only collapse once the pane is narrow (~split-pane width). Above that, show
  // every icon; below it, cap at 4 and shed more as it tightens.
  let cap = actions.length
  if (paneWidth <= 500) cap = 4
  if (paneWidth < 460) cap = 3
  if (paneWidth < 400) cap = 2
  if (paneWidth < 340) cap = 1

  const visible = Math.min(cap, actions.length)
  const shown = actions.slice(0, visible)
  const overflow = actions.slice(visible)
  const items: MenuEntry[] = overflow.map((a) => ({ label: a.label, onClick: a.onClick }))

  return (
    <>
      {shown.map((a) => (
        <Tooltip key={a.key} label={a.label}>
          <button onClick={a.onClick} className="group rounded p-1 hover:bg-hover-bg hover:text-text">
            {a.icon}
          </button>
        </Tooltip>
      ))}
      {overflow.length > 0 && (
        <>
          <Tooltip label="More dbt Actions...">
            <button
              ref={moreRef}
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded p-1 hover:bg-hover-bg hover:text-text"
            >
              <MoreHorizontal size={16} />
            </button>
          </Tooltip>
          <PortalMenu
            anchorRef={moreRef}
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            items={items}
            width={200}
          />
        </>
      )}
    </>
  )
}

// Breadcrumb + body for a single file (code or a results table). Shared by the
// primary editor pane and the right-hand split pane.
function FileBody({ name }: { name: string }) {
  const isResults = isResultsTab(name)
  const resultModel = isResults ? resultsTabModel(name) : name
  const content = !isResults ? getFileContent(name) : null
  const breadcrumbKind = isResults ? getFileKind(resultModel) : content?.kind
  const path = isResults ? [...getFilePath(resultModel), 'Results'] : getFilePath(name)

  return (
    <>
      <div className="flex h-6 shrink-0 items-center gap-0.5 overflow-hidden bg-editor-bg px-3 text-[12px] text-text-muted">
        {path.map((crumb, i) => (
          <span key={`${crumb}-${i}`} className="flex shrink-0 items-center gap-0.5">
            {i === path.length - 1 && <FileIcon kind={breadcrumbKind} />}
            <span className="hover:text-text">{crumb}</span>
            {i < path.length - 1 && <ChevronRight size={13} />}
          </span>
        ))}
        <span className="ml-1">···</span>
      </div>

      {isResults ? (
        <div className="min-h-0 flex-1 overflow-hidden bg-editor-bg">
          <ResultsTable model={resultModel} />
        </div>
      ) : content ? (
        <div className="flex min-h-0 flex-1 overflow-auto bg-editor-bg font-mono text-[13px] leading-[20px]">
          <div className="shrink-0 select-none pt-1 pr-3 pl-3 text-right text-text-dim">
            {content.lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <div className="flex-1 pt-1">
            {content.lines.map((line, i) => (
              <div key={i} className="whitespace-pre px-1">
                {line.map((tok, j) => (
                  <span key={j} style={{ color: tokenColors[tok.color] }}>
                    {tok.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}

export function EditorPane({
  tabs,
  activeFile,
  onSelectTab,
  onCloseTab,
  onPreview,
  onRunDbt,
  compiledModels,
  onViewCompiled,
  onViewDocs,
  splitFile,
  splitDocs,
  onCloseSplit,
  runMode,
  onRunModeChange,
}: {
  tabs: string[]
  activeFile: string
  onSelectTab: (name: string) => void
  onCloseTab: (name: string) => void
  onPreview: (name: string) => void
  onRunDbt: (action: 'run' | 'build' | 'compile', name: string) => void
  compiledModels: Set<string>
  onViewCompiled: (name: string) => void
  onViewDocs: (name: string) => void
  splitFile: string | null
  splitDocs: string | null
  onCloseSplit: () => void
  runMode: RunMode
  onRunModeChange: (mode: RunMode) => void
}) {
  const hasFile = activeFile && tabs.includes(activeFile)
  const showDbtActions = hasFile && isDbtModel(activeFile)
  // "View Compiled SQL" only once the SQL model has actually been compiled.
  const showViewCompiled =
    showDbtActions && activeFile.endsWith('.sql') && compiledModels.has(activeFile)

  // Track the primary pane width so the action toolbar can collapse into a
  // "More" dropdown as the editor narrows (e.g. when split panes are open).
  const primaryRef = useRef<HTMLDivElement>(null)
  const [paneWidth, setPaneWidth] = useState(Infinity)
  useEffect(() => {
    const el = primaryRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setPaneWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const dbtActions: EditorAction[] = showDbtActions
    ? [
        { key: 'run', label: 'Run', icon: <Play size={15} />, onClick: () => onRunDbt('run', activeFile) },
        { key: 'build', label: 'Build', icon: <Hammer size={15} />, onClick: () => onRunDbt('build', activeFile) },
        { key: 'preview', label: 'Preview Data', icon: <DataPreviewIcon size={15} />, onClick: () => onPreview(activeFile) },
        { key: 'compile', label: 'Compile', icon: <Code2 size={15} />, onClick: () => onRunDbt('compile', activeFile) },
        ...(showViewCompiled
          ? [{ key: 'compiled', label: 'View Compiled SQL', icon: <FileCode2 size={15} />, onClick: () => onViewCompiled(activeFile) }]
          : []),
        { key: 'docs', label: 'View Docs', icon: <BookText size={15} />, onClick: () => onViewDocs(activeFile) },
      ]
    : []

  return (
    <div className="flex min-h-0 flex-1 bg-editor-bg">
      {/* Primary pane */}
      <div ref={primaryRef} className="flex min-h-0 min-w-0 flex-1 flex-col bg-editor-bg">
        {/* Tab strip */}
        <div className="flex h-9 shrink-0 items-stretch justify-between bg-chrome-bg">
          <div className="flex min-w-0 items-stretch">
            {tabs.map((tab) => {
              const active = tab === activeFile
              return (
                <div
                  key={tab}
                  onClick={() => onSelectTab(tab)}
                  className={`group flex h-9 min-w-0 shrink cursor-pointer items-center gap-2 border-r border-border px-3 text-[13px] ${
                    active
                      ? 'bg-editor-bg text-text-bright'
                      : 'bg-chrome-bg text-text-muted hover:bg-editor-bg/40'
                  }`}
                >
                  {isSettingsTab(tab) ? (
                    <Settings size={14} className="shrink-0" />
                  ) : (
                    <FileIcon kind={getFileKind(tab)} />
                  )}
                  <span className="truncate">{displayName(tab)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCloseTab(tab)
                    }}
                    className={`ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-hover-bg ${
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-1 pl-4 pr-3 text-text-muted">
            {showDbtActions && (
              <>
                <ToolbarActions actions={dbtActions} paneWidth={paneWidth} />
                <span className="mx-1 h-4 w-px bg-border" />
              </>
            )}
            <Tooltip label="Split Editor Right">
              <button className="rounded p-1 hover:bg-hover-bg hover:text-text">
                <SplitSquareHorizontal size={15} />
              </button>
            </Tooltip>
            <Tooltip label="More Actions...">
              <button className="rounded p-1 hover:bg-hover-bg hover:text-text">
                <MoreHorizontal size={16} />
              </button>
            </Tooltip>
          </div>
        </div>

        {!hasFile ? (
          <div className="flex flex-1 items-center justify-center text-[13px] text-text-dim">
            No file open
          </div>
        ) : isSettingsTab(activeFile) ? (
          <SettingsPage runMode={runMode} onRunModeChange={onRunModeChange} />
        ) : (
          <FileBody name={activeFile} />
        )}
      </div>

      {/* Right split pane: compiled SQL (splitFile) or model docs (splitDocs) */}
      {(splitFile || splitDocs) && (
        <div className="flex min-h-0 w-1/2 min-w-0 flex-col border-l border-border bg-editor-bg">
          <div className="flex h-9 shrink-0 items-stretch justify-between bg-chrome-bg">
            <div className="flex min-w-0 items-stretch">
              <div className="group flex h-9 min-w-0 items-center gap-2 border-r border-border bg-editor-bg px-3 text-[13px] text-text-bright">
                {splitDocs ? (
                  <BookText size={14} className="shrink-0" />
                ) : (
                  <FileIcon kind={getFileKind(splitFile!)} />
                )}
                <span className="truncate">
                  {splitDocs ? `Docs: ${displayName(splitDocs)}` : displayName(splitFile!)}
                </span>
                <button
                  onClick={onCloseSplit}
                  className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-hover-bg"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1 pr-3 text-text-muted">
              <Tooltip label="Split Editor Right">
                <button className="rounded p-1 hover:bg-hover-bg hover:text-text">
                  <SplitSquareHorizontal size={15} />
                </button>
              </Tooltip>
              <Tooltip label="More Actions...">
                <button className="rounded p-1 hover:bg-hover-bg hover:text-text">
                  <MoreHorizontal size={16} />
                </button>
              </Tooltip>
            </div>
          </div>
          {splitDocs ? <ModelDocsPane model={splitDocs} /> : <FileBody name={splitFile!} />}
        </div>
      )}
    </div>
  )
}
