// Snowflake catalog shown in the dbt view container's "Snowflake Catalog"
// section — database → schema → object, browsed like an object explorer.

export type CatalogKind = 'database' | 'schema' | 'table' | 'view'

export type CatalogNode = {
  id: string
  name: string
  kind: CatalogKind
  children?: CatalogNode[]
  defaultOpen?: boolean
}

export const catalog: CatalogNode[] = [
  {
    id: 'TASTY_BYTES_PROD',
    name: 'TASTY_BYTES_PROD',
    kind: 'database',
    defaultOpen: true,
    children: [
      {
        id: 'TASTY_BYTES_PROD.ANALYTICS',
        name: 'ANALYTICS',
        kind: 'schema',
        defaultOpen: true,
        children: [
          { id: 'tb.analytics.orders', name: 'ORDERS', kind: 'table' },
          { id: 'tb.analytics.customers', name: 'CUSTOMERS', kind: 'table' },
          { id: 'tb.analytics.order_items', name: 'ORDER_ITEMS', kind: 'table' },
          { id: 'tb.analytics.daily_sales', name: 'DAILY_SALES', kind: 'view' },
        ],
      },
      {
        id: 'TASTY_BYTES_PROD.RAW_POS',
        name: 'RAW_POS',
        kind: 'schema',
        children: [
          { id: 'tb.raw_pos.order_header', name: 'ORDER_HEADER', kind: 'table' },
          { id: 'tb.raw_pos.order_detail', name: 'ORDER_DETAIL', kind: 'table' },
          { id: 'tb.raw_pos.location', name: 'LOCATION', kind: 'table' },
          { id: 'tb.raw_pos.menu', name: 'MENU', kind: 'table' },
        ],
      },
      {
        id: 'TASTY_BYTES_PROD.RAW_CUSTOMER',
        name: 'RAW_CUSTOMER',
        kind: 'schema',
        children: [
          { id: 'tb.raw_customer.customer_loyalty', name: 'CUSTOMER_LOYALTY', kind: 'table' },
        ],
      },
    ],
  },
  {
    id: 'ANALYTICS_PROD',
    name: 'ANALYTICS_PROD',
    kind: 'database',
    children: [
      {
        id: 'ANALYTICS_PROD.DBT_PROD',
        name: 'DBT_PROD',
        kind: 'schema',
        children: [
          { id: 'ap.dbt_prod.fct_orders', name: 'FCT_ORDERS', kind: 'table' },
          { id: 'ap.dbt_prod.dim_customers', name: 'DIM_CUSTOMERS', kind: 'table' },
        ],
      },
      { id: 'ANALYTICS_PROD.FINANCE', name: 'FINANCE', kind: 'schema', children: [] },
    ],
  },
  {
    id: 'ANALYTICS_FOUNDATION_DB',
    name: 'ANALYTICS_FOUNDATION_DB',
    kind: 'database',
    children: [{ id: 'ANALYTICS_FOUNDATION_DB.PROD', name: 'PROD', kind: 'schema', children: [] }],
  },
]
