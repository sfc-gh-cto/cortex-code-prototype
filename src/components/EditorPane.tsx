import { X, ChevronRight, SplitSquareHorizontal, MoreHorizontal, Circle } from 'lucide-react'
import { editorTabs, breadcrumb, settingsLines, tokenColors } from '../data/mockData'
import { FileIcon } from './FileIcon'

export function EditorPane() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-editor-bg">
      {/* Tab strip */}
      <div className="flex h-9 shrink-0 items-stretch justify-between bg-chrome-bg">
        <div className="flex items-stretch overflow-x-auto">
          {editorTabs.map((tab) => (
            <div
              key={tab.name}
              className={`group flex h-9 cursor-pointer items-center gap-2 border-r border-border px-3 text-[13px] ${
                tab.active
                  ? 'bg-editor-bg text-text-bright'
                  : 'bg-chrome-bg text-text-muted hover:bg-editor-bg/40'
              }`}
            >
              <FileIcon kind={tab.kind} />
              <span className={`${tab.preview ? 'italic' : ''} ${tab.modified ? 'text-modified' : ''}`}>
                {tab.name}
              </span>
              {tab.modified && (
                <span className="ml-1 text-[10px] text-modified">M</span>
              )}
              {tab.modified ? (
                <Circle size={9} className="ml-1 fill-current text-text" />
              ) : (
                <X
                  size={14}
                  className={`ml-1 rounded hover:bg-hover-bg ${
                    tab.active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pr-3 text-text-muted">
          <ExternalLinkGlyph />
          <SplitSquareHorizontal size={15} className="hover:text-text" />
          <MoreHorizontal size={16} className="hover:text-text" />
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex h-6 shrink-0 items-center gap-0.5 bg-editor-bg px-3 text-[12px] text-text-muted">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb} className="flex items-center gap-0.5">
            {i === breadcrumb.length - 1 && <FileIcon kind="json" />}
            <span className="hover:text-text">{crumb}</span>
            {i < breadcrumb.length - 1 && <ChevronRight size={13} />}
          </span>
        ))}
        <span className="ml-1">···</span>
      </div>

      {/* Code body */}
      <div className="flex min-h-0 flex-1 overflow-auto bg-editor-bg font-mono text-[13px] leading-[20px]">
        {/* gutter */}
        <div className="shrink-0 select-none pt-1 pr-3 pl-3 text-right text-text-dim">
          {settingsLines.map((_, i) => (
            <div key={i} className={i === 5 ? 'text-text' : ''}>
              {i + 1}
            </div>
          ))}
        </div>
        {/* code */}
        <div className="flex-1 pt-1">
          {settingsLines.map((line, i) => (
            <div key={i} className="whitespace-pre px-1">
              {line.map((tok, j) => (
                <span key={j} style={{ color: tokenColors[tok.color] }}>
                  {tok.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ExternalLinkGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" className="hover:text-text">
      <path
        d="M6 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V10M9 2h5v5M13.5 2.5L7 9"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
