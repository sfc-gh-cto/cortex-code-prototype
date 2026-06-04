import type { LineageNode } from './mockData'

// Shared helpers for the read-only Docs view and the AI Docs Editor so both
// describe models/columns consistently.

export function materialization(node: LineageNode): string {
  if (node.type === 'source') return 'source'
  return node.col >= 2 ? 'table' : 'view'
}

export type DocColumn = { name: string; type: string }

export function modelColumns(node: LineageNode): DocColumn[] {
  const entity = node.name.replace(/^(raw_pos_|raw_customer_|stg_)/, '').replace(/s$/, '')
  return [
    { name: `${entity}_id`, type: 'NUMBER' },
    { name: 'name', type: 'VARCHAR' },
    { name: 'created_at', type: 'TIMESTAMP_NTZ' },
    { name: 'updated_at', type: 'TIMESTAMP_NTZ' },
  ]
}

const pretty = (name: string) =>
  name.replace(/^(stg_|raw_pos_|raw_customer_)/, '').replace(/_/g, ' ')

// Model-level description. Used as displayed text in the read view and as the
// "AI"-generated suggestion in the editor.
export function modelDescription(node: LineageNode): string {
  const mat = materialization(node)
  if (node.type === 'source') {
    return `Raw, untransformed ${pretty(node.name)} records as landed from the source system.`
  }
  if (node.col >= 2) {
    return `The ${node.name} ${mat} provides an analytics-ready view of ${pretty(
      node.name,
    )}, joining and aggregating upstream staging models into a single curated dataset for reporting and downstream consumption.`
  }
  return `Staging model that standardizes the raw ${pretty(
    node.name,
  )} feed: columns are renamed, types are cast, and keys are made consistent for downstream models.`
}

// Column-level description.
export function columnDescription(node: LineageNode, col: DocColumn): string {
  if (col.name.endsWith('_id')) {
    return `Unique identifier (primary key) for each ${pretty(node.name)} record.`
  }
  if (col.name === 'created_at') return 'Timestamp when the record was first created.'
  if (col.name === 'updated_at') return 'Timestamp when the record was last modified.'
  if (col.name === 'name') return `Human-readable name for the ${pretty(node.name)}.`
  return `${col.name} attribute of the ${pretty(node.name)} model.`
}
