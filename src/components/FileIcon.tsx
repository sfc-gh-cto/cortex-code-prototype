import { FileCode, Table, BookOpen, type LucideIcon } from 'lucide-react'
import type { FileNode } from '../data/project'

const MAP: Record<string, { icon: LucideIcon; color: string }> = {
  sql: { icon: FileCode, color: '#e38c3f' },
  yml: { icon: FileCode, color: '#e3b341' },
  yaml: { icon: FileCode, color: '#e3b341' },
  csv: { icon: Table, color: '#89d185' },
  md: { icon: BookOpen, color: '#519aba' },
  json: { icon: FileCode, color: '#cbcb41' },
}

export function FileIcon({ ext, size = 16 }: { ext?: FileNode['ext']; size?: number }) {
  const entry = (ext && MAP[ext]) || { icon: FileCode, color: '#9d9d9d' }
  const Icon = entry.icon
  return <Icon size={size} style={{ color: entry.color }} strokeWidth={1.5} />
}
