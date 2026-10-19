import { useState } from 'react'
import { ChevronDown, ChevronRight, Database, Table, Eye, type LucideIcon } from 'lucide-react'
import { catalog, type CatalogNode, type CatalogKind } from '../../data/catalog'
import { SnowflakeMark } from '../icons'

const KIND_ICON: Record<Exclude<CatalogKind, 'database'>, { icon: LucideIcon; color: string }> = {
  schema: { icon: Database, color: '#c5c5c5' },
  table: { icon: Table, color: '#4ec9b0' },
  view: { icon: Eye, color: '#c586c0' },
}

function collectOpen(nodes: CatalogNode[], acc: Set<string>) {
  for (const n of nodes) {
    if (n.defaultOpen) acc.add(n.id)
    if (n.children) collectOpen(n.children, acc)
  }
  return acc
}

export function CatalogTree() {
  const [expanded, setExpanded] = useState<Set<string>>(() => collectOpen(catalog, new Set()))
  const [selected, setSelected] = useState<string | null>(null)

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const renderNodes = (nodes: CatalogNode[], depth: number): React.ReactNode =>
    nodes.map((node) => {
      const hasChildren = node.kind === 'database' || node.kind === 'schema'
      const open = expanded.has(node.id)
      const isSelected = node.id === selected
      return (
        <div key={node.id}>
          <div
            onClick={() => {
              setSelected(node.id)
              if (hasChildren) toggle(node.id)
            }}
            style={{ paddingLeft: depth * 10 + 4 }}
            className={`flex h-[22px] cursor-pointer items-center gap-1 pr-2 text-[13px] ${
              isSelected ? 'bg-list-active text-fg-bright' : 'text-fg hover:bg-hover'
            }`}
          >
            {hasChildren ? (
              open ? (
                <ChevronDown size={16} className="shrink-0 text-icon" />
              ) : (
                <ChevronRight size={16} className="shrink-0 text-icon" />
              )
            ) : (
              <span className="w-4 shrink-0" />
            )}
            {node.kind === 'database' ? (
              <SnowflakeMark size={14} />
            ) : (
              (() => {
                const { icon: Icon, color } = KIND_ICON[node.kind]
                return <Icon size={15} style={{ color }} strokeWidth={1.5} />
              })()
            )}
            <span className="flex-1 truncate">{node.name}</span>
            {node.kind === 'view' && (
              <span className="shrink-0 text-[10px] uppercase text-fg-dim">view</span>
            )}
          </div>
          {hasChildren && open && node.children && node.children.length > 0 &&
            renderNodes(node.children, depth + 1)}
          {hasChildren && open && node.children && node.children.length === 0 && (
            <div
              style={{ paddingLeft: (depth + 1) * 10 + 20 }}
              className="flex h-[22px] items-center text-[12px] italic text-fg-dim"
            >
              (empty)
            </div>
          )}
        </div>
      )
    })

  return <div className="py-0.5">{renderNodes(catalog, 0)}</div>
}
