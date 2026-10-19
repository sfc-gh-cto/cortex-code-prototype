import { useRef, useState } from 'react'
import { Plus, ChevronDown, SplitSquareHorizontal, Trash2, MoreHorizontal } from 'lucide-react'
import { PortalMenu, type MenuEntry } from '../ui/Menu'
import { useTerminal } from './terminalStore'

export function TerminalToolbar() {
  const { active, newTerminal, killTerminal, clearTerminal } = useTerminal()
  const [plusOpen, setPlusOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const plusRef = useRef<HTMLButtonElement>(null)
  const moreRef = useRef<HTMLButtonElement>(null)

  const newTerminalItems: MenuEntry[] = [
    { label: 'New Terminal', shortcut: '⌃⇧`', onClick: () => newTerminal('zsh') },
    { label: 'New Terminal Window', onClick: () => newTerminal('zsh') },
    { label: 'Split Terminal', shortcut: '⌘\\', onClick: () => newTerminal(active?.shell ?? 'zsh') },
    { type: 'sep' },
    { label: 'bash', onClick: () => newTerminal('bash') },
    { label: 'zsh', onClick: () => newTerminal('zsh') },
    { label: 'Split Terminal with Profile', submenu: true },
    { type: 'sep' },
    { label: 'Configure Terminal Settings' },
    { label: 'Select Default Profile' },
    { type: 'sep' },
    { label: 'Run Task...' },
    { label: 'Configure Tasks...' },
  ]

  const moreItems: MenuEntry[] = [
    { label: 'Scroll to Previous Command', shortcut: '⌘↑' },
    { label: 'Scroll to Next Command', shortcut: '⌘↓' },
    { label: 'Clear Terminal', shortcut: '⌘K', onClick: () => active && clearTerminal(active.id) },
    { type: 'sep' },
    { label: 'Run Active File' },
    { label: 'Run Selected Text' },
    { label: 'Start Dictation' },
    { type: 'sep' },
    { label: 'Go to Recent Directory...', shortcut: '⌘G' },
    { label: 'Run Recent Command...', shortcut: '⌃R' },
  ]

  return (
    <div className="flex items-center gap-0.5 text-text-muted">
      {/* Active terminal selector with hover tooltip (PID / shell info) */}
      <div className="group/term relative">
        <button className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover-bg hover:text-text">
          <span className="text-[12px]">{active?.name ?? 'zsh'}</span>
          <ChevronDown size={12} />
        </button>
        <div className="pointer-events-none absolute right-0 top-full z-[1000] mt-1 hidden w-64 rounded-md border border-[#454545] bg-[#252526] p-3 text-left text-[12px] leading-5 shadow-2xl group-hover/term:block">
          <div className="font-semibold text-text">{active?.name ?? 'zsh'}</div>
          <div className="mt-1 text-text-muted">
            Process ID (PID): <span className="text-text">7339</span>
          </div>
          <div className="text-text-muted">
            Command line: <span className="text-text">/bin/{active?.shell ?? 'zsh'} -il</span>
          </div>
          <div className="text-text-muted">
            Shell integration: <span className="text-success">Rich</span>
          </div>
          <div className="mt-2 flex gap-3 text-link">
            <span className="hover:underline">Show Environment Contributions</span>
            <span className="hover:underline">Show Details</span>
          </div>
        </div>
      </div>

      {/* + New Terminal button (opens launch profile dropdown) */}
      <button
        ref={plusRef}
        title="New Terminal"
        onClick={() => setPlusOpen((o) => !o)}
        className="flex items-center rounded p-1 hover:bg-hover-bg hover:text-text"
      >
        <Plus size={15} />
        <ChevronDown size={12} />
      </button>
      <PortalMenu
        anchorRef={plusRef}
        open={plusOpen}
        onClose={() => setPlusOpen(false)}
        items={newTerminalItems}
        width={260}
      />

      <button
        title="Split Terminal (⌘\)"
        onClick={() => newTerminal(active?.shell ?? 'zsh')}
        className="rounded p-1 hover:bg-hover-bg hover:text-text"
      >
        <SplitSquareHorizontal size={15} />
      </button>
      <button
        title="Kill Terminal"
        onClick={() => active && killTerminal(active.id)}
        className="rounded p-1 hover:bg-hover-bg hover:text-text"
      >
        <Trash2 size={14} />
      </button>

      <button
        ref={moreRef}
        title="More Actions..."
        onClick={() => setMoreOpen((o) => !o)}
        className="rounded p-1 hover:bg-hover-bg hover:text-text"
      >
        <MoreHorizontal size={16} />
      </button>
      <PortalMenu
        anchorRef={moreRef}
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={moreItems}
        width={260}
      />
    </div>
  )
}
