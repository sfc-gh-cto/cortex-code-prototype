// Commands contributed by the extension, shown in the Command Palette — the
// primary way to run dbt actions (mirroring the dbt Labs / Power User extension).

export type Command = {
  id: string
  category: string
  title: string
  keybinding?: string
  // When true, choosing the command opens a secondary input for additional flags.
  takesFlags?: boolean
}

export const commands: Command[] = [
  { id: 'dbt.run', category: 'dbt', title: 'Run Model', keybinding: '⌘ ⇧ R', takesFlags: true },
  { id: 'dbt.build', category: 'dbt', title: 'Build', takesFlags: true },
  { id: 'dbt.test', category: 'dbt', title: 'Test Model', takesFlags: true },
  { id: 'dbt.compile', category: 'dbt', title: 'Compile Model', keybinding: '⌘ ⇧ C' },
  { id: 'dbt.preview', category: 'dbt', title: 'Preview Query Results', keybinding: '⌘ ⏎' },
  { id: 'dbt.lineage', category: 'dbt', title: 'Show Lineage' },
  { id: 'dbt.docs', category: 'dbt', title: 'Generate Docs' },
  { id: 'dbt.deps', category: 'dbt', title: 'Install Dependencies' },
  { id: 'dbt.deferToggle', category: 'dbt', title: 'Toggle Defer to Production' },
  { id: 'dbt.selectTarget', category: 'dbt', title: 'Select Target: dev / prod / staging' },
  { id: 'snowflake.catalog', category: 'Snowflake', title: 'Open Catalog' },
  { id: 'snowflake.connection', category: 'Snowflake', title: 'Manage Connection' },
]
