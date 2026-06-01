# Cortex Code Desktop Prototype

A pixel-accurate, dependency-light mock of the **Cortex Code Desktop** UI (code-oss / VS Code based), built to prototype the dbt-on-Cortex experience.

No Stellar / StyleX — just Vite + React + Tailwind, so it publishes anywhere.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- lucide-react for icons

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview
```

## What's mocked

A full VS Code-style shell:

- **Title bar** — connection menu, Update Now, command bar, Agent/Editor toggle
- **Activity bar** — switches the sidebar view
- **Sidebar views** — Explorer (default), Search, Source Control (with commit graph), Snowflake Catalog
- **Editor** — file tabs, breadcrumb, syntax-highlighted `settings.json`
- **Bottom panel** — all 6 tabs: Problems, Output, Terminal, SQL Results, **DBT**, Ports
  - The **DBT** tab opens on the **Lineage** sub-tab (dbt DAG) and includes Output (with error states), Docs, and Compiled
- **SESSION panel** — the Cortex AI assistant conversation + input bar
- **Status bar**

Interactivity is intentionally light: activity bar switches sidebar views, bottom-panel and DBT sub-tabs switch, and the lineage nodes are selectable. Everything else is a static visual mock.

## Structure

```
src/
├── components/
│   ├── Shell.tsx            # root layout
│   ├── TitleBar.tsx
│   ├── ActivityBar.tsx
│   ├── StatusBar.tsx
│   ├── Sidebar.tsx
│   ├── EditorPane.tsx
│   ├── SessionPanel.tsx
│   ├── FileIcon.tsx
│   ├── sidebar/            # Explorer, Search, SourceControl, Catalog views
│   └── bottom/             # the 6 bottom-panel tabs + LineageGraph
└── data/mockData.ts         # file tree, catalog, commits, chat, lineage, logs
```
