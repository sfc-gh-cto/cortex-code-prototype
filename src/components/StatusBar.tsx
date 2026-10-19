import { GitBranch, RefreshCw, CircleAlert, TriangleAlert, Bell, Loader, Check } from 'lucide-react'
import { SnowflakeMark } from './icons'

function Item({
  children,
  title,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  title?: string
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-full items-center gap-[3px] px-[5px] text-[12px] hover:bg-white/10 ${className}`}
    >
      {children}
    </button>
  )
}

export function StatusBar({
  running,
  runningModel,
  projectName,
  target,
  onOpenDbtPanel,
}: {
  running: boolean
  runningModel: string | null
  projectName: string
  target: string
  onOpenDbtPanel: () => void
}) {
  return (
    <div className="relative z-20 flex h-[22px] shrink-0 items-center justify-between border-t border-[#2b2b2b] bg-statusbar text-[#cccccc]">
      {/* Left cluster — stock VS Code items, plus the extension's own entry */}
      <div className="flex h-full min-w-0 items-center">
        <Item title="Snowflake connection">
          <SnowflakeMark size={14} color="#cccccc" />
          <span>Snowflake: qa6</span>
        </Item>
        <Item title="Checkout branch">
          <GitBranch size={14} />
          <span>main</span>
          <RefreshCw size={12} />
        </Item>
        <Item title="No problems">
          <CircleAlert size={14} />
          <span>0</span>
          <TriangleAlert size={14} className="ml-1" />
          <span>0</span>
        </Item>
        <Item title={`${projectName} · target ${target}`} onClick={onOpenDbtPanel}>
          <span>dbt on Snowflake</span>
        </Item>
        {running && (
          <Item title="dbt is running">
            <Loader size={13} className="animate-spin" />
            <span>Running {runningModel ?? 'dbt'} on Snowflake…</span>
          </Item>
        )}
      </div>

      {/* Right cluster — editor status items (dbt config lives in the dbt panel) */}
      <div className="flex h-full items-center">
        <Item title="Go to Line/Column">
          <span>Ln 24, Col 1</span>
        </Item>
        <Item title="Indentation">
          <span>Spaces: 4</span>
        </Item>
        <Item title="Encoding">
          <span>UTF-8</span>
        </Item>
        <Item title="End of Line">
          <span>LF</span>
        </Item>
        <Item title="Select Language Mode">
          <span>SQL (dbt)</span>
        </Item>
        <Item title="Prettier">
          <Check size={13} />
          <span>Prettier</span>
        </Item>
        <Item title="Notifications">
          <Bell size={13} />
        </Item>
      </div>
    </div>
  )
}
