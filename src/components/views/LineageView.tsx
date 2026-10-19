import { useMemo, useState } from 'react'
import { GitFork } from 'lucide-react'
import { SnowflakeMark } from '../icons'
import {
  lineageNodes,
  lineageEdges,
  type LineageNode,
  type LineageType,
} from '../../data/lineage'

const NODE_W = 184
const COL_GAP = 240
const ROW_GAP = 26
const HEADER_H = 44
const COL_ROW_H = 17

const TYPE_META: Record<LineageType, { color: string; label: string }> = {
  source: { color: '#29b5e8', label: 'source' },
  staging: { color: '#4ec9b0', label: 'staging' },
  model: { color: '#e38c3f', label: 'model' },
  seed: { color: '#89d185', label: 'seed' },
}

export function LineageView({ model, showColumns }: { model: string; showColumns: boolean }) {
  const [focus, setFocus] = useState(model)
  const [hoverCol, setHoverCol] = useState<string | null>(null)

  const incoming = useMemo(() => {
    const m = new Map<string, string[]>()
    lineageEdges.forEach((e) => m.set(e.to, [...(m.get(e.to) ?? []), e.from]))
    return m
  }, [])
  const outgoing = useMemo(() => {
    const m = new Map<string, string[]>()
    lineageEdges.forEach((e) => m.set(e.from, [...(m.get(e.from) ?? []), e.to]))
    return m
  }, [])

  // Longest-path layering from the sources.
  const layers = useMemo(() => {
    const memo = new Map<string, number>()
    const layerOf = (id: string): number => {
      if (memo.has(id)) return memo.get(id)!
      const parents = incoming.get(id) ?? []
      const v = parents.length ? 1 + Math.max(...parents.map(layerOf)) : 0
      memo.set(id, v)
      return v
    }
    lineageNodes.forEach((n) => layerOf(n.id))
    return memo
  }, [incoming])

  const nodeHeight = (n: LineageNode) =>
    showColumns ? HEADER_H + n.columns.length * COL_ROW_H + 8 : HEADER_H

  // Position nodes: x by layer, y stacked per layer and vertically centered.
  const { positions, width, height } = useMemo(() => {
    const byLayer = new Map<number, LineageNode[]>()
    lineageNodes.forEach((n) => {
      const l = layers.get(n.id) ?? 0
      byLayer.set(l, [...(byLayer.get(l) ?? []), n])
    })
    const pos = new Map<string, { x: number; y: number; h: number }>()
    let maxH = 0
    const layerHeights: number[] = []
    byLayer.forEach((nodes, l) => {
      const total = nodes.reduce((s, n) => s + nodeHeight(n) + ROW_GAP, -ROW_GAP)
      layerHeights[l] = total
      maxH = Math.max(maxH, total)
    })
    byLayer.forEach((nodes, l) => {
      let y = (maxH - layerHeights[l]) / 2 + 24
      nodes.forEach((n) => {
        const h = nodeHeight(n)
        pos.set(n.id, { x: l * COL_GAP + 24, y, h })
        y += h + ROW_GAP
      })
    })
    const w = (Math.max(...[...byLayer.keys()]) + 1) * COL_GAP + 24
    return { positions: pos, width: w, height: maxH + 48 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, showColumns])

  // Related set (ancestors + descendants) of the focused node for highlighting.
  const related = useMemo(() => {
    const set = new Set<string>([focus])
    const walk = (id: string, dir: Map<string, string[]>) => {
      for (const next of dir.get(id) ?? []) {
        if (!set.has(next)) {
          set.add(next)
          walk(next, dir)
        }
      }
    }
    walk(focus, incoming)
    walk(focus, outgoing)
    return set
  }, [focus, incoming, outgoing])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-editor">
      {/* Toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-3 border-b border-border px-3 text-[12px]">
        <span className="flex items-center gap-1.5 font-semibold text-fg">
          <GitFork size={14} className="text-fg-muted" />
          Lineage
        </span>
        <span className="text-fg-muted">·</span>
        <span className="font-mono text-fg">{focus}</span>
        <div className="flex-1" />
        {/* Legend */}
        <div className="ml-2 flex items-center gap-3 text-[11px] text-fg-muted">
          {(['source', 'staging', 'model'] as LineageType[]).map((t) => (
            <span key={t} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm" style={{ background: TYPE_META[t].color }} />
              {TYPE_META[t].label}
            </span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative min-h-0 flex-1 overflow-auto">
        <div className="relative" style={{ width, height }}>
          {/* edges */}
          <svg className="absolute inset-0" width={width} height={height}>
            {lineageEdges.map((e, i) => {
              const a = positions.get(e.from)
              const b = positions.get(e.to)
              if (!a || !b) return null
              const x1 = a.x + NODE_W
              const y1 = a.y + HEADER_H / 2
              const x2 = b.x
              const y2 = b.y + HEADER_H / 2
              const mx = (x1 + x2) / 2
              const active = related.has(e.from) && related.has(e.to)
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={active ? '#007acc' : '#3a3a3a'}
                  strokeWidth={active ? 1.6 : 1.2}
                />
              )
            })}
          </svg>

          {/* nodes */}
          {lineageNodes.map((n) => {
            const p = positions.get(n.id)
            if (!p) return null
            const meta = TYPE_META[n.type]
            const isFocus = n.id === focus
            const dim = !related.has(n.id)
            return (
              <div
                key={n.id}
                onClick={() => setFocus(n.id)}
                title={n.relation}
                style={{ left: p.x, top: p.y, width: NODE_W, opacity: dim ? 0.35 : 1 }}
                className={`absolute cursor-pointer overflow-hidden rounded-md border bg-sidebar shadow-md transition-opacity ${
                  isFocus ? 'border-focus ring-1 ring-focus' : 'border-border-contrast'
                }`}
              >
                <div
                  className="flex items-center gap-1.5 border-l-2 px-2 py-1.5"
                  style={{ borderLeftColor: meta.color }}
                >
                  {n.type === 'source' ? (
                    <SnowflakeMark size={13} />
                  ) : (
                    <span className="h-2 w-2 rounded-sm" style={{ background: meta.color }} />
                  )}
                  <span className="flex-1 truncate font-mono text-[12.5px] text-fg">{n.name}</span>
                  <span className="shrink-0 text-[10px] uppercase text-fg-dim">{meta.label}</span>
                </div>
                {showColumns && (
                  <div className="border-t border-border py-0.5">
                    {n.columns.map((c) => {
                      const hot = hoverCol === c && related.has(n.id)
                      return (
                        <div
                          key={c}
                          onMouseEnter={() => setHoverCol(c)}
                          onMouseLeave={() => setHoverCol(null)}
                          className={`truncate px-2.5 font-mono text-[11px] leading-[17px] ${
                            hot ? 'bg-list-active text-fg-bright' : 'text-fg-muted'
                          }`}
                        >
                          {c}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
