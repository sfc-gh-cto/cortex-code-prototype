import { Fragment, type ReactNode } from 'react'

// A tiny SQL + Jinja tokenizer good enough for a static mock. Produces colored
// spans using the Dark+ syntax tokens defined in index.css.

const KEYWORDS = new Set([
  'select', 'from', 'where', 'with', 'as', 'and', 'or', 'not', 'in', 'on',
  'left', 'right', 'inner', 'outer', 'full', 'cross', 'join', 'group', 'by',
  'order', 'having', 'limit', 'union', 'all', 'distinct', 'case', 'when',
  'then', 'else', 'end', 'is', 'null', 'asc', 'desc', 'over', 'partition',
  'create', 'table', 'view', 'insert', 'into', 'values', 'update', 'set',
])

const FUNCTIONS = new Set([
  'sum', 'count', 'avg', 'min', 'max', 'cast', 'coalesce', 'round', 'lower',
  'upper', 'date_trunc', 'to_date', 'current_date',
])

const TOKEN = new RegExp(
  [
    '(--[^\\n]*)', // 1 line comment
    '(\\{\\{[\\s\\S]*?\\}\\}|\\{%[\\s\\S]*?%\\})', // 2 jinja
    "('(?:[^']|'')*')", // 3 string
    '(\\b\\d+(?:\\.\\d+)?\\b)', // 4 number
    '([A-Za-z_][A-Za-z0-9_]*)', // 5 identifier
    '(::|[(),.*=<>+\\-/|])', // 6 operator/punct
    '(\\s+)', // 7 whitespace
  ].join('|'),
  'g',
)

function color(cls: string, text: string, key: number): ReactNode {
  return (
    <span key={key} style={{ color: `var(--color-sx-${cls})` }}>
      {text}
    </span>
  )
}

export function highlightLine(line: string): ReactNode {
  if (!line) return '\u00a0'
  const out: ReactNode[] = []
  let m: RegExpExecArray | null
  let i = 0
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(line)) !== null) {
    const [, comment, jinja, str, num, ident, op, ws] = m
    if (comment) out.push(color('comment', comment, i))
    else if (jinja) out.push(color('jinja', jinja, i))
    else if (str) out.push(color('string', str, i))
    else if (num) out.push(color('number', num, i))
    else if (ident) {
      const low = ident.toLowerCase()
      if (KEYWORDS.has(low)) out.push(color('keyword', ident, i))
      else if (FUNCTIONS.has(low)) out.push(color('function', ident, i))
      else out.push(<Fragment key={i}>{ident}</Fragment>)
    } else if (op) out.push(color('operator', op, i))
    else if (ws) out.push(<Fragment key={i}>{ws}</Fragment>)
    i++
  }
  return out
}
