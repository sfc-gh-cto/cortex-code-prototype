import { useRef, useState } from 'react'
import { Box, Sparkles, Loader2, Save, Check } from 'lucide-react'
import { lineageByProject, fileToLineage, type LineageNode } from '../../data/mockData'
import { materialization, modelColumns, modelDescription, columnDescription } from '../../data/docs'

function IndexGroup({
  title,
  nodes,
  active,
  onSelect,
}: {
  title: string
  nodes: LineageNode[]
  active: string
  onSelect: (id: string) => void
}) {
  if (nodes.length === 0) return null
  return (
    <div className="mb-2">
      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </div>
      {nodes.map((n) => (
        <button
          key={n.id}
          onClick={() => onSelect(n.id)}
          className={`flex w-full items-center gap-2 px-3 py-1 text-left text-[12.5px] ${
            active === n.id ? 'bg-accent/20 text-text' : 'text-text-muted hover:bg-hover-bg hover:text-text'
          }`}
        >
          <Box size={13} className="shrink-0 text-[#4daafc]" />
          <span className="truncate">{n.name}</span>
        </button>
      ))}
    </div>
  )
}

// Editable docs form for a single model, with mock "AI" generation. Keyed by the
// model id in the parent so its draft state resets cleanly when the model changes.
function ModelDocForm({ node }: { node: LineageNode }) {
  const columns = modelColumns(node)
  const [description, setDescription] = useState('')
  const [colDescs, setColDescs] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<'all' | 'desc' | string | null>(null)
  const [saved, setSaved] = useState(false)
  const runRef = useRef(0)

  // Stream text into the description field for an "AI typing" feel.
  function streamDescription(target: string, onDone?: () => void) {
    const run = ++runRef.current
    let i = 0
    const step = () => {
      if (runRef.current !== run) return
      i += 2
      setDescription(target.slice(0, i))
      if (i < target.length) window.setTimeout(step, 16)
      else onDone?.()
    }
    step()
  }

  function generateDescription() {
    setBusy('desc')
    setSaved(false)
    streamDescription(modelDescription(node), () => setBusy(null))
  }

  function generateColumn(name: string) {
    const col = columns.find((c) => c.name === name)
    if (!col) return
    setBusy(name)
    setSaved(false)
    window.setTimeout(() => {
      setColDescs((m) => ({ ...m, [name]: columnDescription(node, col) }))
      setBusy(null)
    }, 350)
  }

  function generateAll() {
    setBusy('all')
    setSaved(false)
    streamDescription(modelDescription(node), () => {
      setColDescs(
        Object.fromEntries(columns.map((c) => [c.name, columnDescription(node, c)])),
      )
      setBusy(null)
    })
  }

  const generating = busy !== null

  return (
    <div className="min-w-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-5">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Box size={18} className="text-[#4daafc]" />
              <h1 className="text-[18px] font-semibold text-text">{node.name}</h1>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded bg-[#2f6fd0]/20 px-2 py-0.5 text-[11px] font-medium text-[#7db4ff]">
                {materialization(node)}
              </span>
              <span className="flex items-center gap-1 rounded bg-[#29b5e8]/15 px-2 py-0.5 text-[11px] text-[#5cc8f0]">
                <Sparkles size={11} /> AI · Snowflake Managed
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={generateAll}
              disabled={generating}
              className="flex h-7 items-center gap-1.5 rounded bg-accent px-3 text-[12px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {busy === 'all' ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Generate all
            </button>
            <button
              onClick={() => setSaved(true)}
              className="flex h-7 items-center gap-1.5 rounded border border-border-strong px-3 text-[12px] text-text hover:border-text-muted"
            >
              {saved ? <Check size={13} className="text-[#3fb950]" /> : <Save size={13} />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* model description */}
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Description
            </span>
            <button
              onClick={generateDescription}
              disabled={generating}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#5cc8f0] hover:bg-hover-bg disabled:opacity-60"
            >
              {busy === 'desc' ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              Generate
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setSaved(false)
            }}
            rows={4}
            placeholder="Describe what this model represents, its grain, and how it should be used…"
            className="w-full resize-y rounded border border-border-strong bg-input-bg px-3 py-2 text-[13px] leading-relaxed text-text outline-none placeholder:text-text-dim focus:border-accent"
          />
        </div>

        {/* columns */}
        <div className="mt-6">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Columns
          </span>
          <div className="mt-2 overflow-hidden rounded border border-border">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="bg-chrome-bg text-text-muted">
                  <th className="w-44 px-3 py-1.5 font-medium">Column</th>
                  <th className="px-3 py-1.5 font-medium">Description</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {columns.map((c, i) => (
                  <tr key={c.name} className={i % 2 ? 'bg-app-bg' : ''}>
                    <td className="px-3 py-1.5 align-top">
                      <div className="font-mono text-text">{c.name}</div>
                      <div className="font-mono text-[11px] text-[#4ec9b0]">{c.type}</div>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        value={colDescs[c.name] ?? ''}
                        onChange={(e) => {
                          setColDescs((m) => ({ ...m, [c.name]: e.target.value }))
                          setSaved(false)
                        }}
                        placeholder="Add a description…"
                        className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-[12.5px] text-text outline-none placeholder:text-text-dim hover:border-border-strong focus:border-accent focus:bg-input-bg"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center align-middle">
                      <button
                        onClick={() => generateColumn(c.name)}
                        disabled={generating}
                        title="Generate with AI"
                        className="rounded p-1 text-[#5cc8f0] hover:bg-hover-bg disabled:opacity-60"
                      >
                        {busy === c.name ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Sparkles size={13} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11.5px] text-text-muted">
            AI suggestions are generated from model SQL, lineage, and column profiles. Review before
            saving — changes are written to <span className="font-mono text-text">schema.yml</span> and
            synced to Snowflake.
          </p>
        </div>
      </div>
    </div>
  )
}

// Single-model docs surface for the editor split pane. Resolves the model file
// to its lineage node and renders the editable, AI-assisted form.
export function ModelDocsPane({ model }: { model: string }) {
  const ref = fileToLineage[model]
  const node = ref ? lineageByProject[ref.project]?.nodes.find((n) => n.id === ref.nodeId) : undefined
  if (!node) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-text-dim">
        No docs available for this model.
      </div>
    )
  }
  return <ModelDocForm key={model} node={node} />
}

export function DocsEditor({
  project,
  selected,
}: {
  project: string
  selected: string | null
}) {
  const graph = lineageByProject[project] ?? lineageByProject.tasty_bytes_dbt_demo
  const models = graph.nodes.filter((n) => n.type === 'model')
  const initial = selected && models.some((m) => m.id === selected) ? selected : models[0]?.id ?? ''
  const [activeId, setActiveId] = useState(initial)

  const node = models.find((m) => m.id === activeId) ?? models[0]
  const staging = models.filter((m) => m.col < 2)
  const marts = models.filter((m) => m.col >= 2)

  return (
    <div className="flex h-full">
      {/* left: model index */}
      <div className="w-56 shrink-0 overflow-y-auto border-r border-border bg-chrome-bg py-1">
        <IndexGroup title="Marts" nodes={marts} active={activeId} onSelect={setActiveId} />
        <IndexGroup title="Staging" nodes={staging} active={activeId} onSelect={setActiveId} />
      </div>

      {/* right: editable form (resets per model via key) */}
      {node && <ModelDocForm key={`${project}:${node.id}`} node={node} />}
    </div>
  )
}
