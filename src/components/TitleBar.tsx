import { Search, PanelLeft, PanelBottom, PanelRight, LayoutGrid } from 'lucide-react'

const MENUS = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Window', 'Help']

function TrafficLight({ color }: { color: string }) {
  return <span className="h-3 w-3 rounded-full" style={{ background: color }} />
}

function LayoutButton({
  children,
  active,
  title,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  title: string
  onClick?: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`flex h-6 w-7 items-center justify-center rounded hover:bg-white/10 ${
        active ? 'text-fg-bright' : 'text-icon'
      }`}
    >
      {children}
    </button>
  )
}

export function TitleBar({
  sidebarOpen,
  panelOpen,
  onToggleSidebar,
  onTogglePanel,
  onOpenPalette,
}: {
  sidebarOpen: boolean
  panelOpen: boolean
  onToggleSidebar: () => void
  onTogglePanel: () => void
  onOpenPalette: () => void
}) {
  return (
    <div className="relative flex h-[35px] shrink-0 items-center bg-titlebar pr-2 pl-3 text-[13px] text-fg select-none">
      {/* macOS traffic lights + menu bar */}
      <div className="flex items-center">
        <div className="flex items-center gap-2 pr-3">
          <TrafficLight color="#ff5f57" />
          <TrafficLight color="#febc2e" />
          <TrafficLight color="#28c840" />
        </div>
        {MENUS.map((m) => (
          <button key={m} className="rounded px-2 py-0.5 text-[13px] text-fg hover:bg-white/10">
            {m}
          </button>
        ))}
      </div>

      {/* Command center — absolutely centered, the way VS Code lays it out */}
      <button
        onClick={onOpenPalette}
        className="absolute top-1/2 left-1/2 flex h-[22px] w-[min(460px,34vw)] -translate-x-1/2 -translate-y-1/2 items-center rounded border border-white/10 bg-white/[0.06] px-2 text-[12px] text-fg hover:bg-white/10"
      >
        <Search size={14} className="shrink-0 text-fg-muted" />
        <span className="flex-1 text-center">tasty_bytes</span>
        <span className="w-3.5 shrink-0" />
      </button>

      {/* Layout controls */}
      <div className="ml-auto flex items-center gap-0.5">
        <LayoutButton title="Toggle Primary Side Bar" active={sidebarOpen} onClick={onToggleSidebar}>
          <PanelLeft size={16} />
        </LayoutButton>
        <LayoutButton title="Toggle Panel" active={panelOpen} onClick={onTogglePanel}>
          <PanelBottom size={16} />
        </LayoutButton>
        <LayoutButton title="Toggle Secondary Side Bar">
          <PanelRight size={16} />
        </LayoutButton>
        <LayoutButton title="Customize Layout">
          <LayoutGrid size={16} />
        </LayoutButton>
      </div>
    </div>
  )
}
