import {
  ChevronDown,
  RefreshCw,
  Search,
  PanelLeft,
  PanelBottom,
  PanelRight,
  LayoutGrid,
} from 'lucide-react'

function TrafficLights() {
  return (
    <div className="flex items-center gap-2 pl-1">
      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
    </div>
  )
}

function SnowflakeMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" className="text-[#29b5e8]">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
      </g>
    </svg>
  )
}

export function TitleBar({
  sidebarOpen,
  bottomOpen,
  sessionOpen,
  onToggleSidebar,
  onToggleBottom,
  onToggleSession,
}: {
  sidebarOpen: boolean
  bottomOpen: boolean
  sessionOpen: boolean
  onToggleSidebar: () => void
  onToggleBottom: () => void
  onToggleSession: () => void
}) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between bg-chrome-bg px-3 text-xs select-none">
      {/* left cluster */}
      <div className="flex items-center gap-3" style={{ minWidth: 280 }}>
        <TrafficLights />
        <button className="ml-1 flex items-center gap-1.5 rounded px-1.5 py-0.5 text-text hover:bg-hover-bg">
          <SnowflakeMark />
          <span className="font-medium">qa6</span>
          <ChevronDown size={12} className="text-text-muted" />
        </button>
        <button className="flex items-center gap-1.5 rounded px-1.5 py-0.5 text-text-muted hover:bg-hover-bg hover:text-text">
          <RefreshCw size={11} />
          <span>Update Now</span>
        </button>
      </div>

      {/* center command bar */}
      <div className="flex flex-1 justify-center">
        <div className="flex h-6 w-[460px] max-w-[50%] items-center justify-center gap-2 rounded-md border border-border-strong bg-app-bg/60 px-3 text-text-muted">
          <Search size={11} />
          <span className="truncate text-[12px] text-text">getting-started-with-dbt-on-snowflake</span>
        </div>
      </div>

      {/* right cluster */}
      <div className="flex items-center justify-end gap-2" style={{ minWidth: 280 }}>
        <div className="flex items-center gap-1 text-text-muted">
          <button className="rounded p-1 hover:bg-hover-bg hover:text-text"><LayoutGrid size={14} /></button>
          <button
            onClick={onToggleSidebar}
            title="Toggle Primary Side Bar"
            className={`rounded p-1 hover:bg-hover-bg hover:text-text ${sidebarOpen ? 'text-text' : ''}`}
          >
            <PanelLeft size={14} />
          </button>
          <button
            onClick={onToggleBottom}
            title="Toggle Panel"
            className={`rounded p-1 hover:bg-hover-bg hover:text-text ${bottomOpen ? 'text-text' : ''}`}
          >
            <PanelBottom size={14} />
          </button>
          <button
            onClick={onToggleSession}
            title="Toggle Session"
            className={`rounded p-1 hover:bg-hover-bg hover:text-text ${sessionOpen ? 'text-text' : ''}`}
          >
            <PanelRight size={14} />
          </button>
        </div>
        <div className="flex items-center rounded-md bg-input-bg p-0.5 text-[11px]">
          <button className="rounded px-2 py-0.5 text-text-muted hover:text-text">Agent</button>
          <button className="rounded bg-app-bg px-2 py-0.5 text-text shadow-sm">Editor</button>
        </div>
      </div>
    </div>
  )
}
