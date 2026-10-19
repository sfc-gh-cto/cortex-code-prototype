import {
  RefreshCw,
  Ellipsis,
  Search,
  GitBranch,
  Bug,
  Check,
  Database,
} from 'lucide-react'
import type { ViewId } from './ActivityBar'
import { Section } from './Section'
import { ProjectTree } from './views/ProjectTree'
import { DbtExtensionPanel } from './views/DbtExtensionPanel'
import { DbtLogo } from './icons'
import type { FileNode } from '../data/project'
import type { ProjectInfo, ProjectConfig } from '../data/extensionConfig'
import type { DbtAction } from '../App'

function HeaderAction({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <button
      title={title}
      className="flex h-[22px] w-[22px] items-center justify-center rounded text-icon hover:bg-hover"
    >
      {children}
    </button>
  )
}

function SideBarHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex h-[35px] shrink-0 items-center gap-1 pr-2 pl-5 text-[11px] font-normal tracking-wide text-[#bbbbbb] uppercase">
      <span className="flex-1 truncate">{title}</span>
      {actions}
    </div>
  )
}

export function SideBar({
  view,
  activeFile,
  onOpenFile,
  projects,
  activeProject,
  project,
  cfg,
  onSelectProject,
  onUpdateConfig,
  onRun,
}: {
  view: ViewId
  activeFile: string | null
  onOpenFile: (node: FileNode) => void
  projects: ProjectInfo[]
  activeProject: string
  project: ProjectInfo
  cfg: ProjectConfig
  onSelectProject: (id: string) => void
  onUpdateConfig: (patch: Partial<ProjectConfig>) => void
  onRun: (action: DbtAction) => void
}) {
  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col overflow-hidden bg-sidebar">
      {view === 'explorer' && (
        <>
          <SideBarHeader
            title="Explorer"
            actions={
              <HeaderAction title="More Actions...">
                <Ellipsis size={16} />
              </HeaderAction>
            }
          />
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Section title={project.name}>
              <ProjectTree activeFile={activeFile} onOpen={onOpenFile} />
            </Section>
          </div>
        </>
      )}

      {view === 'dbt' && (
        <>
          <SideBarHeader
            title="dbt — Cortex"
            actions={
              <>
                <HeaderAction title="Refresh">
                  <RefreshCw size={15} />
                </HeaderAction>
                <HeaderAction title="More Actions...">
                  <Ellipsis size={16} />
                </HeaderAction>
              </>
            }
          />
          <DbtExtensionPanel
            projects={projects}
            activeProject={activeProject}
            project={project}
            cfg={cfg}
            onSelectProject={onSelectProject}
            onUpdate={onUpdateConfig}
            onRun={onRun}
          />
        </>
      )}

      {view === 'search' && (
        <>
          <SideBarHeader title="Search" />
          <div className="flex flex-col gap-1.5 px-3 py-2">
            <input
              placeholder="Search"
              className="h-7 w-full rounded border border-border-contrast bg-input px-2 text-[13px] text-fg outline-none focus:border-focus"
            />
            <input
              placeholder="Replace"
              className="h-7 w-full rounded border border-border-contrast bg-input px-2 text-[13px] text-fg outline-none focus:border-focus"
            />
            <div className="mt-6 px-1 text-center text-[12px] text-fg-muted">
              <Search size={20} className="mx-auto mb-2 text-fg-dim" />
              Search across the dbt project
            </div>
          </div>
        </>
      )}

      {view === 'scm' && (
        <>
          <SideBarHeader title="Source Control" />
          <div className="flex flex-col gap-2 px-3 py-2">
            <input
              placeholder="Message (⌘Enter to commit on 'main')"
              className="h-7 w-full rounded border border-border-contrast bg-input px-2 text-[12.5px] text-fg outline-none focus:border-focus"
            />
            <button className="flex h-7 items-center justify-center gap-1.5 rounded bg-button text-[13px] text-white hover:bg-button-hover">
              <Check size={15} /> Commit
            </button>
            <div className="mt-2 text-[11px] font-semibold uppercase text-fg-muted">
              Changes <span className="ml-1 rounded-full bg-badge-bg px-1.5 text-[10px]">3</span>
            </div>
            {[
              { f: 'orders.sql', s: 'M', c: '#e2c08d' },
              { f: 'dbt_project.yml', s: 'M', c: '#e2c08d' },
              { f: 'stg_locations.sql', s: 'U', c: '#73c991' },
            ].map((x) => (
              <div key={x.f} className="flex items-center gap-2 text-[13px] text-fg">
                <GitBranch size={14} className="text-fg-dim" />
                <span className="flex-1 truncate">{x.f}</span>
                <span className="font-semibold" style={{ color: x.c }}>
                  {x.s}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'debug' && (
        <>
          <SideBarHeader title="Run and Debug" />
          <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
            <Bug size={22} className="text-fg-dim" />
            <p className="text-[12.5px] text-fg-muted">
              dbt runs execute on Snowflake Managed — use the command in the dbt panel.
            </p>
          </div>
        </>
      )}

      {view === 'extensions' && (
        <>
          <SideBarHeader title="Extensions" />
          <div className="flex flex-col gap-2 px-3 py-2">
            <input
              placeholder="Search Extensions in Marketplace"
              className="h-7 w-full rounded border border-border-contrast bg-input px-2 text-[12.5px] text-fg outline-none focus:border-focus"
            />
            <div className="mt-1 flex gap-2 rounded border border-border p-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-black/30">
                <DbtLogo size={28} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-[13px] font-semibold text-fg">
                  <span className="truncate">Cortex dbt</span>
                  <Check size={13} className="text-success" />
                </div>
                <div className="truncate text-[11.5px] text-fg-muted">
                  dbt on Snowflake — managed runs, lineage, catalog
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-fg-dim">
                  <Database size={11} /> Snowflake · Installed
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
