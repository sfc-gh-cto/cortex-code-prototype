import { useRef, useState } from 'react'
import { TitleBar } from './TitleBar'
import { ActivityBar, type SidebarView } from './ActivityBar'
import { Sidebar } from './Sidebar'
import { EditorPane } from './EditorPane'
import { BottomPanel, type BottomTab } from './bottom/BottomPanel'
import { type PreviewState } from './bottom/SqlResultsTab'
import { SessionPanel } from './SessionPanel'
import { ProjectCommandBar } from './ProjectCommandBar'
import { DEFAULT_MANAGED, type ManagedConfig } from './ManagedCommandBar'
import { StatusBar } from './StatusBar'
import { ResizeHandle } from './ResizeHandle'
import { TerminalProvider } from './bottom/terminalStore'
import { resultsTabName, compiledPathFor, dbtModelNames, dbtProjectRoots, getFilePath } from '../data/files'
import { fileToLineage, lineageByProject } from '../data/mockData'
import { SETTINGS_TAB, type RunMode } from '../data/settings'
import { getDbtOutput, type DbtAction, type OutputLine } from '../data/dbtOutput'

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

// "orders.sql" → "orders" (dbt selects models by name, not filename).
const modelToken = (name: string) => name.replace(/\.(sql|py)$/, '')

export function Shell() {
  const [sidebarView, setSidebarView] = useState<SidebarView>('explorer')

  // open editor tabs + the currently focused file
  const [openTabs, setOpenTabs] = useState<string[]>([
    'settings.json',
    'profiles.yml',
    'dbt_project.yml',
    'orders.sql',
    'sales_metrics_by_location.py',
    'README.md',
  ])
  const [activeFile, setActiveFile] = useState('profiles.yml')

  function openFile(name: string) {
    setActiveFile(name)
    setOpenTabs((tabs) => (tabs.includes(name) ? tabs : [...tabs, name]))
  }

  function closeTab(name: string) {
    setOpenTabs((tabs) => {
      const idx = tabs.indexOf(name)
      const next = tabs.filter((t) => t !== name)
      if (name === activeFile) {
        const fallback = next[idx] ?? next[idx - 1] ?? ''
        setActiveFile(fallback)
      }
      return next
    })
  }

  // visibility
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [bottomOpen, setBottomOpen] = useState(true)
  const [bottomMaximized, setBottomMaximized] = useState(false)
  const [sessionOpen, setSessionOpen] = useState(false)

  function toggleBottom() {
    setBottomOpen((o) => {
      if (o) setBottomMaximized(false)
      return !o
    })
  }

  function toggleBottomMaximize() {
    setBottomOpen(true)
    setBottomMaximized((m) => !m)
  }

  function closeBottom() {
    setBottomOpen(false)
    setBottomMaximized(false)
  }

  // bottom panel active tab + the model currently being previewed
  const [bottomTab, setBottomTab] = useState<BottomTab>('dbt')
  const [preview, setPreview] = useState<PreviewState | null>(null)

  // Lineage tab state (project + selected node). Lifted here so it persists
  // while the tab is hidden, and stays linked to the active editor file.
  const firstProject = dbtProjectRoots[0] ?? 'tasty_bytes_dbt_demo'
  const [lineageProject, setLineageProject] = useState(firstProject)
  const [lineageNode, setLineageNode] = useState<string | null>(
    lineageByProject[firstProject]?.defaultSelected ?? null,
  )

  // Link with editor (default on). Done during render (React's "adjust state on
  // prop change" pattern) so it never force-switches the bottom tab — the lineage
  // just stays focused, ready when the user opens the Lineage tab.
  //  • A model file → focus its node (and switch project if needed).
  //  • Any other file in a dbt project → follow that project (default node).
  const [syncedFile, setSyncedFile] = useState('')
  if (activeFile !== syncedFile) {
    setSyncedFile(activeFile)
    const ref = fileToLineage[activeFile]
    if (ref) {
      setLineageProject(ref.project)
      setLineageNode(ref.nodeId)
    } else {
      const proj = getFilePath(activeFile)[0]
      if (dbtProjectRoots.includes(proj) && proj !== lineageProject) {
        setLineageProject(proj)
        setLineageNode(lineageByProject[proj]?.defaultSelected ?? null)
      }
    }
  }

  // Manual project switch from the tab bar: keep the current node if it belongs
  // to the new project, otherwise fall back to that project's default node.
  function changeLineageProject(project: string) {
    setLineageProject(project)
    const graph = lineageByProject[project]
    const stillValid = lineageNode && graph?.nodes.some((n) => n.id === lineageNode)
    if (!stillValid) setLineageNode(graph?.defaultSelected ?? null)
  }

  // text shown in the project command bar input (local mode)
  const [command, setCommand] = useState('')
  // Snowflake Managed structured command state (operation + flags + run context),
  // lifted here so editor toolbar actions can reflect the selected model.
  const [managedConfig, setManagedConfig] = useState<ManagedConfig>(DEFAULT_MANAGED)

  // Recently run dbt commands (most-recent first, de-duplicated), surfaced in the
  // command bar so the user can quickly re-run a previous command.
  const [recentCommands, setRecentCommands] = useState<string[]>([])
  function addRecent(cmd: string) {
    const c = cmd.trim()
    if (!c) return
    setRecentCommands((prev) => [c, ...prev.filter((x) => x !== c)].slice(0, 8))
  }

  // History of flag strings used in managed runs (most-recent first, de-duplicated),
  // navigable with ↑/↓ in the command bar's flags input.
  const [flagHistory, setFlagHistory] = useState<string[]>([])
  function recordFlags(flags: string) {
    const f = flags.trim()
    if (!f) return
    setFlagHistory((prev) => [f, ...prev.filter((x) => x !== f)].slice(0, 25))
  }

  // Per-model flag memory: each model remembers the flags it was last run/configured
  // with (keyed by model token). `dbtModel` is the model the managed config currently
  // represents, so edits to the flags input are attributed to the right model.
  const [modelFlags, setModelFlags] = useState<Record<string, string>>({})
  const [dbtModel, setDbtModel] = useState<string | null>(null)
  // Bumped to ask the command bar to focus its flags input ("Run with flags…").
  const [flagsFocusSignal, setFlagsFocusSignal] = useState(0)

  // Managed config edits: persist the flags back to the active model's memory.
  function handleManagedConfigChange(next: ManagedConfig) {
    setManagedConfig(next)
    if (dbtModel) setModelFlags((m) => ({ ...m, [dbtModel]: next.flags }))
  }

  function previewModel(name: string) {
    const sel = `--select ${modelToken(name)}`
    setCommand(`dbt show ${sel}`)
    setManagedConfig((c) => ({ ...c, flags: sel }))
    setPreview((p) => ({ model: name, key: (p?.key ?? 0) + 1 }))
    setBottomTab('sql')
    setBottomOpen(true)
  }

  // Editor run menu: recall this model's saved flags, reflect them in the command
  // bar (the managed operation + flags and the local command text), remember them
  // per model, then execute. "Show" opens the SQL results preview instead.
  function runDbtFromEditor(action: DbtAction, model: string) {
    const token = modelToken(model)
    const flags = modelFlags[token] ?? `--select ${token}`
    setDbtModel(token)
    setManagedConfig((c) => ({ ...c, operation: action, flags }))
    const cmd = `dbt ${action} ${flags}`
    setCommand(cmd)
    addRecent(cmd)
    recordFlags(flags)
    if (action === 'show') previewModel(model)
    else runDbt(action, model)
  }

  // Like runDbtFromEditor, but pre-fills the command (recalling the model's saved
  // flags) WITHOUT running, then focuses the command bar's flags input so the user
  // can tweak flags before running.
  function stageDbtFromEditor(action: DbtAction, model: string) {
    const token = modelToken(model)
    const flags = modelFlags[token] ?? `--select ${token}`
    setDbtModel(token)
    setManagedConfig((c) => ({ ...c, operation: action, flags }))
    setCommand(`dbt ${action} ${flags}`)
    setFlagsFocusSignal((n) => n + 1)
  }

  function openResultsInEditor(model: string) {
    openFile(resultsTabName(model))
  }

  // dbt execution mode (shared by the command bar + Settings UI)
  const [runMode, setRunMode] = useState<RunMode>('snowflake')

  // editor split pane (right side): either compiled SQL or model docs (exclusive)
  const [splitFile, setSplitFile] = useState<string | null>(null)
  const [splitDocs, setSplitDocs] = useState<string | null>(null)
  const [compiledModels, setCompiledModels] = useState<Set<string>>(new Set())

  function viewCompiled(model: string) {
    setSplitDocs(null)
    setSplitFile(compiledPathFor(model))
  }

  function viewDocs(model: string) {
    setSplitFile(null)
    setSplitDocs(model)
  }

  function closeSplit() {
    setSplitFile(null)
    setSplitDocs(null)
  }

  // dbt Output channel
  const [outputChannel, setOutputChannel] = useState('dbt')
  const [dbtOutput, setDbtOutput] = useState<OutputLine[]>([])
  const [dbtRunning, setDbtRunning] = useState(false)
  const runIdRef = useRef(0)

  // Stream a precomputed log into the dbt Output channel line-by-line. onDone
  // fires once the stream finishes (and wasn't superseded by a newer run).
  function streamOutput(lines: OutputLine[], onDone?: () => void) {
    const runId = ++runIdRef.current

    setOutputChannel('dbt')
    setBottomTab('output')
    setBottomOpen(true)
    setDbtOutput([])
    setDbtRunning(true)

    let i = 0
    const step = () => {
      if (runIdRef.current !== runId) return // a newer run superseded this one
      i += 1
      setDbtOutput(lines.slice(0, i))
      if (i >= lines.length) {
        setDbtRunning(false)
        onDone?.()
        return
      }
      window.setTimeout(step, 90)
    }
    window.setTimeout(step, 120)
  }

  function runDbt(action: DbtAction, model?: string) {
    streamOutput(getDbtOutput(action, model), () => {
      // compile/build produce compiled artifacts: a single model, or the whole
      // project when triggered from the command bar (no model).
      setCompiledModels((prev) => {
        const next = new Set(prev)
        if (model) next.add(model)
        else dbtModelNames.forEach((m) => next.add(m))
        return next
      })
    })
  }

  // Active dbt project (shared by the command bar).
  const [project, setProject] = useState(dbtProjectRoots[0] ?? 'tasty_bytes_dbt_demo')

  // Run whatever is typed in the command bar (parse action + optional --select).
  function runCommand(text: string) {
    addRecent(text)
    if (runMode === 'snowflake') recordFlags(managedConfig.flags)
    const c = text.trim().toLowerCase()
    const action: DbtAction = c.includes('compile') ? 'compile' : c.includes('run') ? 'run' : 'build'
    const model = text.match(/--select\s+(\S+)/)?.[1]
    runDbt(action, model)
  }

  // Cancel an in-flight run: supersede the stream and note the cancellation.
  function stopDbt() {
    runIdRef.current += 1
    setDbtRunning(false)
    setDbtOutput((o) => [...o, { text: '' }, { text: 'Run cancelled.', tone: 'warn' }])
  }

  // sizes (px)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [sessionWidth, setSessionWidth] = useState(360)
  const [bottomHeight, setBottomHeight] = useState(300)

  // Clicking the active view toggles the sidebar; a different view switches + opens it.
  function handleSelectView(view: SidebarView) {
    if (view === sidebarView) {
      setSidebarOpen((o) => !o)
    } else {
      setSidebarView(view)
      setSidebarOpen(true)
    }
  }

  return (
    <TerminalProvider>
    <div className="flex h-full w-full flex-col bg-app-bg text-text">
      <TitleBar
        sidebarOpen={sidebarOpen}
        bottomOpen={bottomOpen}
        sessionOpen={sessionOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onToggleBottom={toggleBottom}
        onToggleSession={() => setSessionOpen((o) => !o)}
        onOpenFile={openFile}
      />

      <div className="flex min-h-0 flex-1">
        <ActivityBar active={sidebarOpen ? sidebarView : null} onSelect={handleSelectView} />

        {sidebarOpen && (
          <>
            <div style={{ width: sidebarWidth }} className="flex shrink-0">
              <Sidebar
                view={sidebarView}
                selectedFile={activeFile}
                onSelectFile={openFile}
              />
            </div>
            <ResizeHandle
              orientation="x"
              onResize={(d) => setSidebarWidth((w) => clamp(w + d, 170, 560))}
            />
          </>
        )}

        {/* center: editor (top) + bottom panel */}
        <div className="flex min-w-0 flex-1 flex-col">
          {!bottomMaximized && (
            <div className="min-h-0 flex-1 overflow-hidden">
              <EditorPane
                tabs={openTabs}
                activeFile={activeFile}
                onSelectTab={setActiveFile}
                onCloseTab={closeTab}
                onPreview={previewModel}
                onRunDbt={runDbtFromEditor}
                onStageDbt={stageDbtFromEditor}
                compiledModels={compiledModels}
                onViewCompiled={viewCompiled}
                onViewDocs={viewDocs}
                splitFile={splitFile}
                splitDocs={splitDocs}
                onCloseSplit={closeSplit}
                runMode={runMode}
                onRunModeChange={setRunMode}
              />
            </div>
          )}
          {bottomOpen && (
            <>
              {!bottomMaximized && (
                <ResizeHandle
                  orientation="y"
                  onResize={(d) => setBottomHeight((h) => clamp(h - d, 120, 640))}
                />
              )}
              <div
                style={bottomMaximized ? undefined : { height: bottomHeight }}
                className={`overflow-hidden ${bottomMaximized ? 'min-h-0 flex-1' : 'shrink-0'}`}
              >
                <BottomPanel
                  tab={bottomTab}
                  onTabChange={setBottomTab}
                  onClose={closeBottom}
                  maximized={bottomMaximized}
                  onToggleMaximize={toggleBottomMaximize}
                  preview={preview}
                  onOpenResultsInEditor={openResultsInEditor}
                  outputChannel={outputChannel}
                  onOutputChannelChange={setOutputChannel}
                  dbtOutput={dbtOutput}
                  dbtRunning={dbtRunning}
                  onClearOutput={() => setDbtOutput([])}
                  lineageProject={lineageProject}
                  onLineageProjectChange={changeLineageProject}
                  lineageNode={lineageNode}
                  onLineageNodeChange={setLineageNode}
                  onOpenFile={openFile}
                />
              </div>
            </>
          )}

          {/* project-centric command bar pinned to the bottom of the workbench */}
          <ProjectCommandBar
            command={command}
            onCommandChange={setCommand}
            managedConfig={managedConfig}
            onManagedConfigChange={handleManagedConfigChange}
            recentCommands={recentCommands}
            onRunRecent={runCommand}
            flagHistory={flagHistory}
            focusFlagsSignal={flagsFocusSignal}
            running={dbtRunning}
            onRun={runCommand}
            onStop={stopDbt}
            onOpenSettings={() => openFile(SETTINGS_TAB)}
            runMode={runMode}
            onRunModeChange={setRunMode}
            project={project}
            onProjectChange={setProject}
          />
        </div>

        {sessionOpen && (
          <>
            <ResizeHandle
              orientation="x"
              onResize={(d) => setSessionWidth((w) => clamp(w - d, 280, 640))}
            />
            <div style={{ width: sessionWidth }} className="flex shrink-0">
              <SessionPanel onClose={() => setSessionOpen(false)} />
            </div>
          </>
        )}
      </div>

      <StatusBar />
    </div>
    </TerminalProvider>
  )
}
