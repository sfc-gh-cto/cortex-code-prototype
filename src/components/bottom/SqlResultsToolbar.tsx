import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PortalMenu, type MenuEntry } from '../ui/Menu'

export type SqlView = 'results' | 'history'

export function SqlResultsToolbar({
  view,
  onViewChange,
}: {
  view: SqlView
  onViewChange: (view: SqlView) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const selectRef = useRef<HTMLButtonElement>(null)

  const items: MenuEntry[] = [
    { label: 'Results', onClick: () => onViewChange('results') },
    { label: 'Query History', onClick: () => onViewChange('history') },
  ]

  return (
    <div className="flex items-center gap-2 text-text-muted">
      <button
        ref={selectRef}
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 py-0.5 text-[12px] text-text hover:border-text-muted"
      >
        {view === 'results' ? 'Results' : 'Query History'}
        <ChevronDown size={13} className="text-text-muted" />
      </button>
      <PortalMenu
        anchorRef={selectRef}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
        width={180}
        align="left"
      />
    </div>
  )
}
