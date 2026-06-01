// ─── Mock data for the Cortex Code Desktop prototype ───

export type FileNode = {
  name: string
  type: 'folder' | 'file'
  // file icon kind drives the colored glyph
  kind?: 'sql' | 'python' | 'yaml' | 'json' | 'md' | 'license' | 'git' | 'folder' | 'generic'
  modified?: boolean
  children?: FileNode[]
  defaultOpen?: boolean
}

export const fileTree: FileNode[] = [
  {
    name: 'tasty_bytes_dbt_demo',
    type: 'folder',
    kind: 'folder',
    defaultOpen: true,
    children: [
      { name: 'examples', type: 'folder', kind: 'folder' },
      { name: 'macros', type: 'folder', kind: 'folder' },
      {
        name: 'models',
        type: 'folder',
        kind: 'folder',
        defaultOpen: true,
        children: [
          {
            name: 'marts',
            type: 'folder',
            kind: 'folder',
            defaultOpen: true,
            children: [
              { name: 'customer_loyalty_metrics.sql', type: 'file', kind: 'sql' },
              { name: 'orders.sql', type: 'file', kind: 'sql' },
              { name: 'sales_metrics_by_location.py', type: 'file', kind: 'python' },
            ],
          },
          {
            name: 'staging',
            type: 'folder',
            kind: 'folder',
            defaultOpen: true,
            children: [
              { name: '__sources.yml', type: 'file', kind: 'yaml' },
              { name: 'raw_customer_customer_loyalty.sql', type: 'file', kind: 'sql' },
              { name: 'raw_pos_country.sql', type: 'file', kind: 'sql' },
              { name: 'raw_pos_franchise.sql', type: 'file', kind: 'sql' },
              { name: 'raw_pos_location.sql', type: 'file', kind: 'sql' },
              { name: 'raw_pos_menu.sql', type: 'file', kind: 'sql' },
              { name: 'raw_pos_order_detail.sql', type: 'file', kind: 'sql' },
              { name: 'raw_pos_order_header.sql', type: 'file', kind: 'sql' },
              { name: 'raw_pos_truck.sql', type: 'file', kind: 'sql' },
            ],
          },
        ],
      },
      { name: 'setup', type: 'folder', kind: 'folder' },
      { name: 'tests', type: 'folder', kind: 'folder' },
      { name: 'dbt_project.yml', type: 'file', kind: 'yaml' },
      { name: 'packages.yml', type: 'file', kind: 'yaml' },
      { name: 'profiles.yml', type: 'file', kind: 'yaml', modified: true },
      { name: 'schedules.sql', type: 'file', kind: 'sql' },
      { name: '.gitignore', type: 'file', kind: 'git' },
      { name: 'LEGAL.md', type: 'file', kind: 'md' },
      { name: 'LICENSE', type: 'file', kind: 'license' },
      { name: 'README.md', type: 'file', kind: 'md' },
    ],
  },
]

export const rootFolderName = 'GETTING-STARTED-WITH-DBT-ON-SNOWFLAKE'

// ─── Editor: open tabs + settings.json content ───

export type EditorTab = {
  name: string
  kind: FileNode['kind']
  modified?: boolean
  active?: boolean
  preview?: boolean // italic title (working tree)
}

export const editorTabs: EditorTab[] = [
  { name: 'settings.json', kind: 'json', active: true },
  { name: 'profiles.yml', kind: 'yaml', modified: true },
  { name: 'profiles.yml (Working Tree)', kind: 'yaml', modified: true, preview: true },
]

export const breadcrumb = [
  'Users',
  'cto',
  'Library',
  'Application Support',
  'code-oss-dev',
  'User',
  'settings.json',
]

// token-typed line content for the settings.json editor
export type Token = { text: string; color: keyof typeof tokenColors }
export const tokenColors = {
  key: 'var(--color-syntax-key)',
  string: 'var(--color-syntax-string)',
  keyword: 'var(--color-syntax-keyword)',
  bool: 'var(--color-syntax-bool)',
  punct: 'var(--color-syntax-punct)',
  comment: 'var(--color-syntax-comment)',
} as const

export const settingsLines: Token[][] = [
  [{ text: '{', color: 'punct' }],
  [
    { text: '  ', color: 'punct' },
    { text: '"window.autoDetectColorScheme"', color: 'key' },
    { text: ': ', color: 'punct' },
    { text: 'false', color: 'bool' },
    { text: ',', color: 'punct' },
  ],
  [
    { text: '  ', color: 'punct' },
    { text: '"workbench.colorTheme"', color: 'key' },
    { text: ': ', color: 'punct' },
    { text: '"Cortex Code Dark"', color: 'string' },
    { text: ',', color: 'punct' },
  ],
  [
    { text: '  ', color: 'punct' },
    { text: '"dbt.snowflakeManagedEnabled"', color: 'key' },
    { text: ': ', color: 'punct' },
    { text: 'true', color: 'bool' },
    { text: ',', color: 'punct' },
  ],
  [
    { text: '  ', color: 'punct' },
    { text: '"dbt.executionMode"', color: 'key' },
    { text: ': ', color: 'punct' },
    { text: '"snowflake-managed"', color: 'string' },
  ],
  [{ text: '}', color: 'punct' }],
]

// ─── Snowflake Catalog list ───

export const catalogDatabases = [
  '"JK-with-quotes"',
  '"suho"',
  '123asdfasd$asdfasd',
  'A-B',
  'ABCD',
  'ABCDe',
  'ABEU_DB',
  'ACOBURN_DB',
  'ADMIN',
  'ADMIN$',
  'AFAULDS',
  'AFAULDS_CORTEX',
  'AFAULDS_CORTEX_DB',
  'AFAULDS_DBT',
  'AFAULDS_JAFFLE',
  'AG_TUTORIAL_DB',
  'AIG_TEST',
  'AILEEN_ICEBERG',
  'AIVANOU_DB',
  'AIVANOU_DB01',
  'AK',
  'AKOWALCZYK_BB',
  'AKOWALCZYK_OAUTH',
  'alay_MIX_CaSe',
  'ALAY_TEST',
  'ANALYTICS_FOUNDATION_DB',
  'ANALYTICS_INFRA_DB_DEV',
  'ANALYTICS_INFRA_DEV_DEV',
  'ANALYTICS_INFRASTRUCTURE',
  'ANALYTICS_PLATFORM_EVAL',
  'ANTON_TELEMETRY',
  'ANTONDCMDB',
  'ASDFASDFASDF',
  'ASDFD',
  'ASW_315_BUGBASH_DB',
  'BASE_DB_DEV',
  'BB_DB',
  'BD_DEMO',
]

// ─── Source Control commit graph ───

export const sourceControlChanges = [{ name: 'profiles.yml', status: 'M' as const }]

export const commitGraph = [
  'Merge pull request #39 fr...',
  'Update README.md to provide a comp...',
  'Standardize role usage in tasty_bytes_...',
  'Enhance tasty_bytes_setup.sql with ad...',
  'Add missing "Set up your environment"...',
  'Merge pull request #38 from Snowfla...',
  'Revise CI/CD setup SQL: update data...',
  'Update schedules.sql: change project r...',
  'Refine comment in schedules.sql: clarif...',
  'Update schedules.sql: refine comment ...',
  'Update CI/CD setup SQL: modify sche...',
  'Refactor task scheduling in schedules....',
  'Add CI/CD setup, GitHub Actions workfl...',
  'Merge pull request #9 from PatDecide...',
  'Update .gitignore',
  'Merge pull request #33 from Snowfla...',
  'Update threads in profiles.yml Cody ...',
]

// ─── SQL Results / Query History ───

export type QueryHistoryRow = {
  status: 'success' | 'error'
  time: string
  duration: string
  query: string
  id?: string
}

export const queryHistory: QueryHistoryRow[] = [
  {
    status: 'success',
    time: '28 min ago',
    duration: '0ms',
    query: 'EXECUTE DBT PROJECT FROM ...',
    id: '01c4c407-c814-f036-0000-534955859976',
  },
  {
    status: 'error',
    time: '29 min ago',
    duration: '0ms',
    query: 'EXECUTE DBT PROJECT FROM WORKSPACE USER$.PUBLIC."c...',
  },
]

// ─── DBT panel output entries ───

export type DbtOutputEntry = {
  command: string
  status: 'running' | 'success' | 'error'
  time?: string
  duration?: string
  detail?: string
}

export const dbtOutputError: DbtOutputEntry[] = [
  {
    command: 'dbt compile',
    status: 'error',
    time: '14:11:04',
    duration: '0ms',
    detail:
      'Failed to activate warehouse "dex_wh": SQL compilation error:\nObject does not exist, or operation cannot be performed..',
  },
  {
    command: 'dbt compile',
    status: 'error',
    time: '14:02:49',
    duration: '0ms',
  },
]

// ─── DBT Lineage graph (default view) ───
// One node per model file in the Explorer, plus the sources they read from.
// sources (col 0) → staging models (col 1) → marts models (col 2)

export type LineageNode = {
  id: string
  name: string
  type: 'source' | 'model'
  language?: 'sql' | 'python'
  col: number
  row: number
}

export type LineageEdge = { from: string; to: string }

export const lineageNodes: LineageNode[] = [
  // ── Sources (col 0) ──
  { id: 'src_customer_loyalty', name: 'CUSTOMER_LOYALTY', type: 'source', col: 0, row: 0 },
  { id: 'src_country', name: 'COUNTRY', type: 'source', col: 0, row: 1 },
  { id: 'src_franchise', name: 'FRANCHISE', type: 'source', col: 0, row: 2 },
  { id: 'src_location', name: 'LOCATION', type: 'source', col: 0, row: 3 },
  { id: 'src_menu', name: 'MENU', type: 'source', col: 0, row: 4 },
  { id: 'src_order_detail', name: 'ORDER_DETAIL', type: 'source', col: 0, row: 5 },
  { id: 'src_order_header', name: 'ORDER_HEADER', type: 'source', col: 0, row: 6 },
  { id: 'src_truck', name: 'TRUCK', type: 'source', col: 0, row: 7 },

  // ── Staging models (col 1) — one per staging/*.sql file ──
  { id: 'raw_customer_customer_loyalty', name: 'raw_customer_customer_loyalty', type: 'model', language: 'sql', col: 1, row: 0 },
  { id: 'raw_pos_country', name: 'raw_pos_country', type: 'model', language: 'sql', col: 1, row: 1 },
  { id: 'raw_pos_franchise', name: 'raw_pos_franchise', type: 'model', language: 'sql', col: 1, row: 2 },
  { id: 'raw_pos_location', name: 'raw_pos_location', type: 'model', language: 'sql', col: 1, row: 3 },
  { id: 'raw_pos_menu', name: 'raw_pos_menu', type: 'model', language: 'sql', col: 1, row: 4 },
  { id: 'raw_pos_order_detail', name: 'raw_pos_order_detail', type: 'model', language: 'sql', col: 1, row: 5 },
  { id: 'raw_pos_order_header', name: 'raw_pos_order_header', type: 'model', language: 'sql', col: 1, row: 6 },
  { id: 'raw_pos_truck', name: 'raw_pos_truck', type: 'model', language: 'sql', col: 1, row: 7 },

  // ── Marts models (col 2) — one per marts/* file ──
  { id: 'customer_loyalty_metrics', name: 'customer_loyalty_metrics', type: 'model', language: 'sql', col: 2, row: 1 },
  { id: 'orders', name: 'orders', type: 'model', language: 'sql', col: 2, row: 4 },
  { id: 'sales_metrics_by_location', name: 'sales_metrics_by_location', type: 'model', language: 'python', col: 2, row: 6 },
]

export const lineageEdges: LineageEdge[] = [
  // sources → staging
  { from: 'src_customer_loyalty', to: 'raw_customer_customer_loyalty' },
  { from: 'src_country', to: 'raw_pos_country' },
  { from: 'src_franchise', to: 'raw_pos_franchise' },
  { from: 'src_location', to: 'raw_pos_location' },
  { from: 'src_menu', to: 'raw_pos_menu' },
  { from: 'src_order_detail', to: 'raw_pos_order_detail' },
  { from: 'src_order_header', to: 'raw_pos_order_header' },
  { from: 'src_truck', to: 'raw_pos_truck' },

  // staging → orders
  { from: 'raw_pos_order_header', to: 'orders' },
  { from: 'raw_pos_order_detail', to: 'orders' },
  { from: 'raw_pos_menu', to: 'orders' },
  { from: 'raw_pos_franchise', to: 'orders' },
  { from: 'raw_pos_truck', to: 'orders' },

  // → customer_loyalty_metrics
  { from: 'raw_customer_customer_loyalty', to: 'customer_loyalty_metrics' },
  { from: 'orders', to: 'customer_loyalty_metrics' },

  // → sales_metrics_by_location
  { from: 'orders', to: 'sales_metrics_by_location' },
  { from: 'raw_pos_location', to: 'sales_metrics_by_location' },
  { from: 'raw_pos_country', to: 'sales_metrics_by_location' },
]

// ─── SESSION (Cortex AI) conversation ───

export const sessionTitle = 'DBT COMPILE ERROR WORKSPACE'

export const sessionSql = `EXECUTE DBT PROJECT FROM WORKSPACE
USER$.PUBLIC."coco_tasty_bytes_5403b3"
ARGS='compile --target dev'
DBT_VERSION='1.10.15'
WAREHOUSE='DEX_WH'`

export const sessionError = `Error: SQL compilation error:
invalid parameter 'WAREHOUSE'`

export const dbtRunSummary = [
  { label: 'Status', value: 'Success' },
  { label: 'dbt version', value: '1.10.15' },
  { label: 'Adapter', value: 'snowflake=1.10.3' },
  { label: 'Found', value: '11 models, 50 data tests, 8 sources, 481 macros' },
  { label: 'Target', value: 'dev with 8 threads concurrency' },
]
