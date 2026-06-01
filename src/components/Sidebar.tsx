import type { SidebarView } from './ActivityBar'
import { ExplorerView } from './sidebar/ExplorerView'
import { SearchView } from './sidebar/SearchView'
import { SourceControlView } from './sidebar/SourceControlView'
import { CatalogView } from './sidebar/CatalogView'

export function Sidebar({
  view,
  selectedFile,
  onSelectFile,
}: {
  view: SidebarView
  selectedFile: string
  onSelectFile: (name: string) => void
}) {
  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden bg-chrome-bg">
      {view === 'explorer' && <ExplorerView selected={selectedFile} onSelect={onSelectFile} />}
      {view === 'search' && <SearchView />}
      {view === 'scm' && <SourceControlView />}
      {view === 'catalog' && <CatalogView />}
    </div>
  )
}
