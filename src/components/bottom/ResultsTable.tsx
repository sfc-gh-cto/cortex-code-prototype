import { ExternalLink, Download } from 'lucide-react'
import { getModelResults } from '../../data/files'

export function ResultsTable({
  model,
  onOpenInEditor,
}: {
  model: string
  onOpenInEditor?: () => void
}) {
  const { columns, rows } = getModelResults(model)

  return (
    <div className="flex h-full flex-col">
      {/* results toolbar */}
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-border px-3 text-[11px] text-text-muted">
        <span>
          <span className="text-text">{rows.length}</span> rows · <span className="font-mono">{model}</span>
        </span>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover-bg hover:text-text">
            <Download size={12} /> Export
          </button>
          {onOpenInEditor && (
            <button
              onClick={onOpenInEditor}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-hover-bg hover:text-text"
            >
              <ExternalLink size={12} /> Open in Editor
            </button>
          )}
        </div>
      </div>

      {/* table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="border-collapse font-mono text-[12px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-chrome-bg">
              <th className="sticky left-0 z-10 w-10 border-b border-r border-border bg-chrome-bg px-2 py-1 text-right font-normal text-text-dim">
                #
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  className="whitespace-nowrap border-b border-r border-border px-3 py-1 text-left font-semibold text-text-muted"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-hover-bg">
                <td className="sticky left-0 w-10 border-b border-r border-border bg-app-bg px-2 py-1 text-right text-text-dim">
                  {i + 1}
                </td>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`whitespace-nowrap border-b border-r border-border px-3 py-1 ${
                      typeof cell === 'number' ? 'text-right text-[#b5cea8]' : 'text-text'
                    }`}
                  >
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
