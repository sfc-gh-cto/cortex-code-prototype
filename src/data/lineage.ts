// Lineage graph for the tasty_bytes project — powers the Lineage webview.
// Node ids are the model/source name (unique across the project).

export type LineageType = 'source' | 'staging' | 'model' | 'seed'

export type LineageNode = {
  id: string
  name: string
  type: LineageType
  /** fully-qualified Snowflake relation (shown in the node tooltip/subtitle) */
  relation: string
  columns: string[]
}

export type LineageEdge = { from: string; to: string }

export const lineageNodes: LineageNode[] = [
  // sources
  {
    id: 'order_header',
    name: 'order_header',
    type: 'source',
    relation: 'TASTY_BYTES_PROD.RAW_POS.ORDER_HEADER',
    columns: ['ORDER_ID', 'CUSTOMER_ID', 'LOCATION_ID', 'ORDER_TS', 'ORDER_AMOUNT'],
  },
  {
    id: 'order_detail',
    name: 'order_detail',
    type: 'source',
    relation: 'TASTY_BYTES_PROD.RAW_POS.ORDER_DETAIL',
    columns: ['ORDER_DETAIL_ID', 'ORDER_ID', 'MENU_ITEM_ID', 'QUANTITY', 'UNIT_PRICE'],
  },
  {
    id: 'customer_loyalty',
    name: 'customer_loyalty',
    type: 'source',
    relation: 'TASTY_BYTES_PROD.RAW_CUSTOMER.CUSTOMER_LOYALTY',
    columns: ['CUSTOMER_ID', 'FIRST_NAME', 'LAST_NAME', 'CITY', 'COUNTRY', 'SIGN_UP_DATE'],
  },
  {
    id: 'location',
    name: 'location',
    type: 'source',
    relation: 'TASTY_BYTES_PROD.RAW_POS.LOCATION',
    columns: ['LOCATION_ID', 'LOCATION_NAME', 'CITY', 'REGION', 'COUNTRY'],
  },
  // staging
  {
    id: 'stg_orders',
    name: 'stg_orders',
    type: 'staging',
    relation: 'TASTY_BYTES_PROD.ANALYTICS.STG_ORDERS',
    columns: ['ORDER_ID', 'CUSTOMER_ID', 'LOCATION_ID', 'ORDER_DATE', 'ORDER_AMOUNT'],
  },
  {
    id: 'stg_customers',
    name: 'stg_customers',
    type: 'staging',
    relation: 'TASTY_BYTES_PROD.ANALYTICS.STG_CUSTOMERS',
    columns: ['CUSTOMER_ID', 'CUSTOMER_NAME', 'CITY', 'COUNTRY', 'SIGN_UP_DATE'],
  },
  {
    id: 'stg_locations',
    name: 'stg_locations',
    type: 'staging',
    relation: 'TASTY_BYTES_PROD.ANALYTICS.STG_LOCATIONS',
    columns: ['LOCATION_ID', 'LOCATION_NAME', 'CITY', 'REGION', 'COUNTRY'],
  },
  // marts
  {
    id: 'order_items',
    name: 'order_items',
    type: 'model',
    relation: 'TASTY_BYTES_PROD.ANALYTICS.ORDER_ITEMS',
    columns: ['ORDER_ITEM_ID', 'ORDER_ID', 'MENU_ITEM_ID', 'QUANTITY', 'UNIT_PRICE', 'GROSS_AMOUNT'],
  },
  {
    id: 'orders',
    name: 'orders',
    type: 'model',
    relation: 'TASTY_BYTES_PROD.ANALYTICS.ORDERS',
    columns: [
      'ORDER_ID',
      'CUSTOMER_ID',
      'CUSTOMER_NAME',
      'ORDER_DATE',
      'LOCATION_ID',
      'ITEM_COUNT',
      'ORDER_TOTAL',
    ],
  },
  {
    id: 'customers',
    name: 'customers',
    type: 'model',
    relation: 'TASTY_BYTES_PROD.ANALYTICS.CUSTOMERS',
    columns: [
      'CUSTOMER_ID',
      'CUSTOMER_NAME',
      'FIRST_ORDER_DATE',
      'MOST_RECENT_ORDER_DATE',
      'NUMBER_OF_ORDERS',
      'LIFETIME_VALUE',
    ],
  },
]

export const lineageEdges: LineageEdge[] = [
  { from: 'order_header', to: 'stg_orders' },
  { from: 'customer_loyalty', to: 'stg_customers' },
  { from: 'location', to: 'stg_locations' },
  { from: 'order_detail', to: 'order_items' },
  { from: 'stg_orders', to: 'orders' },
  { from: 'stg_customers', to: 'orders' },
  { from: 'order_items', to: 'orders' },
  { from: 'orders', to: 'customers' },
  { from: 'stg_customers', to: 'customers' },
]
