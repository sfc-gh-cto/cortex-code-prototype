// Config shown in the dbt extension side panel (mirrors the official dbt VS Code
// extension's "Extension Info" + "Help" menu). Snowflake Managed only.
//
// A workspace can contain multiple dbt projects (each a dbt_project.yml). The
// panel has an active-project selector; all configuration is scoped per project.

export const DBT_VERSIONS = ['dbt 1.10.15 (managed)', 'dbt 1.9.4', 'dbt 1.8.9']
export const TARGETS = ['dev', 'prod', 'staging']
export const deferCompareOptions = ['Last run', 'Last successful run', 'Last failed run']

// Fixed connection facts for each dbt project detected in the workspace.
export type ProjectInfo = {
  id: string
  name: string
  profile: string
  account: string
  warehouse: string
  role: string
  threads: number
  defaultDeferObject: string
}

export const projects: ProjectInfo[] = [
  {
    id: 'tasty_bytes',
    name: 'tasty_bytes',
    profile: 'tasty_bytes_dbt_demo',
    account: 'qa6',
    warehouse: 'DBT_WH',
    role: 'TASTY_BYTES_DBT_ROLE',
    threads: 8,
    defaultDeferObject: 'TASTY_BYTES_PROD.ANALYTICS',
  },
  {
    id: 'jaffle_shop',
    name: 'jaffle_shop',
    profile: 'jaffle_shop',
    account: 'qa6',
    warehouse: 'ANALYTICS_WH',
    role: 'TRANSFORMER',
    threads: 4,
    defaultDeferObject: 'ANALYTICS_PROD.DBT_PROD',
  },
  {
    id: 'analytics_foundation',
    name: 'analytics_foundation',
    profile: 'analytics_prod',
    account: 'qa6',
    warehouse: 'FOUNDATION_WH',
    role: 'ANALYTICS_ROLE',
    threads: 16,
    defaultDeferObject: 'ANALYTICS_FOUNDATION_DB.PROD',
  },
]

export type VarOverride = { key: string; value: string }

// The editable, per-project configuration.
export type ProjectConfig = {
  target: string
  dbtVersion: string
  deferOn: boolean
  deferObject: string
  deferCompareTo: string
  flags: string
  fullRefresh: boolean
  vars: VarOverride[]
}

export function defaultConfig(p: ProjectInfo): ProjectConfig {
  return {
    target: 'dev',
    dbtVersion: DBT_VERSIONS[0],
    deferOn: false,
    deferObject: p.defaultDeferObject,
    deferCompareTo: deferCompareOptions[1],
    flags: '',
    fullRefresh: false,
    vars: [],
  }
}

export function initialProjectConfigs(): Record<string, ProjectConfig> {
  return Object.fromEntries(projects.map((p) => [p.id, defaultConfig(p)]))
}

// Flags actually passed to dbt = full-refresh toggle + free-text flags.
export function effectiveFlags(c: ProjectConfig): string {
  return [c.fullRefresh ? '--full-refresh' : '', c.flags.trim()].filter(Boolean).join(' ')
}

export type HelpLink = { id: string; label: string }

export const helpLinks: HelpLink[] = [
  { id: 'docs', label: 'Documentation' },
  { id: 'bug', label: 'Submit a bug' },
  { id: 'community', label: 'Join the community' },
  { id: 'support', label: 'Contact support' },
]
