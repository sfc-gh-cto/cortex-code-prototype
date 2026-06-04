import {
  X,
  ChevronRight,
  SplitSquareHorizontal,
  MoreHorizontal,
  Hammer,
  Eye,
  Code2,
  FileCode2,
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
import { ResultsTable } from './bottom/ResultsTable'
import { SettingsPage } from './SettingsPage'
import { isSettingsTab, type RunMode } from '../data/settings'

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
  splitFile,
  onCloseSplit,
  onOpenSettings,
  runMode,
  onRunModeChange,
}: {
  tabs: string[]
  activeFile: string
  onSelectTab: (name: string) => void
  onCloseTab: (name: string) => void
  onPreview: (name: string) => void
  onRunDbt: (action: 'build' | 'compile', name: string) => void
  compiledModels: Set<string>
  onViewCompiled: (name: string) => void
  splitFile: string | null
  onCloseSplit: () => void
  onOpenSettings: () => void
  runMode: RunMode
  onRunModeChange: (mode: RunMode) => void
}) {
  const hasFile = activeFile && tabs.includes(activeFile)
  const showDbtActions = hasFile && isDbtModel(activeFile)
  // "View Compiled SQL" only once the SQL model has actually been compiled.
  const showViewCompiled =
    showDbtActions && activeFile.endsWith('.sql') && compiledModels.has(activeFile)

  return (
    <div className="flex min-h-0 flex-1 bg-editor-bg">
      {/* Primary pane */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-editor-bg">
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
                <Tooltip label="Build">
                  <button
                    onClick={() => onRunDbt('build', activeFile)}
                    className="rounded p-1 hover:bg-hover-bg hover:text-text"
                  >
                    <Hammer size={15} />
                  </button>
                </Tooltip>
                <Tooltip label="Preview">
                  <button
                    onClick={() => onPreview(activeFile)}
                    className="rounded p-1 hover:bg-hover-bg hover:text-text"
                  >
                    <Eye size={15} />
                  </button>
                </Tooltip>
                <Tooltip label="Compile">
                  <button
                    onClick={() => onRunDbt('compile', activeFile)}
                    className="rounded p-1 hover:bg-hover-bg hover:text-text"
                  >
                    <Code2 size={15} />
                  </button>
                </Tooltip>
                {showViewCompiled && (
                  <Tooltip label="View Compiled SQL">
                    <button
                      onClick={() => onViewCompiled(activeFile)}
                      className="rounded p-1 hover:bg-hover-bg hover:text-text"
                    >
                      <FileCode2 size={15} />
                    </button>
                  </Tooltip>
                )}
                <span className="mx-1 h-4 w-px bg-border" />
              </>
            )}
            {!isSettingsTab(activeFile) && (
              <Tooltip label="Settings">
                <button
                  onClick={onOpenSettings}
                  className="rounded p-1 hover:bg-hover-bg hover:text-text"
                >
                  <Settings size={15} />
                </button>
              </Tooltip>
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

      {/* Right split pane (e.g. compiled SQL) */}
      {splitFile && (
        <div className="flex min-h-0 w-1/2 min-w-0 flex-col border-l border-border bg-editor-bg">
          <div className="flex h-9 shrink-0 items-stretch justify-between bg-chrome-bg">
            <div className="flex min-w-0 items-stretch">
              <div className="group flex h-9 min-w-0 items-center gap-2 border-r border-border bg-editor-bg px-3 text-[13px] text-text-bright">
                <FileIcon kind={getFileKind(splitFile)} />
                <span className="truncate">{displayName(splitFile)}</span>
                <button
                  onClick={onCloseSplit}
                  className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-hover-bg"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1 pr-3 text-text-muted">
              <Tooltip label="Close Split">
                <button
                  onClick={onCloseSplit}
                  className="rounded p-1 hover:bg-hover-bg hover:text-text"
                >
                  <X size={15} />
                </button>
              </Tooltip>
            </div>
          </div>
          <FileBody name={splitFile} />
        </div>
      )}
    </div>
  )
}
