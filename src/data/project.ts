// The dbt project shown in the Explorer / dbt view container. Mirrors a standard
// dbt project layout (tasty_bytes demo).

export type GitStatus = 'M' | 'U' | 'A'

export type FileNode = {
  id: string
  name: string
  type: 'folder' | 'file'
  /** file extension drives the icon + language */
  ext?: 'sql' | 'yml' | 'yaml' | 'csv' | 'md' | 'json'
  git?: GitStatus
  children?: FileNode[]
  defaultOpen?: boolean
}

export const PROJECT_NAME = 'tasty_bytes'

export const projectTree: FileNode[] = [
  {
    id: 'models',
    name: 'models',
    type: 'folder',
    defaultOpen: true,
    children: [
      {
        id: 'models/staging',
        name: 'staging',
        type: 'folder',
        defaultOpen: true,
        children: [
          { id: 'models/staging/stg_orders.sql', name: 'stg_orders.sql', type: 'file', ext: 'sql' },
          {
            id: 'models/staging/stg_customers.sql',
            name: 'stg_customers.sql',
            type: 'file',
            ext: 'sql',
          },
          {
            id: 'models/staging/stg_locations.sql',
            name: 'stg_locations.sql',
            type: 'file',
            ext: 'sql',
            git: 'U',
          },
          { id: 'models/staging/_staging.yml', name: '_staging.yml', type: 'file', ext: 'yml' },
        ],
      },
      {
        id: 'models/marts',
        name: 'marts',
        type: 'folder',
        defaultOpen: true,
        children: [
          {
            id: 'models/marts/orders.sql',
            name: 'orders.sql',
            type: 'file',
            ext: 'sql',
            git: 'M',
          },
          { id: 'models/marts/customers.sql', name: 'customers.sql', type: 'file', ext: 'sql' },
          {
            id: 'models/marts/order_items.sql',
            name: 'order_items.sql',
            type: 'file',
            ext: 'sql',
          },
          { id: 'models/marts/_marts.yml', name: '_marts.yml', type: 'file', ext: 'yml' },
        ],
      },
    ],
  },
  {
    id: 'seeds',
    name: 'seeds',
    type: 'folder',
    children: [
      { id: 'seeds/country_codes.csv', name: 'country_codes.csv', type: 'file', ext: 'csv' },
    ],
  },
  {
    id: 'macros',
    name: 'macros',
    type: 'folder',
    children: [
      { id: 'macros/cents_to_dollars.sql', name: 'cents_to_dollars.sql', type: 'file', ext: 'sql' },
    ],
  },
  {
    id: 'tests',
    name: 'tests',
    type: 'folder',
    children: [
      {
        id: 'tests/assert_positive_total.sql',
        name: 'assert_positive_total.sql',
        type: 'file',
        ext: 'sql',
      },
    ],
  },
  { id: 'dbt_project.yml', name: 'dbt_project.yml', type: 'file', ext: 'yml', git: 'M' },
  { id: 'packages.yml', name: 'packages.yml', type: 'file', ext: 'yml' },
  { id: 'README.md', name: 'README.md', type: 'file', ext: 'md' },
]
