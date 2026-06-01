import { useState } from 'react'
import { TitleBar } from './TitleBar'
import { ActivityBar, type SidebarView } from './ActivityBar'
import { Sidebar } from './Sidebar'
import { EditorPane } from './EditorPane'
import { BottomPanel } from './bottom/BottomPanel'
import { SessionPanel } from './SessionPanel'
import { StatusBar } from './StatusBar'
import { ResizeHandle } from './ResizeHandle'

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export function Shell() {
  const [sidebarView, setSidebarView] = useState<SidebarView>('explorer')
  const [selectedFile, setSelectedFile] = useState('profiles.yml')

  // visibility
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [bottomOpen, setBottomOpen] = useState(true)
  const [sessionOpen, setSessionOpen] = useState(true)

  // sizes (px)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [sessionWidth, setSessionWidth] = useState(360)
  const [bottomHeight, setBottomHeight] = useState(300)

  // Clicking the active view toggles the sidebar; a different view switches + opens it.
  function handleSelectView(view: SidebarView) {
    if (view === sidebarView) {
      setSidebarOpen((o) => !o)
    } else {
      setSidebarView(view)
      setSidebarOpen(true)
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-app-bg text-text">
      <TitleBar
        sidebarOpen={sidebarOpen}
        bottomOpen={bottomOpen}
        sessionOpen={sessionOpen}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onToggleBottom={() => setBottomOpen((o) => !o)}
        onToggleSession={() => setSessionOpen((o) => !o)}
      />

      <div className="flex min-h-0 flex-1">
        <ActivityBar active={sidebarOpen ? sidebarView : null} onSelect={handleSelectView} />

        {sidebarOpen && (
          <>
            <div style={{ width: sidebarWidth }} className="flex shrink-0">
              <Sidebar
                view={sidebarView}
                selectedFile={selectedFile}
                onSelectFile={setSelectedFile}
              />
            </div>
            <ResizeHandle
              orientation="x"
              onResize={(d) => setSidebarWidth((w) => clamp(w + d, 170, 560))}
            />
          </>
        )}

        {/* center: editor (top) + bottom panel */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden">
            <EditorPane />
          </div>
          {bottomOpen && (
            <>
              <ResizeHandle
                orientation="y"
                onResize={(d) => setBottomHeight((h) => clamp(h - d, 120, 640))}
              />
              <div style={{ height: bottomHeight }} className="shrink-0 overflow-hidden">
                <BottomPanel onClose={() => setBottomOpen(false)} />
              </div>
            </>
          )}
        </div>

        {sessionOpen && (
          <>
            <ResizeHandle
              orientation="x"
              onResize={(d) => setSessionWidth((w) => clamp(w - d, 280, 640))}
            />
            <div style={{ width: sessionWidth }} className="flex shrink-0">
              <SessionPanel onClose={() => setSessionOpen(false)} />
            </div>
          </>
        )}
      </div>

      <StatusBar />
    </div>
  )
}
