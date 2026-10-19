import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { projectTree, type FileNode, type GitStatus } from '../../data/project'
import { FileIcon } from '../FileIcon'

const GIT_COLOR: Record<GitStatus, string> = {
  M: '#e2c08d',
  U: '#73c991',
  A: '#73c991',
}

function collectOpen(nodes: FileNode[], acc: Set<string>) {
  for (const n of nodes) {
    if (n.type === 'folder' && n.defaultOpen) acc.add(n.id)
    if (n.children) collectOpen(n.children, acc)
  }
  return acc
}

export function ProjectTree({
  activeFile,
  onOpen,
}: {
  activeFile: string | null
  onOpen: (node: FileNode) => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => collectOpen(projectTree, new Set()))

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const renderNodes = (nodes: FileNode[], depth: number): React.ReactNode =>
    nodes.map((node) => {
      const isFolder = node.type === 'folder'
      const open = expanded.has(node.id)
      const selected = node.id === activeFile
      return (
        <div key={node.id}>
          <div
            onClick={() => (isFolder ? toggle(node.id) : onOpen(node))}
            style={{ paddingLeft: depth * 10 + 4 }}
            className={`group flex h-[22px] cursor-pointer items-center gap-1 pr-2 text-[13px] ${
              selected ? 'bg-list-active text-fg-bright' : 'text-fg hover:bg-hover'
            }`}
          >
            {isFolder ? (
              open ? (
                <ChevronDown size={16} className="shrink-0 text-icon" />
              ) : (
                <ChevronRight size={16} className="shrink-0 text-icon" />
              )
            ) : (
              <span className="w-4 shrink-0" />
            )}
            {isFolder ? (
              <span className="truncate">{node.name}</span>
            ) : (
              <>
                <FileIcon ext={node.ext} />
                <span className="flex-1 truncate">{node.name}</span>
                {node.git && (
                  <span
                    className="shrink-0 pr-0.5 font-semibold"
                    style={{ color: GIT_COLOR[node.git] }}
                  >
                    {node.git}
                  </span>
                )}
              </>
            )}
          </div>
          {isFolder && open && node.children && renderNodes(node.children, depth + 1)}
        </div>
      )
    })

  return <div className="py-0.5">{renderNodes(projectTree, 0)}</div>
}
