import { useState } from 'react'
import { Lock, Plus, Minus, Maximize2, Expand, Columns3 } from 'lucide-react'
import { lineageByProject, nodeToFile, type LineageNode } from '../../data/mockData'

const NODE_W = 168
const NODE_H = 48
const COL_GAP = 96
const ROW_GAP = 18
const PAD_X = 28
const PAD_Y = 20

function pos(node: LineageNode) {
  return {
    x: PAD_X + node.col * (NODE_W + COL_GAP),
    y: PAD_Y + node.row * (NODE_H + ROW_GAP),
  }
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-border-strong bg-app-bg px-1.5 py-px font-mono text-[10px] text-text">
      {children}
    </span>
  )
}

export function LineageGraph({
  project,
  selected,
  onSelect,
  onOpenFile,
}: {
  project: string
  selected: string | null
  onSelect: (nodeId: string) => void
  onOpenFile: (name: string) => void
}) {
  const graph = lineageByProject[project] ?? lineageByProject.tasty_bytes_dbt_demo
  const { nodes: lineageNodes, edges: lineageEdges } = graph
  const [direction, setDirection] = useState<'upstream' | 'downstream'>('upstream')

  const nodeById = Object.fromEntries(lineageNodes.map((n) => [n.id, n]))
  const maxCol = Math.max(...lineageNodes.map((n) => n.col))
  const maxRow = Math.max(...lineageNodes.map((n) => n.row))
  const width = PAD_X * 2 + (maxCol + 1) * NODE_W + maxCol * COL_GAP
  const height = PAD_Y * 2 + (maxRow + 1) * NODE_H + maxRow * ROW_GAP

  const connected = new Set<string>()
  if (selected) {
    lineageEdges.forEach((e) => {
      if (e.from === selected) connected.add(e.to)
      if (e.to === selected) connected.add(e.from)
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* lineage header: selection hints (left) + lineage controls (right) */}
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-border bg-chrome-bg px-3 text-[11px] text-text-muted">
        <span>{selected ? '1 selected' : 'No selection'}</span>
        <span className="flex items-center gap-1"><Kbd>⌘+Click</Kbd> Add/remove</span>
        <span className="flex items-center gap-1"><Kbd>Esc</Kbd> Clear</span>

        <div className="ml-auto flex items-center gap-3">
          {/* upstream / downstream toggle */}
          <div className="flex items-center overflow-hidden rounded border border-border-strong text-[12px]">
            <button
              onClick={() => setDirection('upstream')}
              className={`px-2.5 py-1 ${
                direction === 'upstream' ? 'bg-accent/80 text-white' : 'text-text-muted hover:text-text'
              }`}
            >
              Upstream
            </button>
            <button
              onClick={() => setDirection('downstream')}
              className={`px-2.5 py-1 ${
                direction === 'downstream' ? 'bg-accent/80 text-white' : 'text-text-muted hover:text-text'
              }`}
            >
              Downstream
            </button>
          </div>
          {/* depth */}
          <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
            <span>Depth:</span>
            <input
              defaultValue={5}
              className="h-6 w-10 rounded border border-border-strong bg-app-bg px-2 text-center text-text outline-none focus:border-accent"
            />
          </div>
          {/* columns */}
          <button className="flex h-6 items-center gap-1.5 rounded border border-border-strong px-2 text-[12px] text-text-muted hover:text-text">
            <Columns3 size={13} />
            Columns
          </button>
          <Lock size={13} className="hover:text-text" />
        </div>
      </div>

      {/* canvas */}
      <div className="relative min-h-0 flex-1 overflow-auto bg-[#1a1a1a]">
        {/* dotted grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #2e2e2e 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* floating zoom controls */}
        <div className="sticky right-0 top-0 z-30 float-right mr-2 mt-2 flex flex-col overflow-hidden rounded-md border border-border-strong bg-chrome-bg">
          <button className="p-1.5 text-text-muted hover:bg-hover-bg hover:text-text"><Maximize2 size={13} /></button>
          <button className="border-t border-border p-1.5 text-text-muted hover:bg-hover-bg hover:text-text"><Plus size={13} /></button>
          <button className="border-t border-border p-1.5 text-text-muted hover:bg-hover-bg hover:text-text"><Minus size={13} /></button>
        </div>

        <div className="relative" style={{ width, height }}>
          {/* edges */}
          <svg className="pointer-events-none absolute left-0 top-0" width={width} height={height}>
            {lineageEdges.map((e, i) => {
              const from = nodeById[e.from]
              const to = nodeById[e.to]
              if (!from || !to) return null
              const fp = pos(from)
              const tp = pos(to)
              const x1 = fp.x + NODE_W
              const y1 = fp.y + NODE_H / 2
              const x2 = tp.x
              const y2 = tp.y + NODE_H / 2
              const mx = (x1 + x2) / 2
              const active = selected === e.from || selected === e.to
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={active ? '#4daafc' : '#3a3a3a'}
                  strokeWidth={active ? 1.8 : 1.2}
                />
              )
            })}
          </svg>

          {/* nodes */}
          {lineageNodes.map((node) => {
            const p = pos(node)
            const isSelected = selected === node.id
            const isConnected = connected.has(node.id)
            const isSource = node.type === 'source'
            return (
              <div
                key={node.id}
                onClick={() => onSelect(node.id)}
                onDoubleClick={() => {
                  const file = nodeToFile[`${project}:${node.id}`]
                  if (file) onOpenFile(file)
                }}
                title={nodeToFile[`${project}:${node.id}`] ? 'Double-click to open file' : undefined}
                style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}
                className={`absolute flex cursor-pointer items-center gap-2.5 rounded-md border bg-[#2b2b2b] px-2 ${
                  isSelected
                    ? 'border-[#3fb950] ring-1 ring-[#3fb950]'
                    : isConnected
                      ? 'border-[#4daafc]/60'
                      : 'border-border-strong hover:border-text-muted'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-[13px] font-bold text-white ${
                    isSource ? 'bg-[#2ea043]' : 'bg-[#2f6fd0]'
                  }`}
                >
                  {isSource ? 'S' : 'M'}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[12.5px] leading-tight text-text">{node.name}</span>
                  <span className="text-[9px] uppercase tracking-wide text-text-muted">
                    {node.type}
                    {node.language === 'python' && ' · py'}
                  </span>
                </span>
                {isSelected && (
                  <Expand size={12} className="absolute right-1.5 top-1.5 text-text-muted" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
