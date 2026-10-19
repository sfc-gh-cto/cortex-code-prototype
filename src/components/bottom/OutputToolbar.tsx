import { useRef, useState } from 'react'
import { ChevronDown, Ban, Lock, Ellipsis } from 'lucide-react'
import { OUTPUT_CHANNELS } from '../../data/dbtOutput'
import { PortalMenu, type MenuEntry } from '../ui/Menu'

export function OutputToolbar({
  channel,
  onChannelChange,
  onClear,
}: {
  channel: string
  onChannelChange: (channel: string) => void
  onClear?: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const channelRef = useRef<HTMLButtonElement>(null)

  const items: MenuEntry[] = OUTPUT_CHANNELS.map((c) =>
    c === '--' ? { type: 'sep' } : { label: c, onClick: () => onChannelChange(c) },
  )

  return (
    <div className="flex items-center gap-2 text-text-muted">
      <div className="flex w-44 items-center rounded border border-border-strong bg-input-bg px-2 py-0.5">
        <input
          placeholder="Filter"
          className="min-w-0 flex-1 bg-transparent text-[12px] text-text outline-none placeholder:text-text-dim"
        />
      </div>
      <button
        ref={channelRef}
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 py-0.5 text-[12px] text-text hover:border-text-muted"
      >
        {channel}
        <ChevronDown size={13} className="text-text-muted" />
      </button>
      <PortalMenu
        anchorRef={channelRef}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
        width={220}
      />
      <button title="Clear Output" onClick={onClear} className="rounded p-1 hover:bg-hover-bg hover:text-text">
        <Ban size={15} />
      </button>
      <button title="Turn On Log Scrolling Lock" className="rounded p-1 hover:bg-hover-bg hover:text-text">
        <Lock size={14} />
      </button>
      <button title="More Actions..." className="rounded p-1 hover:bg-hover-bg hover:text-text">
        <Ellipsis size={15} />
      </button>
    </div>
  )
}
