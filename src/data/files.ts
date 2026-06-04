// ─── Per-file editor content + a tiny syntax tokenizer ───
// Maps each Explorer file to displayable, syntax-highlighted content so that
// selecting a file in the tree opens it in the editor.

import { fileTree, type FileNode, type Token } from './mockData'

type Lang = NonNullable<FileNode['kind']>

const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'with', 'as', 'join', 'left', 'right', 'inner',
  'outer', 'on', 'group', 'by', 'order', 'having', 'and', 'or', 'not', 'in',
  'is', 'distinct', 'count', 'sum', 'min', 'max', 'avg', 'case', 'when', 'then',
  'else', 'end', 'create', 'replace', 'table', 'view', 'task', 'warehouse',
  'schedule', 'execute', 'project', 'args', 'alter', 'resume', 'using', 'cron',
])

const PY_KEYWORDS = new Set([
  'import', 'from', 'as', 'def', 'return', 'class', 'for', 'in', 'if', 'elif',
  'else', 'while', 'with', 'try', 'except', 'finally', 'raise', 'lambda',
  'yield', 'pass', 'break', 'continue', 'and', 'or', 'not', 'is',
])

const BOOLS = ['true', 'false', 'null', 'none', 'yes', 'no']

const isWord = (c: string) => /[A-Za-z0-9_]/.test(c)

function tokenizeCode(
  line: string,
  opts: { comment?: string; keywords?: Set<string>; jinja?: boolean },
): Token[] {
  const { comment, keywords, jinja } = opts
  const tokens: Token[] = []
  const n = line.length
  let i = 0
  const push = (text: string, color: Token['color']) => {
    if (text) tokens.push({ text, color })
  }

  while (i < n) {
    const rest = line.slice(i)
    if (comment && rest.startsWith(comment)) {
      push(rest, 'comment')
      break
    }
    if (jinja && (rest.startsWith('{{') || rest.startsWith('{%'))) {
      const close = rest.startsWith('{{') ? '}}' : '%}'
      const idx = rest.indexOf(close)
      const end = idx === -1 ? n : i + idx + 2
      push(line.slice(i, end), 'keyword')
      i = end
      continue
    }
    const c = line[i]
    if (c === '"' || c === "'") {
      let j = i + 1
      while (j < n && line[j] !== c) j++
      push(line.slice(i, Math.min(j + 1, n)), 'string')
      i = j + 1
      continue
    }
    if (/[0-9]/.test(c)) {
      let j = i
      while (j < n && /[0-9._]/.test(line[j])) j++
      push(line.slice(i, j), 'number')
      i = j
      continue
    }
    if (isWord(c)) {
      let j = i
      while (j < n && isWord(line[j])) j++
      const word = line.slice(i, j)
      const lower = word.toLowerCase()
      const color: Token['color'] = keywords?.has(lower)
        ? 'keyword'
        : BOOLS.includes(lower)
          ? 'bool'
          : 'text'
      push(word, color)
      i = j
      continue
    }
    let j = i
    while (j < n && !isWord(line[j]) && line[j] !== '"' && line[j] !== "'" && !/[0-9]/.test(line[j])) {
      if (comment && line.slice(j).startsWith(comment)) break
      if (jinja && (line.slice(j).startsWith('{{') || line.slice(j).startsWith('{%'))) break
      j++
    }
    push(line.slice(i, j), 'punct')
    i = j
  }
  return tokens
}

function colorWithJinja(value: string): Token[] {
  const tokens: Token[] = []
  const re = /(\{\{.*?\}\}|\{%.*?%\})/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(value))) {
    if (m.index > last) tokens.push({ text: value.slice(last, m.index), color: 'string' })
    tokens.push({ text: m[0], color: 'keyword' })
    last = m.index + m[0].length
  }
  if (last < value.length) tokens.push({ text: value.slice(last), color: 'string' })
  return tokens.length ? tokens : [{ text: value, color: 'string' }]
}

function tokenizeYamlValue(value: string): Token[] {
  const ci = value.indexOf(' #')
  let comment = ''
  let v = value
  if (ci !== -1) {
    comment = value.slice(ci)
    v = value.slice(0, ci)
  }
  const tokens: Token[] = []
  const trimmed = v.trim()
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) tokens.push({ text: v, color: 'number' })
  else if (BOOLS.includes(trimmed.toLowerCase())) tokens.push({ text: v, color: 'bool' })
  else tokens.push(...colorWithJinja(v))
  if (comment) tokens.push({ text: comment, color: 'comment' })
  return tokens
}

function tokenizeYaml(line: string): Token[] {
  if (line.trimStart().startsWith('#')) return [{ text: line, color: 'comment' }]
  const m = line.match(/^(\s*(?:- )?)([^:#\s][^:]*?)(:)(\s*)(.*)$/)
  if (m) {
    const [, indent, key, colon, space, value] = m
    const tokens: Token[] = []
    if (indent) tokens.push({ text: indent, color: 'punct' })
    tokens.push({ text: key, color: 'key' })
    tokens.push({ text: colon, color: 'punct' })
    if (space) tokens.push({ text: space, color: 'punct' })
    if (value) tokens.push(...tokenizeYamlValue(value))
    return tokens
  }
  return [{ text: line, color: 'text' }]
}

function tokenizeJson(line: string): Token[] {
  const tokens: Token[] = []
  const n = line.length
  let i = 0
  while (i < n) {
    const c = line[i]
    if (c === '"') {
      let j = i + 1
      while (j < n && line[j] !== '"') j++
      const str = line.slice(i, Math.min(j + 1, n))
      let k = j + 1
      while (k < n && line[k] === ' ') k++
      tokens.push({ text: str, color: line[k] === ':' ? 'key' : 'string' })
      i = j + 1
      continue
    }
    if (/[0-9]/.test(c)) {
      let j = i
      while (j < n && /[0-9.]/.test(line[j])) j++
      tokens.push({ text: line.slice(i, j), color: 'number' })
      i = j
      continue
    }
    if (/[A-Za-z]/.test(c)) {
      let j = i
      while (j < n && /[A-Za-z]/.test(line[j])) j++
      const w = line.slice(i, j)
      tokens.push({ text: w, color: BOOLS.includes(w) ? 'bool' : 'text' })
      i = j
      continue
    }
    let j = i
    while (j < n && !/["0-9A-Za-z]/.test(line[j])) j++
    tokens.push({ text: line.slice(i, j), color: 'punct' })
    i = j
  }
  return tokens
}

function tokenizeMd(line: string): Token[] {
  if (/^\s*#{1,6}\s/.test(line)) return [{ text: line, color: 'keyword' }]
  if (/^\s*[-*]\s/.test(line)) return [{ text: line, color: 'text' }]
  return [{ text: line, color: 'text' }]
}

function tokenizeLine(line: string, kind: Lang): Token[] {
  switch (kind) {
    case 'yaml':
      return tokenizeYaml(line)
    case 'sql':
      return tokenizeCode(line, { comment: '--', keywords: SQL_KEYWORDS, jinja: true })
    case 'python':
      return tokenizeCode(line, { comment: '#', keywords: PY_KEYWORDS })
    case 'json':
      return tokenizeJson(line)
    case 'md':
      return tokenizeMd(line)
    default:
      return [{ text: line || ' ', color: 'text' }]
  }
}

function tokenizeContent(text: string, kind: Lang): Token[][] {
  return text.replace(/\n$/, '').split('\n').map((line) =>
    line.length ? tokenizeLine(line, kind) : [{ text: ' ', color: 'punct' as const }],
  )
}

// ─── Raw file contents ───

const stagingModel = (source: string, table: string) =>
  `with source as (
    select * from {{ source('${source}', '${table}') }}
),

renamed as (
    select
        *
    from source
)

select * from renamed
`

const rawFiles: Record<string, { kind: Lang; text: string }> = {
  'settings.json': {
    kind: 'json',
    text: `{
  "window.autoDetectColorScheme": false,
  "workbench.colorTheme": "Cortex Code Dark",
  "dbt.snowflakeManagedEnabled": true,
  "dbt.executionMode": "snowflake-managed"
}`,
  },
  'profiles.yml': {
    kind: 'yaml',
    text: `# Snowflake connection profiles for the Tasty Bytes dbt demo
tasty_bytes_dbt_demo:
  target: dev
  outputs:
    dev:
      type: snowflake
      account: "{{ env_var('SNOWFLAKE_ACCOUNT') }}"
      user: "{{ env_var('SNOWFLAKE_USER') }}"
      authenticator: externalbrowser
      role: tasty_bytes_dbt_role
      database: tasty_bytes
      warehouse: dex_wh
      schema: dbt_dev
      threads: 8
    prod:
      type: snowflake
      account: "{{ env_var('SNOWFLAKE_ACCOUNT') }}"
      user: "{{ env_var('SNOWFLAKE_USER') }}"
      authenticator: externalbrowser
      role: tasty_bytes_dbt_role
      database: tasty_bytes
      warehouse: dex_wh_prod
      schema: dbt_prod
      threads: 16`,
  },
  'dbt_project.yml': {
    kind: 'yaml',
    text: `name: 'tasty_bytes_dbt_demo'
version: '1.0.0'
config-version: 2

profile: 'tasty_bytes_dbt_demo'

model-paths: ["models"]
analysis-paths: ["analyses"]
test-paths: ["tests"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
snapshot-paths: ["snapshots"]

target-path: "target"
clean-targets:
  - "target"
  - "dbt_packages"

models:
  tasty_bytes_dbt_demo:
    staging:
      +materialized: view
    marts:
      +materialized: table`,
  },
  'packages.yml': {
    kind: 'yaml',
    text: `packages:
  - package: dbt-labs/dbt_utils
    version: 1.1.1
  - package: calogica/dbt_expectations
    version: 0.10.3`,
  },
  '__sources.yml': {
    kind: 'yaml',
    text: `version: 2

sources:
  - name: tasty_bytes_raw
    database: tasty_bytes
    schema: raw_pos
    tables:
      - name: country
      - name: franchise
      - name: location
      - name: menu
      - name: order_detail
      - name: order_header
      - name: truck
  - name: tasty_bytes_customer
    database: tasty_bytes
    schema: raw_customer
    tables:
      - name: customer_loyalty`,
  },
  'orders.sql': {
    kind: 'sql',
    text: `{{
  config(
    materialized = 'table',
    cluster_by = ['order_date']
  )
}}

with order_header as (
    select * from {{ ref('raw_pos_order_header') }}
),

order_detail as (
    select * from {{ ref('raw_pos_order_detail') }}
),

menu as (
    select * from {{ ref('raw_pos_menu') }}
),

final as (
    select
        oh.order_id,
        oh.truck_id,
        oh.location_id,
        oh.customer_id,
        oh.order_ts::date as order_date,
        od.menu_item_id,
        m.menu_item_name,
        od.quantity,
        od.price,
        od.quantity * od.price as line_total
    from order_header oh
    join order_detail od on oh.order_id = od.order_id
    join menu m on od.menu_item_id = m.menu_item_id
)

select * from final`,
  },
  'customer_loyalty_metrics.sql': {
    kind: 'sql',
    text: `{{ config(materialized = 'table') }}

with orders as (
    select * from {{ ref('orders') }}
),

loyalty as (
    select * from {{ ref('raw_customer_customer_loyalty') }}
),

customer_orders as (
    select
        customer_id,
        count(distinct order_id) as total_orders,
        sum(line_total) as lifetime_spend,
        min(order_date) as first_order_date,
        max(order_date) as most_recent_order_date
    from orders
    group by 1
)

select
    l.customer_id,
    l.first_name,
    l.last_name,
    l.city,
    l.country,
    co.total_orders,
    co.lifetime_spend,
    co.first_order_date,
    co.most_recent_order_date
from loyalty l
left join customer_orders co on l.customer_id = co.customer_id`,
  },
  'sales_metrics_by_location.py': {
    kind: 'python',
    text: `import snowflake.snowpark.functions as F


def model(dbt, session):
    dbt.config(materialized="table")

    orders = dbt.ref("orders")
    location = dbt.ref("raw_pos_location")
    country = dbt.ref("raw_pos_country")

    sales = orders.group_by("location_id").agg(
        F.sum("line_total").alias("total_sales"),
        F.count_distinct("order_id").alias("order_count"),
    )

    enriched = sales.join(
        location, sales["location_id"] == location["location_id"]
    ).join(
        country, location["country_id"] == country["country_id"]
    ).select(
        location["location_name"],
        country["country"],
        sales["total_sales"],
        sales["order_count"],
    )

    return enriched`,
  },
  'schedules.sql': {
    kind: 'sql',
    text: `-- Scheduled dbt build for the Tasty Bytes demo project
create or replace task tasty_bytes_dbt_build
    warehouse = dex_wh
    schedule = 'USING CRON 0 6 * * * America/Los_Angeles'
as
    execute dbt project tasty_bytes_dbt_demo args = 'build --target prod';

alter task tasty_bytes_dbt_build resume;`,
  },
  'README.md': {
    kind: 'md',
    text: `# Getting Started with dbt on Snowflake

This project demonstrates a dbt workflow against the Tasty Bytes sample
dataset running on Snowflake.

## Layout

- models/staging - raw source models, materialized as views
- models/marts - business-level models, materialized as tables
- macros - reusable SQL macros
- tests - data tests

## Running

    dbt deps
    dbt build --target dev`,
  },
  'LEGAL.md': {
    kind: 'md',
    text: `# Legal

This sample project is provided by Snowflake for demonstration purposes.
Use of the Tasty Bytes dataset is subject to the Snowflake sample data terms.`,
  },
  'LICENSE': {
    kind: 'license',
    text: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright 2024 Snowflake Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.`,
  },
  '.gitignore': {
    kind: 'git',
    text: `target/
dbt_packages/
logs/
.env
.user.yml`,
  },
  'raw_customer_customer_loyalty.sql': { kind: 'sql', text: stagingModel('tasty_bytes_customer', 'customer_loyalty') },
  'raw_pos_country.sql': { kind: 'sql', text: stagingModel('tasty_bytes_raw', 'country') },
  'raw_pos_franchise.sql': { kind: 'sql', text: stagingModel('tasty_bytes_raw', 'franchise') },
  'raw_pos_location.sql': { kind: 'sql', text: stagingModel('tasty_bytes_raw', 'location') },
  'raw_pos_menu.sql': { kind: 'sql', text: stagingModel('tasty_bytes_raw', 'menu') },
  'raw_pos_order_detail.sql': { kind: 'sql', text: stagingModel('tasty_bytes_raw', 'order_detail') },
  'raw_pos_order_header.sql': { kind: 'sql', text: stagingModel('tasty_bytes_raw', 'order_header') },
  'raw_pos_truck.sql': { kind: 'sql', text: stagingModel('tasty_bytes_raw', 'truck') },

  // ── jaffle_shop project (keyed by full-path id) ──
  'jaffle_shop/dbt_project.yml': {
    kind: 'yaml',
    text: `name: 'jaffle_shop'
version: '2.0.0'
config-version: 2

profile: 'jaffle_shop'

model-paths: ["models"]
seed-paths: ["seeds"]

models:
  jaffle_shop:
    staging:
      +materialized: view
    marts:
      +materialized: table`,
  },
  'jaffle_shop/packages.yml': {
    kind: 'yaml',
    text: `packages:
  - package: dbt-labs/dbt_utils
    version: 1.1.1`,
  },
  'jaffle_shop/profiles.yml': {
    kind: 'yaml',
    text: `jaffle_shop:
  target: dev
  outputs:
    dev:
      type: snowflake
      account: "{{ env_var('SNOWFLAKE_ACCOUNT') }}"
      user: "{{ env_var('SNOWFLAKE_USER') }}"
      authenticator: externalbrowser
      role: jaffle_shop_role
      database: jaffle_shop
      warehouse: jaffle_wh
      schema: dbt_dev
      threads: 4`,
  },
  'jaffle_shop/README.md': {
    kind: 'md',
    text: `# Jaffle Shop

A classic dbt demo project modeling a fictional jaffle shop's
customers, orders, and payments on Snowflake.

## Layout

- models/staging - source-aligned staging models (views)
- models/marts - business entities (tables)`,
  },
  'jaffle_shop/models/staging/stg_customers.sql': {
    kind: 'sql',
    text: `with source as (
    select * from {{ source('jaffle_raw', 'customers') }}
),

renamed as (
    select
        id as customer_id,
        first_name,
        last_name
    from source
)

select * from renamed`,
  },
  'jaffle_shop/models/staging/stg_orders.sql': {
    kind: 'sql',
    text: `with source as (
    select * from {{ source('jaffle_raw', 'orders') }}
),

renamed as (
    select
        id as order_id,
        user_id as customer_id,
        order_date,
        status
    from source
)

select * from renamed`,
  },
  'jaffle_shop/models/staging/stg_payments.sql': {
    kind: 'sql',
    text: `with source as (
    select * from {{ source('jaffle_raw', 'payments') }}
),

renamed as (
    select
        id as payment_id,
        order_id,
        payment_method,
        amount / 100 as amount
    from source
)

select * from renamed`,
  },
  'jaffle_shop/models/marts/customers.sql': {
    kind: 'sql',
    text: `{{ config(materialized = 'table') }}

with customers as (
    select * from {{ ref('stg_customers') }}
),

orders as (
    select * from {{ ref('stg_orders') }}
),

customer_orders as (
    select
        customer_id,
        min(order_date) as first_order,
        max(order_date) as most_recent_order,
        count(order_id) as number_of_orders
    from orders
    group by 1
)

select
    c.customer_id,
    c.first_name,
    c.last_name,
    co.first_order,
    co.most_recent_order,
    co.number_of_orders
from customers c
left join customer_orders co on c.customer_id = co.customer_id`,
  },
  'jaffle_shop/models/marts/orders.sql': {
    kind: 'sql',
    text: `{{ config(materialized = 'table') }}

with orders as (
    select * from {{ ref('stg_orders') }}
),

payments as (
    select * from {{ ref('stg_payments') }}
),

order_payments as (
    select
        order_id,
        sum(amount) as amount
    from payments
    group by 1
)

select
    o.order_id,
    o.customer_id,
    o.order_date,
    o.status,
    op.amount
from orders o
left join order_payments op on o.order_id = op.order_id`,
  },
}

// ─── Helpers consumed by the editor ───

function kindFromName(name: string): Lang {
  if (name.endsWith('.sql')) return 'sql'
  if (name.endsWith('.py')) return 'python'
  if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'yaml'
  if (name.endsWith('.json')) return 'json'
  if (name.endsWith('.md')) return 'md'
  if (name === 'LICENSE') return 'license'
  if (name === '.gitignore') return 'git'
  return 'generic'
}

function placeholder(name: string, kind: Lang): string {
  switch (kind) {
    case 'sql':
      return `-- ${name}\nselect 1 as placeholder`
    case 'python':
      return `# ${name}\n\n\ndef model(dbt, session):\n    return session.sql("select 1")`
    case 'yaml':
      return `# ${name}\nversion: 2`
    case 'md':
      return `# ${name}`
    default:
      return name
  }
}

// ─── Compiled artifacts (target/compiled/...) ───
// Compiled files carry a full-path id so they stay distinct from the model that
// shares their base name. We resolve jinja (config/ref/source) into static SQL.

export const isCompiledFile = (name: string) => name.includes('/target/compiled/')
// Files identified by a full path (compiled artifacts, second-project files).
const isPathId = (name: string) => name.includes('/')
const baseName = (name: string) => name.split('/').pop() ?? name

// Path to a model's compiled artifact, e.g.
// tasty_bytes_dbt_demo/target/compiled/tasty_bytes_dbt_demo/models/marts/orders.sql
export function compiledPathFor(model: string): string {
  const p = getFilePath(model)
  return [p[0], 'target', 'compiled', ...p].join('/')
}

function compileSql(text: string): string {
  let out = text
  // drop {{ config(...) }} blocks (single or multi-line)
  out = out.replace(/\{\{[\s\S]*?config\s*\([\s\S]*?\)[\s\S]*?\}\}\s*/g, '')
  // {{ ref('x') }} → tasty_bytes.dbt_dev.x
  out = out.replace(/\{\{\s*ref\(\s*['"]([^'"]+)['"]\s*\)\s*\}\}/g, 'tasty_bytes.dbt_dev.$1')
  // {{ source('a', 'b') }} → tasty_bytes.raw_pos.b
  out = out.replace(
    /\{\{\s*source\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)\s*\}\}/g,
    'tasty_bytes.raw_pos.$2',
  )
  return out.replace(/^\s+/, '').replace(/\s+$/, '') + '\n'
}

function compiledContent(model: string, kind: Lang): string {
  const raw = rawFiles[model]
  if (!raw) return placeholder(model, kind)
  const header = `-- Compiled by dbt from models/${model}\n\n`
  return kind === 'sql' ? header + compileSql(raw.text) : raw.text
}

export function getFileKind(name: string): Lang {
  const raw = rawFiles[name]
  if (raw) return raw.kind
  return kindFromName(isPathId(name) ? baseName(name) : name)
}

export function getFileContent(name: string): { kind: Lang; lines: Token[][] } {
  if (isCompiledFile(name)) {
    const kind = kindFromName(baseName(name))
    return { kind, lines: tokenizeContent(compiledContent(baseName(name), kind), kind) }
  }
  const raw = rawFiles[name]
  if (raw) return { kind: raw.kind, lines: tokenizeContent(raw.text, raw.kind) }
  const label = isPathId(name) ? baseName(name) : name
  const kind = kindFromName(label)
  return { kind, lines: tokenizeContent(placeholder(label, kind), kind) }
}

// Tab/breadcrumb display label — path-id files show only their base filename.
export function displayName(name: string): string {
  return isPathId(name) ? baseName(name) : name
}

function findPath(nodes: FileNode[], name: string, trail: string[] = []): string[] | null {
  for (const node of nodes) {
    const next = [...trail, node.name]
    if (node.type === 'file' && node.name === name) return next
    if (node.children) {
      const found = findPath(node.children, name, next)
      if (found) return found
    }
  }
  return null
}

export function getFilePath(name: string): string[] {
  if (isPathId(name)) return name.split('/')
  return findPath(fileTree, name) ?? [name]
}

export const DBT_PROJECT_ROOT = 'tasty_bytes_dbt_demo'

// Top-level folders that are dbt projects (contain a dbt_project.yml).
export const dbtProjectRoots: string[] = fileTree
  .filter(
    (n) =>
      n.type === 'folder' &&
      (n.children?.some((c) => c.type === 'file' && c.name === 'dbt_project.yml') ?? false),
  )
  .map((n) => n.name)

export function isInDbtProject(name: string): boolean {
  return dbtProjectRoots.includes(getFilePath(name)[0])
}

// A dbt "model" is a .sql / .py file living under a project's models/ folder.
// Build / Preview / Compile actions only apply to these.
export function isDbtModel(name: string): boolean {
  if (isCompiledFile(name)) return false
  const path = getFilePath(name)
  return (
    dbtProjectRoots.includes(path[0]) &&
    path.includes('models') &&
    (name.endsWith('.sql') || name.endsWith('.py'))
  )
}

// ─── Preview results (mock query output for a model) ───

export type ResultSet = { columns: string[]; rows: (string | number)[][] }

const MODEL_RESULTS: Record<string, ResultSet> = {
  'orders.sql': {
    columns: ['ORDER_ID', 'ORDER_DATE', 'LOCATION_ID', 'MENU_ITEM_NAME', 'QUANTITY', 'PRICE', 'LINE_TOTAL'],
    rows: [
      [100001, '2024-01-03', 1402, 'Lobster Mac & Cheese', 2, 17.0, 34.0],
      [100002, '2024-01-03', 1402, 'Two Meat Plate', 1, 14.0, 14.0],
      [100003, '2024-01-04', 3871, 'Spicy Miso Ramen', 3, 12.5, 37.5],
      [100004, '2024-01-04', 1180, 'The Classic', 1, 9.0, 9.0],
      [100005, '2024-01-05', 2255, 'Veggie Burger', 2, 11.0, 22.0],
      [100006, '2024-01-05', 3871, 'Bottled Water', 4, 2.0, 8.0],
      [100007, '2024-01-06', 1402, 'Mango Sticky Rice', 2, 6.5, 13.0],
      [100008, '2024-01-06', 1180, 'Ice Tea', 3, 3.0, 9.0],
      [100009, '2024-01-07', 2255, 'Pulled Pork Sandwich', 1, 13.0, 13.0],
      [100010, '2024-01-07', 3871, 'Edamame', 2, 5.0, 10.0],
    ],
  },
  'customer_loyalty_metrics.sql': {
    columns: [
      'CUSTOMER_ID',
      'FIRST_NAME',
      'LAST_NAME',
      'CITY',
      'COUNTRY',
      'TOTAL_ORDERS',
      'LIFETIME_SPEND',
      'FIRST_ORDER_DATE',
    ],
    rows: [
      [4001, 'Ava', 'Nguyen', 'San Mateo', 'United States', 42, 1284.5, '2022-06-11'],
      [4002, 'Liam', 'Patel', 'Seattle', 'United States', 17, 503.0, '2023-01-02'],
      [4003, 'Sofia', 'Rossi', 'Milan', 'Italy', 28, 894.25, '2022-09-19'],
      [4004, 'Noah', 'Kim', 'Vancouver', 'Canada', 9, 211.75, '2023-08-30'],
      [4005, 'Emma', 'Müller', 'Berlin', 'Germany', 35, 1102.0, '2022-04-05'],
      [4006, 'Lucas', 'Silva', 'São Paulo', 'Brazil', 21, 640.5, '2023-03-14'],
      [4007, 'Mia', 'Tanaka', 'Tokyo', 'Japan', 53, 1640.0, '2021-12-01'],
      [4008, 'Ethan', 'Brown', 'Austin', 'United States', 12, 318.0, '2023-10-22'],
    ],
  },
  'sales_metrics_by_location.py': {
    columns: ['LOCATION_NAME', 'COUNTRY', 'TOTAL_SALES', 'ORDER_COUNT'],
    rows: [
      ['Mission Dolores Park', 'United States', 184230.5, 9821],
      ['Pike Place Market', 'United States', 152980.0, 8044],
      ['Piazza del Duomo', 'Italy', 98450.75, 5310],
      ['Stanley Park', 'Canada', 76120.25, 4102],
      ['Brandenburg Gate', 'Germany', 134560.0, 7233],
      ['Ibirapuera Park', 'Brazil', 89230.5, 4980],
      ['Shibuya Crossing', 'Japan', 201340.0, 10544],
    ],
  },
}

export function getModelResults(name: string): ResultSet {
  if (MODEL_RESULTS[name]) return MODEL_RESULTS[name]
  const columns = ['ID', 'NAME', 'STATUS', 'AMOUNT', 'UPDATED_AT']
  const rows: (string | number)[][] = Array.from({ length: 12 }, (_, i) => [
    1000 + i,
    `row_${i + 1}`,
    i % 3 === 0 ? 'active' : 'inactive',
    Math.round((i * 37.5 + 12.4) * 100) / 100,
    `2026-0${(i % 9) + 1}-1${i % 9}`,
  ])
  return { columns, rows }
}

// ─── Results-as-editor-tab helpers ───

const RESULTS_SUFFIX = ' (Results)'
export const resultsTabName = (model: string) => `${model}${RESULTS_SUFFIX}`
export const isResultsTab = (name: string) => name.endsWith(RESULTS_SUFFIX)
export const resultsTabModel = (name: string) => name.slice(0, -RESULTS_SUFFIX.length)

const modifiedNames = (() => {
  const set = new Set<string>()
  const walk = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (node.type === 'file' && node.modified) set.add(node.name)
      if (node.children) walk(node.children)
    }
  }
  walk(fileTree)
  return set
})()

export function isModified(name: string): boolean {
  return modifiedNames.has(name)
}

// Every dbt model file in the project (used to mark all-compiled on a project run).
export const dbtModelNames: string[] = (() => {
  const out: string[] = []
  const walk = (nodes: FileNode[]) => {
    for (const node of nodes) {
      if (node.type === 'file' && !node.id && isDbtModel(node.name)) out.push(node.name)
      if (node.children) walk(node.children)
    }
  }
  walk(fileTree)
  return out
})()

// ─── Quick Open / command palette: recently opened files ───

export const recentFiles: { name: string; dir: string; kind: Lang }[] = [
  { name: 'settings.json', dir: '~/Library/Application Support/Cortex Code/User', kind: 'json' },
  { name: 'orders.sql', dir: 'tasty_bytes_dbt_demo/models/marts', kind: 'sql' },
  { name: 'customer_loyalty_metrics.sql', dir: 'tasty_bytes_dbt_demo/models/marts', kind: 'sql' },
  { name: 'profiles.yml', dir: 'tasty_bytes_dbt_demo', kind: 'yaml' },
  { name: 'dbt_project.yml', dir: 'tasty_bytes_dbt_demo', kind: 'yaml' },
  {
    name: 'source_is_positive_amount_tb_101_ORDER_HEADER_ORDER_TOTAL.sql',
    dir: 'tasty_bytes_dbt_demo/target/compiled',
    kind: 'sql',
  },
  {
    name: 'source_not_null_tb_101_FRANCHISE_FIRST_NAME.sql',
    dir: 'tasty_bytes_dbt_demo/target/compiled',
    kind: 'sql',
  },
  {
    name: 'source_is_positive_amount_tb_101_MENU_SALE_PRICE_USD.sql',
    dir: 'tasty_bytes_dbt_demo/target/compiled',
    kind: 'sql',
  },
]
