import { useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { dbtProjectRoots } from '../../data/files'
import { PortalMenu, type MenuEntry } from '../ui/Menu'

// Project selector for the Lineage tab, rendered in the bottom-panel tab bar.
// Mirrors OutputToolbar's channel selector (button + PortalMenu) so they match.
export function LineageToolbar({
  project,
  onProjectChange,
}: {
  project: string
  onProjectChange: (project: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const projectRef = useRef<HTMLButtonElement>(null)

  const items: MenuEntry[] = dbtProjectRoots.map((p) => ({
    label: p,
    onClick: () => onProjectChange(p),
  }))

  return (
    <div className="flex items-center gap-2 text-text-muted">
      <button
        ref={projectRef}
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 py-0.5 text-[12px] text-text hover:border-text-muted"
      >
        {project}
        <ChevronDown size={13} className="text-text-muted" />
      </button>
      <PortalMenu
        anchorRef={projectRef}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
        width={220}
      />
    </div>
  )
}
