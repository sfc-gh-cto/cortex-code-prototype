import { useEffect, useRef } from 'react'
import { type OutputLine, type OutputTone } from '../../data/dbtOutput'

const TONE_CLASS: Record<OutputTone, string> = {
  default: 'text-text',
  muted: 'text-text-muted',
  success: 'text-[#3fb950]',
  error: 'text-[#f14c4c]',
  warn: 'text-[#cca700]',
}

export function OutputTab({
  channel,
  dbtOutput,
  running = false,
}: {
  channel: string
  dbtOutput: OutputLine[]
  running?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [dbtOutput, running])

  const showDbt = channel === 'dbt' && (dbtOutput.length > 0 || running)

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto px-3 py-1 font-mono text-[12.5px] leading-5">
      {showDbt ? (
        <>
          {dbtOutput.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap break-all">
              {line.ts && <span className="text-text-dim">{line.ts}  </span>}
              <span className={TONE_CLASS[line.tone ?? 'default']}>{line.text}</span>
            </div>
          ))}
          {running && (
            <div className="flex items-center gap-2 text-text-muted">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-text-dim border-t-transparent" />
              <span>running…</span>
            </div>
          )}
        </>
      ) : (
        <span className="inline-block h-[15px] w-[7px] animate-pulse bg-text align-middle" />
      )}
    </div>
  )
}
