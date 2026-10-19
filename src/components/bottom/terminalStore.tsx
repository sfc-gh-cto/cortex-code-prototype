import { createContext, useContext, useState, type ReactNode } from 'react'
import { fileTree } from '../../data/mockData'

export type Entry = { type: 'cmd' | 'out' | 'err'; text: string }
export type Session = {
  id: number
  shell: 'zsh' | 'bash'
  name: string
  entries: Entry[]
  input: string
}

export const PROMPT_USER = 'cto@G50H9VQ671'
export const PROMPT_DIR = 'getting-started-with-dbt-on-snowflake'

type TerminalCtx = {
  sessions: Session[]
  activeId: number | null
  active: Session | null
  newTerminal: (shell?: 'zsh' | 'bash') => void
  killTerminal: (id: number) => void
  selectTerminal: (id: number) => void
  setInput: (id: number, value: string) => void
  runCommand: (id: number) => void
  clearTerminal: (id: number) => void
}

const Ctx = createContext<TerminalCtx | null>(null)

let idCounter = 1

// Very small fake shell so the prompt feels alive in the prototype.
function runFakeCommand(cmd: string): Entry[] {
  const trimmed = cmd.trim()
  if (!trimmed) return []
  const [name, ...args] = trimmed.split(/\s+/)
  switch (name) {
    case 'ls': {
      const names = fileTree[0]?.children?.map((c) => c.name) ?? []
      return [{ type: 'out', text: names.join('   ') }]
    }
    case 'pwd':
      return [{ type: 'out', text: `/Users/cto/projects/${PROMPT_DIR}` }]
    case 'whoami':
      return [{ type: 'out', text: 'cto' }]
    case 'echo':
      return [{ type: 'out', text: args.join(' ') }]
    case 'date':
      return [{ type: 'out', text: new Date().toString() }]
    case 'cd':
      return []
    case 'git':
      if (args[0] === 'status')
        return [{ type: 'out', text: 'On branch main\nnothing to commit, working tree clean' }]
      return [{ type: 'out', text: `git: '${args[0] ?? ''}' is not a git command. See 'git --help'.` }]
    case 'dbt':
      if (args[0] === '--version')
        return [
          {
            type: 'out',
            text: 'Core:\n  - installed: 1.10.15\n  - latest:    1.10.15\n\nPlugins:\n  - snowflake: 1.10.3',
          },
        ]
      return [{ type: 'out', text: 'Running with dbt=1.10.15\nFound 11 models, 8 sources, 481 macros' }]
    case 'help':
      return [{ type: 'out', text: 'available: ls, pwd, whoami, echo, date, git, dbt, clear' }]
    default:
      return [{ type: 'err', text: `zsh: command not found: ${name}` }]
  }
}

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>(() => [
    { id: 0, shell: 'zsh', name: 'zsh', entries: [], input: '' },
  ])
  const [activeId, setActiveId] = useState<number | null>(0)

  function newTerminal(shell: 'zsh' | 'bash' = 'zsh') {
    const id = idCounter++
    setSessions((s) => [...s, { id, shell, name: shell, entries: [], input: '' }])
    setActiveId(id)
  }

  function killTerminal(id: number) {
    const idx = sessions.findIndex((s) => s.id === id)
    const next = sessions.filter((s) => s.id !== id)
    setSessions(next)
    if (activeId === id) {
      const fallback = next[idx] ?? next[idx - 1] ?? next[next.length - 1]
      setActiveId(fallback ? fallback.id : null)
    }
  }

  function selectTerminal(id: number) {
    setActiveId(id)
  }

  function setInput(id: number, value: string) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, input: value } : s)))
  }

  function clearTerminal(id: number) {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, entries: [] } : s)))
  }

  function runCommand(id: number) {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const cmd = s.input
        if (cmd.trim() === 'clear') return { ...s, entries: [], input: '' }
        const out = runFakeCommand(cmd)
        return { ...s, entries: [...s.entries, { type: 'cmd', text: cmd }, ...out], input: '' }
      }),
    )
  }

  const active = sessions.find((s) => s.id === activeId) ?? null

  const value: TerminalCtx = {
    sessions,
    activeId,
    active,
    newTerminal,
    killTerminal,
    selectTerminal,
    setInput,
    runCommand,
    clearTerminal,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTerminal() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTerminal must be used within TerminalProvider')
  return ctx
}
