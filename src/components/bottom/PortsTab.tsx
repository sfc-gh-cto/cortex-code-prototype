export function PortsTab() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-[13px] text-text-muted">
        No forwarded ports. Forward a port to access your locally running services over the internet.
      </p>
      <button className="rounded bg-accent px-3 py-1 text-[13px] font-medium text-white hover:bg-accent-hover">
        Forward a Port
      </button>
    </div>
  )
}
