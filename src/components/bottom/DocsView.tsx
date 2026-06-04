import { useState } from 'react'
import { Box, Database, ArrowRight } from 'lucide-react'
import { lineageByProject, type LineageNode } from '../../data/mockData'
import { materialization, modelColumns, modelDescription, columnDescription } from '../../data/docs'

function Group({
  title,
  nodes,
  selected,
  onSelect,
}: {
  title: string
  nodes: LineageNode[]
  selected: string
  onSelect: (id: string) => void
}) {
  if (nodes.length === 0) return null
  return (
    <div className="mb-2">
      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </div>
      {nodes.map((n) => {
        const isSource = n.type === 'source'
        return (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[12.5px] ${
              selected === n.id ? 'bg-accent/20 text-text' : 'text-text-muted hover:bg-hover-bg hover:text-text'
            }`}
          >
            {isSource ? (
              <Database size={13} className="shrink-0 text-[#2ea043]" />
            ) : (
              <Box size={13} className="shrink-0 text-[#4daafc]" />
            )}
            <span className="truncate">{n.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded border border-border-strong bg-chrome-bg px-2 py-0.5 text-[11.5px] text-text">
      {label}
    </span>
  )
}

export function DocsView({ project, selected: linked }: { project: string; selected: string | null }) {
  const graph = lineageByProject[project] ?? lineageByProject.tasty_bytes_dbt_demo
  const { nodes, edges } = graph
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]))

  const firstModel = nodes.find((n) => n.type === 'model') ?? nodes[0]
  // Initialized from the linked (active-file) node; DbtTab remounts this view via
  // `key` whenever the linked node changes, so it always re-syncs without effects.
  const [selected, setSelected] = useState(linked ?? firstModel?.id ?? '')
  const node = nodeById[selected] ?? firstModel

  const sources = nodes.filter((n) => n.type === 'source')
  const staging = nodes.filter((n) => n.type === 'model' && n.col < 2)
  const marts = nodes.filter((n) => n.type === 'model' && n.col >= 2)

  const upstream = edges.filter((e) => e.to === node.id).map((e) => nodeById[e.from]?.name).filter(Boolean)
  const downstream = edges.filter((e) => e.from === node.id).map((e) => nodeById[e.to]?.name).filter(Boolean)

  return (
    <div className="flex h-full">
      {/* left: model index */}
      <div className="w-56 shrink-0 overflow-y-auto border-r border-border bg-chrome-bg py-1">
        <Group title="Marts" nodes={marts} selected={selected} onSelect={setSelected} />
        <Group title="Staging" nodes={staging} selected={selected} onSelect={setSelected} />
        <Group title="Sources" nodes={sources} selected={selected} onSelect={setSelected} />
      </div>

      {/* right: model detail */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <div className="flex items-center gap-2">
            {node.type === 'source' ? (
              <Database size={18} className="text-[#2ea043]" />
            ) : (
              <Box size={18} className="text-[#4daafc]" />
            )}
            <h1 className="text-[18px] font-semibold text-text">{node.name}</h1>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-[#2f6fd0]/20 px-2 py-0.5 text-[11px] font-medium text-[#7db4ff]">
              {materialization(node)}
            </span>
            <span className="rounded bg-hover-bg px-2 py-0.5 text-[11px] text-text-muted">
              {project}
            </span>
            {node.language === 'python' && (
              <span className="rounded bg-hover-bg px-2 py-0.5 text-[11px] text-text-muted">python</span>
            )}
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-text-muted">{modelDescription(node)}</p>

          {(upstream.length > 0 || downstream.length > 0) && (
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  Depends on
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {upstream.length ? upstream.map((u) => <Chip key={u} label={u!} />) : (
                    <span className="text-[12px] text-text-dim">—</span>
                  )}
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                  Referenced by <ArrowRight size={11} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {downstream.length ? downstream.map((d) => <Chip key={d} label={d!} />) : (
                    <span className="text-[12px] text-text-dim">—</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Columns
            </div>
            <div className="overflow-hidden rounded border border-border">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="bg-chrome-bg text-text-muted">
                    <th className="px-3 py-1.5 font-medium">Column</th>
                    <th className="px-3 py-1.5 font-medium">Type</th>
                    <th className="px-3 py-1.5 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {modelColumns(node).map((c, i) => (
                    <tr key={c.name} className={i % 2 ? 'bg-app-bg' : ''}>
                      <td className="px-3 py-1.5 font-mono text-text">{c.name}</td>
                      <td className="px-3 py-1.5 font-mono text-[#4ec9b0]">{c.type}</td>
                      <td className="px-3 py-1.5 text-text-muted">{columnDescription(node, c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
