// ─── dbt execution settings (shared across the command bar + Settings UI) ───

export type RunMode = 'snowflake' | 'local'

// Virtual editor tab that renders the Settings UI instead of file content.
export const SETTINGS_TAB = 'Settings'
export const isSettingsTab = (name: string) => name === SETTINGS_TAB

export type ExecutionMode = {
  id: RunMode
  label: string
  recommended?: boolean
  desc: string
  bullets: string[]
}

export const EXECUTION_MODES: ExecutionMode[] = [
  {
    id: 'snowflake',
    label: 'Snowflake Managed',
    recommended: true,
    desc: 'Runs dbt inside Snowflake using EXECUTE DBT PROJECT.',
    bullets: [
      'No local dbt install, Python env, or dependencies to maintain',
      'Consistent, reproducible runs on Snowflake compute',
      'dbt version & packages managed for you',
      'Schedule and orchestrate runs natively in Snowflake',
    ],
  },
  {
    id: 'local',
    label: 'Local',
    desc: 'Runs dbt on your machine against Snowflake.',
    bullets: [
      'Requires a local dbt + adapter install',
      'You manage the Python environment and dependencies',
      'Useful for offline editing and custom tooling',
    ],
  },
]
