import type { FileNode } from '../data/mockData'

// Small colored file-type glyphs that mimic VS Code's seti icon theme.
export function FileIcon({ kind }: { kind?: FileNode['kind'] }) {
  switch (kind) {
    case 'sql':
      // dbt/snowflake-style cyan database glyph
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
          <ellipse cx="8" cy="4" rx="5" ry="2" fill="#4db8c4" />
          <path d="M3 4v8c0 1.1 2.24 2 5 2s5-.9 5-2V4c0 1.1-2.24 2-5 2S3 5.1 3 4z" fill="#4db8c4" opacity="0.65" />
        </svg>
      )
    case 'python':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
          <path d="M8 1.5c-2 0-3 .7-3 2v1.3h3.2v.5H4.2c-1.4 0-2.2 1-2.2 3s.8 3 2.2 3H5V9.8c0-1.4 1-2.3 2.5-2.3h2.8c1.2 0 2-.9 2-2V3.5c0-1.3-1.3-2-3-2zm-1.6 1.2a.7.7 0 110 1.4.7.7 0 010-1.4z" fill="#3b7fb0" />
          <path d="M8 14.5c2 0 3-.7 3-2v-1.3H7.8v-.5h3.9c1.4 0 2.2-1 2.2-3s-.8-3-2.2-3H11v1.3c0 1.4-1 2.3-2.5 2.3H5.7c-1.2 0-2 .9-2 2v2c0 1.3 1.3 2.2 3 2.2zm1.6-1.2a.7.7 0 110-1.4.7.7 0 010 1.4z" fill="#ffd040" />
        </svg>
      )
    case 'yaml':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
          <rect x="2" y="2" width="12" height="12" rx="2" fill="#cb4b3f" opacity="0.25" />
          <text x="8" y="11" textAnchor="middle" fontSize="6" fill="#e06c5d" fontFamily="monospace">{'{}'}</text>
        </svg>
      )
    case 'json':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
          <text x="8" y="12" textAnchor="middle" fontSize="11" fill="#cca700" fontFamily="monospace">{'{}'}</text>
        </svg>
      )
    case 'md':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
          <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" fill="none" stroke="#519aba" strokeWidth="1.2" />
          <path d="M4 10.5V6l2 2 2-2v4.5M11 6v4M9.5 8.5L11 10l1.5-1.5" stroke="#519aba" strokeWidth="1.1" fill="none" />
        </svg>
      )
    case 'license':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
          <path d="M8 1.5l1.8 1.2 2.1-.3.6 2 1.7 1.3-1 1.9 1 1.9-1.7 1.3-.6 2-2.1-.3L8 14.5l-1.8-1.2-2.1.3-.6-2L1.8 10l1-1.9-1-1.9 1.7-1.3.6-2 2.1.3z" fill="#d4b106" opacity="0.85" />
        </svg>
      )
    case 'git':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
          <rect x="2" y="2" width="12" height="12" rx="2" fill="#e8623c" opacity="0.85" />
        </svg>
      )
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
          <path d="M4 2h5l3 3v9H4z" fill="none" stroke="#9d9d9d" strokeWidth="1.1" />
        </svg>
      )
  }
}
