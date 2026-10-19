import { compiledSql } from '../../data/compiled'
import { highlightLine } from '../../lib/highlight'
import { SnowflakeMark } from '../icons'

// Read-only compiled SQL — what Snowflake Managed executes for the model.
export function CompiledView({ model, target }: { model: string; target: string }) {
  const sql = compiledSql(model)
  const lines = sql.replace(/\n$/, '').split('\n')

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-editor">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3 text-[12px]">
        <span className="font-semibold text-fg">Compiled</span>
        <span className="text-fg-muted">·</span>
        <span className="font-mono text-fg">{model}</span>
        <span className="flex items-center gap-1 rounded bg-black/30 px-1.5 py-0.5 text-[11px] text-fg-muted">
          <SnowflakeMark size={11} /> target: {target}
        </span>
      </div>

      {/* Code */}
      <div className="min-h-0 flex-1 overflow-auto font-mono text-[13px] leading-[20px]">
        <div className="min-w-max py-2">
          {lines.map((line, i) => (
            <div key={i} className="flex min-w-full hover:bg-white/[0.02]">
              <span className="sticky left-0 w-[60px] shrink-0 select-none bg-editor pr-4 text-right text-fg-dim">
                {i + 1}
              </span>
              <span className="whitespace-pre pr-8 text-sx-text">{highlightLine(line)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
