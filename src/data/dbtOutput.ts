// ─── Mock dbt output log for the bottom panel "Output" view (dbt channel) ───

export type OutputTone = 'default' | 'muted' | 'success' | 'error' | 'warn'
export type OutputLine = { ts?: string; text: string; tone?: OutputTone }

export type DbtAction = 'build' | 'compile' | 'run'

// Channels shown in the Output view dropdown. 'dbt' is first; '--' = separator.
export const OUTPUT_CHANNELS: string[] = [
  'dbt',
  '--',
  'Git',
  'GitHub',
  'GitHub Authentication',
  'JSON Language Server',
  '--',
  'Extension Host',
  'Main',
  'Pty Host',
  'Remote Tunnel Service',
  'Settings Sync',
  'Shared',
  'Tasks',
  'Terminal',
  'Text Model Changes Reason',
  'Window',
]

function baseName(model?: string): string | undefined {
  if (!model) return undefined
  return model.replace(/\.(sql|py)$/, '')
}

function dots(name: string, width = 48): string {
  const n = Math.max(3, width - name.length)
  return ' ' + '.'.repeat(n) + ' '
}

export function getDbtOutput(action: DbtAction, model?: string): OutputLine[] {
  const base = baseName(model)
  let t = 0
  const ts = () => {
    const d = new Date(Date.now() + t * 1000)
    t += 1
    return d.toTimeString().slice(0, 8)
  }
  const lines: OutputLine[] = []
  const push = (text: string, tone?: OutputTone) => lines.push({ ts: ts(), text, tone })
  const blank = () => lines.push({ text: '' })

  push(`Running with dbt=1.10.15`)
  push(`Registered adapter: snowflake=1.10.3`)
  push(`Found 11 models, 50 data tests, 8 sources, 481 macros`)
  blank()
  push(`Concurrency: 8 threads (target='dev')`)
  blank()

  if (action === 'compile') {
    if (base) {
      push(`Compiled node '${base}' is at 'target/compiled/tasty_bytes_dbt_demo/models/${base}.sql'`)
    } else {
      push(`Compiled 11 nodes to 'target/compiled/tasty_bytes_dbt_demo/'`)
    }
    blank()
    push(`Completed successfully`, 'success')
    blank()
    push(`Done.`, 'success')
    return lines
  }

  // build / run
  if (base) {
    push(`1 of 1 START sql table model dbt_dev.${base}${dots(base)}[RUN]`)
    push(`1 of 1 OK created sql table model dbt_dev.${base}${dots(base)}[SUCCESS 1 in 1.23s]`, 'success')
    blank()
    push(`Finished running 1 table model in 0 hours 0 minutes and 1.51 seconds (1.51s).`)
    blank()
    push(`Completed successfully`, 'success')
    blank()
    push(`Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1`, 'success')
    return lines
  }

  const models = [
    'raw_pos_country',
    'raw_pos_menu',
    'raw_pos_order_header',
    'raw_pos_order_detail',
    'orders',
    'customer_loyalty_metrics',
    'sales_metrics_by_location',
  ]
  models.forEach((m, i) => {
    const kind = i < 4 ? 'view' : 'table'
    push(`${i + 1} of ${models.length} START sql ${kind} model dbt_dev.${m}${dots(m)}[RUN]`)
    push(
      `${i + 1} of ${models.length} OK created sql ${kind} model dbt_dev.${m}${dots(m)}[SUCCESS 1 in 0.${70 + i}s]`,
      'success',
    )
  })
  blank()
  push(`Finished running 4 view models, 3 table models in 0 hours 0 minutes and 8.21 seconds (8.21s).`)
  blank()
  push(`Completed successfully`, 'success')
  blank()
  push(`Done. PASS=${models.length} WARN=0 ERROR=0 SKIP=0 TOTAL=${models.length}`, 'success')
  return lines
}
