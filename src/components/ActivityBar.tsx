import {
  Files,
  Search,
  GitBranch,
  Database,
  Globe,
  Box,
  Play,
  Bug,
  History,
  Settings,
  User,
} from 'lucide-react'
import type { ComponentType } from 'react'

export type SidebarView = 'explorer' | 'search' | 'scm' | 'catalog'

type Item = {
  id: SidebarView | string
  icon: ComponentType<{ size?: number | string }>
  badge?: string
  switchable?: boolean
}

const topItems: Item[] = [
  { id: 'explorer', icon: Files, switchable: true },
  { id: 'search', icon: Search, switchable: true },
  { id: 'scm', icon: GitBranch, badge: '1', switchable: true },
  { id: 'catalog', icon: Database, switchable: true },
  { id: 'globe', icon: Globe },
  { id: 'run', icon: Play },
  { id: 'debug', icon: Bug },
  { id: 'extensions', icon: Box },
  { id: 'history', icon: History },
]

const bottomItems: Item[] = [
  { id: 'account', icon: User },
  { id: 'settings', icon: Settings },
]

export function ActivityBar({
  active,
  onSelect,
}: {
  active: SidebarView | null
  onSelect: (v: SidebarView) => void
}) {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center justify-between bg-chrome-bg py-1">
      <div className="flex flex-col items-center">
        {topItems.map(({ id, icon: Icon, badge, switchable }) => {
          const isActive = switchable && id === active
          return (
            <button
              key={id}
              onClick={() => switchable && onSelect(id as SidebarView)}
              className={`relative flex h-12 w-12 items-center justify-center ${
                isActive ? 'text-text-bright' : 'text-text-muted hover:text-text'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 bg-text-bright" />
              )}
              <Icon size={22} />
              {badge && (
                <span className="absolute bottom-2 right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div className="flex flex-col items-center">
        {bottomItems.map(({ id, icon: Icon }) => (
          <button
            key={id}
            className="flex h-12 w-12 items-center justify-center text-text-muted hover:text-text"
          >
            <Icon size={22} />
          </button>
        ))}
      </div>
    </div>
  )
}
