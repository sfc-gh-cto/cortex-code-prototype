import { GitBranch, RefreshCw, CircleX, TriangleAlert, Bell } from 'lucide-react'

function Segment({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center gap-1 px-2 hover:bg-white/10 ${className}`}>{children}</div>
  )
}

export function StatusBar() {
  return (
    <div className="flex h-[22px] shrink-0 items-center justify-between bg-chrome-bg text-[11px] text-text-muted">
      <div className="flex h-full items-center">
        <Segment>
          <GitBranch size={12} />
          <span>main*</span>
          <RefreshCw size={11} />
        </Segment>
        <Segment>
          <CircleX size={12} />
          <span>0</span>
          <TriangleAlert size={12} />
          <span>0</span>
        </Segment>
      </div>
      <div className="flex h-full items-center">
        <Segment>Ln 6, Col 2</Segment>
        <Segment>Spaces: 4</Segment>
        <Segment>UTF-8</Segment>
        <Segment>LF</Segment>
        <Segment>{'{ }'} JSON with Comments</Segment>
        <Segment>
          <Bell size={12} />
        </Segment>
      </div>
    </div>
  )
}
