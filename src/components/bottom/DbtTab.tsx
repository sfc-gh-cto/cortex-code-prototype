import { LineageGraph } from './LineageGraph'

// `project` + `selected` come from the bottom-panel tab bar / the active editor
// file (linked in Shell). `onOpenFile` lets a node double-click open its model.
export function DbtTab({
  project,
  selected,
  onSelect,
  onOpenFile,
}: {
  project: string
  selected: string | null
  onSelect: (nodeId: string) => void
  onOpenFile: (name: string) => void
}) {
  return (
    <LineageGraph
      project={project}
      selected={selected}
      onSelect={onSelect}
      onOpenFile={onOpenFile}
    />
  )
}
