import { Files, Search, GitBranch, Bug, Blocks, CircleUser, Settings, type LucideIcon } from 'lucide-react'
import { DbtLogo } from './icons'

export type ViewId = 'explorer' | 'search' | 'scm' | 'debug' | 'extensions' | 'dbt'

type Item = {
  id: ViewId
  title: string
  icon?: LucideIcon
  render?: () => React.ReactNode
  badge?: string
}

const TOP: Item[] = [
  { id: 'explorer', title: 'Explorer', icon: Files },
  { id: 'search', title: 'Search', icon: Search },
  { id: 'scm', title: 'Source Control', icon: GitBranch, badge: '3' },
  { id: 'debug', title: 'Run and Debug', icon: Bug },
  { id: 'extensions', title: 'Extensions', icon: Blocks },
  { id: 'dbt', title: 'dbt', render: () => <DbtLogo size={24} /> },
]

export function ActivityBar({
  active,
  onChange,
}: {
  active: ViewId
  onChange: (id: ViewId) => void
}) {
  return (
    <div className="flex h-full w-12 shrink-0 flex-col items-center justify-between bg-activitybar">
      <div className="flex flex-col items-center">
        {TOP.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              title={item.title}
              onClick={() => onChange(item.id)}
              className={`relative flex h-12 w-12 items-center justify-center ${
                isActive ? 'text-fg-bright' : 'text-[#858585] hover:text-fg-bright'
              }`}
            >
              {isActive && <span className="absolute top-0 left-0 h-full w-[2px] bg-fg-bright" />}
              {item.render ? item.render() : item.icon && <item.icon size={24} strokeWidth={1.5} />}
              {item.badge && (
                <span className="absolute bottom-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-center">
        <button
          title="Accounts"
          className="flex h-12 w-12 items-center justify-center text-[#858585] hover:text-fg-bright"
        >
          <CircleUser size={24} strokeWidth={1.5} />
        </button>
        <button
          title="Manage"
          className="flex h-12 w-12 items-center justify-center text-[#858585] hover:text-fg-bright"
        >
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
