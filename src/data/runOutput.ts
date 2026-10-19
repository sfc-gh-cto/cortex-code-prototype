// Managed-mode dbt run output streamed into the "dbt" Output channel. In the
// extension, every dbt action runs on Snowflake via EXECUTE DBT PROJECT — there
// is no local execution.

export type Tone = 'text' | 'muted' | 'cmd' | 'ok' | 'warn' | 'err' | 'info'
export type OutputLine = { text: string; tone: Tone }

const ts = '14:21:0'

export function buildRunOutput(
  profile: string,
  model: string,
  action: string,
  flags: string,
  target: string,
  threads = 8,
): OutputLine[] {
  const args = `${action} --select ${model}${flags ? ' ' + flags : ''} --target ${target}`
  return [
    { text: `[Cortex dbt] Running on Snowflake Managed (EXECUTE DBT PROJECT)`, tone: 'info' },
    {
      text: `> EXECUTE DBT PROJECT ${profile} ARGS='${args}'`,
      tone: 'cmd',
    },
    { text: '', tone: 'text' },
    { text: `${ts}2  Running with dbt=1.10.15 (Snowflake-managed)`, tone: 'muted' },
    { text: `${ts}2  Registered adapter: snowflake=1.10.0`, tone: 'muted' },
    { text: `${ts}3  Found 6 models, 2 seeds, 4 tests, 1 snapshot, 420 macros`, tone: 'muted' },
    { text: '', tone: 'text' },
    { text: `${ts}4  Concurrency: ${threads} threads (target='${target}')`, tone: 'muted' },
    { text: '', tone: 'text' },
    { text: `${ts}5  1 of 1 START sql table model ANALYTICS.${model} .......... [RUN]`, tone: 'text' },
    {
      text: `${ts}8  1 of 1 OK created sql table model ANALYTICS.${model} ..... [${'SUCCESS 1'} in 3.14s]`,
      tone: 'ok',
    },
    { text: '', tone: 'text' },
    { text: `${ts}9  Finished running 1 table model in 0 hours 0 minutes and 3.72 seconds (3.72s).`, tone: 'muted' },
    { text: '', tone: 'text' },
    { text: `${ts}9  Completed successfully`, tone: 'ok' },
    { text: '', tone: 'text' },
    { text: `${ts}9  Done. PASS=1 WARN=0 ERROR=0 SKIP=0 TOTAL=1`, tone: 'ok' },
  ]
}

// Rows for the "Query Results" preview panel (dbt: Preview).
export const previewColumns = [
  'ORDER_ID',
  'CUSTOMER_NAME',
  'ORDER_DATE',
  'ITEM_COUNT',
  'ORDER_TOTAL',
]

export const previewRows: string[][] = [
  ['100441', 'Divya Reddy', '2024-02-11', '3', '$42.50'],
  ['100442', 'Marco Rossi', '2024-02-11', '1', '$12.00'],
  ['100443', 'Amelia Clark', '2024-02-12', '5', '$88.25'],
  ['100444', 'Kenji Watanabe', '2024-02-12', '2', '$27.80'],
  ['100445', 'Fatima Noor', '2024-02-13', '4', '$61.00'],
  ['100446', 'Liam Murphy', '2024-02-13', '1', '$9.75'],
  ['100447', 'Sofia Garcia', '2024-02-14', '6', '$120.40'],
  ['100448', 'Noah Johnson', '2024-02-14', '2', '$33.10'],
]
