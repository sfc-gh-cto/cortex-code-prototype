import { useEffect, useRef, useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { ActivityBar, type ViewId } from './components/ActivityBar'
import { SideBar } from './components/SideBar'
import { EditorArea, type Tab } from './components/EditorArea'
import { Panel, type PanelTab } from './components/Panel'
import { StatusBar } from './components/StatusBar'
import { CommandPalette } from './components/CommandPalette'
import type { FileNode } from './data/project'
import type { Command } from './data/commands'
import { buildRunOutput, type OutputLine } from './data/runOutput'
import {
  projects,
  initialProjectConfigs,
  effectiveFlags,
  TARGETS,
  type ProjectConfig,
} from './data/extensionConfig'

// Actions the dbt extension can perform. All runs happen on Snowflake Managed.
export type DbtAction = 'run' | 'build' | 'test' | 'compile' | 'preview' | 'lineage' | 'docs' | 'deps'

function modelFromId(id: string | null): string | null {
  if (!id || !id.startsWith('models/') || !id.endsWith('.sql')) return null
  return id.slice(id.lastIndexOf('/') + 1, -'.sql'.length)
}

export default function App() {
  const [view, setView] = useState<ViewId>('dbt')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)
  const [panelTab, setPanelTab] = useState<PanelTab>('output')
  const [paletteOpen, setPaletteOpen] = useState(false)

  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'models/marts/orders.sql', name: 'orders.sql', ext: 'sql', dirty: true },
  ])
  const [activeId, setActiveId] = useState<string | null>('models/marts/orders.sql')

  const [outputLines, setOutputLines] = useState<OutputLine[]>([])
  const [running, setRunning] = useState(false)
  const [runningModel, setRunningModel] = useState<string | null>(null)
  const [hasPreview, setHasPreview] = useState(false)
  const [lineageModel, setLineageModel] = useState('orders')

  // A workspace can have multiple dbt projects; config is scoped per project.
  const [activeProject, setActiveProject] = useState(projects[0].id)
  const [configs, setConfigs] = useState<Record<string, ProjectConfig>>(initialProjectConfigs)
  const project = projects.find((p) => p.id === activeProject) ?? projects[0]
  const cfg = configs[activeProject]
  const updateCfg = (patch: Partial<ProjectConfig>) =>
    setConfigs((prev) => ({ ...prev, [activeProject]: { ...prev[activeProject], ...patch } }))

  const timer = useRef<number | null>(null)

  const openDbtPanel = () => {
    setSidebarOpen(true)
    setView('dbt')
  }

  // ⌘⇧P / Ctrl⇧P opens the command palette; Esc closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setPaletteOpen(true)
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p' && !e.shiftKey) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function openFile(node: FileNode) {
    if (node.type !== 'file') return
    setTabs((prev) =>
      prev.some((t) => t.id === node.id)
        ? prev
        : [...prev, { id: node.id, name: node.name, ext: node.ext, dirty: node.git === 'M' }],
    )
    setActiveId(node.id)
  }

  function openCompiled(model: string) {
    const id = `compiled:${model}`
    setTabs((prev) =>
      prev.some((t) => t.id === id) ? prev : [...prev, { id, name: `${model} (compiled)`, kind: 'compiled', model }],
    )
    setActiveId(id)
  }

  function closeTab(id: string) {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (id === activeId) setActiveId(next.length ? next[next.length - 1].id : null)
      return next
    })
  }

  function streamOutput(lines: OutputLine[]) {
    if (timer.current) window.clearTimeout(timer.current)
    setOutputLines([])
    setRunning(true)
    let i = 0
    const tick = () => {
      const line = lines[i]
      i += 1
      if (line) setOutputLines((prev) => [...prev, line])
      if (i < lines.length) timer.current = window.setTimeout(tick, 85)
      else {
        setRunning(false)
        setRunningModel(null)
      }
    }
    tick()
  }

  function runAction(action: DbtAction, flagsOverride?: string) {
    const activeTab = tabs.find((t) => t.id === activeId)
    const model = activeTab?.model ?? modelFromId(activeId) ?? 'orders'

    if (action === 'lineage') {
      setLineageModel(model)
      setPanelOpen(true)
      setPanelTab('lineage')
      return
    }

    if (action === 'compile') {
      openCompiled(model)
      return
    }

    setPanelOpen(true)

    if (action === 'preview') {
      setHasPreview(true)
      setPanelTab('results')
      return
    }

    if (action === 'docs') {
      setPanelTab('output')
      streamOutput([
        { text: `[Cortex dbt] Generating docs on Snowflake Managed…`, tone: 'info' },
        { text: `> EXECUTE DBT PROJECT ${project.profile} ARGS='docs generate'`, tone: 'cmd' },
        { text: `Catalog written to target/catalog.json`, tone: 'ok' },
        { text: `Done.`, tone: 'ok' },
      ])
      return
    }

    if (action === 'deps') {
      setPanelTab('output')
      streamOutput([
        { text: `[Cortex dbt] Installing packages…`, tone: 'info' },
        { text: `Installing dbt-labs/dbt_utils 1.3.0`, tone: 'muted' },
        { text: `Done.`, tone: 'ok' },
      ])
      return
    }

    // run / build / test
    setRunningModel(model)
    setPanelTab('output')
    const flags = flagsOverride ?? effectiveFlags(cfg)
    const defer = cfg.deferOn
      ? [
          {
            text: `  Defer: unselected refs resolve to ${cfg.deferObject} (${cfg.deferCompareTo})`,
            tone: 'muted' as const,
          },
        ]
      : []
    const base = buildRunOutput(project.profile, model, action, flags, cfg.target, project.threads)
    streamOutput([base[0], ...defer, ...base.slice(1)])
  }

  function onPaletteRun(cmd: Command, flags?: string) {
    switch (cmd.id) {
      case 'dbt.run':
        return runAction('run', flags)
      case 'dbt.build':
        return runAction('build', flags)
      case 'dbt.test':
        return runAction('test', flags)
      case 'dbt.compile':
        return runAction('compile')
      case 'dbt.preview':
        return runAction('preview')
      case 'dbt.lineage':
        return runAction('lineage')
      case 'dbt.docs':
        return runAction('docs')
      case 'dbt.deps':
        return runAction('deps')
      case 'dbt.deferToggle':
        return updateCfg({ deferOn: !cfg.deferOn })
      case 'dbt.selectTarget':
        return updateCfg({
          target: TARGETS[(TARGETS.indexOf(cfg.target) + 1) % TARGETS.length],
        })
      case 'snowflake.catalog':
        return openDbtPanel()
      default:
        return
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <TitleBar
        sidebarOpen={sidebarOpen}
        panelOpen={panelOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onTogglePanel={() => setPanelOpen((p) => !p)}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ActivityBar active={view} onChange={setView} />
        {sidebarOpen && (
          <SideBar
            view={view}
            activeFile={activeId}
            onOpenFile={openFile}
            projects={projects}
            activeProject={activeProject}
            project={project}
            cfg={cfg}
            onSelectProject={setActiveProject}
            onUpdateConfig={updateCfg}
            onRun={runAction}
          />
        )}

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <EditorArea
              tabs={tabs}
              activeId={activeId}
              target={cfg.target}
              onSelect={setActiveId}
              onClose={closeTab}
              onAction={runAction}
            />
          </div>
          {panelOpen && (
            <div className="h-[260px] shrink-0 overflow-hidden">
              <Panel
                tab={panelTab}
                onTab={setPanelTab}
                onClose={() => setPanelOpen(false)}
                outputLines={outputLines}
                hasPreview={hasPreview}
                lineageModel={lineageModel}
              />
            </div>
          )}
        </div>
      </div>

      <StatusBar
        running={running}
        runningModel={runningModel}
        projectName={project.name}
        target={cfg.target}
        onOpenDbtPanel={openDbtPanel}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onRun={onPaletteRun}
        defaultFlags={effectiveFlags(cfg)}
      />
    </div>
  )
}
