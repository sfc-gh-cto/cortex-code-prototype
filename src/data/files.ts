// Text content for every file in the sample `tasty_bytes` dbt project, keyed by
// node id. This is a complete, coherent project so the prototype is playable:
// open any file in the tree and you get realistic content.

export const fileContents: Record<string, string> = {
  // ─── models / marts ────────────────────────────────────────────────────────
  'models/marts/orders.sql': `{{
  config(
    materialized = 'table',
    cluster_by = ['order_date']
  )
}}

with orders as (

    select * from {{ ref('stg_orders') }}

),

customers as (

    select * from {{ ref('stg_customers') }}

),

order_items as (

    select * from {{ ref('order_items') }}

),

final as (

    select
        orders.order_id,
        orders.customer_id,
        customers.customer_name,
        orders.order_date,
        orders.location_id,
        sum(order_items.quantity) as item_count,
        {{ cents_to_dollars('sum(order_items.gross_amount)') }} as order_total
    from orders
    left join customers on orders.customer_id = customers.customer_id
    left join order_items on orders.order_id = order_items.order_id
    group by 1, 2, 3, 4, 5

)

select * from final
`,

  'models/marts/customers.sql': `{{ config(materialized = 'table') }}

with customers as (

    select * from {{ ref('stg_customers') }}

),

orders as (

    select * from {{ ref('orders') }}

),

customer_orders as (

    select
        customer_id,
        min(order_date) as first_order_date,
        max(order_date) as most_recent_order_date,
        count(order_id) as number_of_orders,
        sum(order_total) as lifetime_value
    from orders
    group by 1

),

final as (

    select
        customers.customer_id,
        customers.customer_name,
        customer_orders.first_order_date,
        customer_orders.most_recent_order_date,
        coalesce(customer_orders.number_of_orders, 0) as number_of_orders,
        coalesce(customer_orders.lifetime_value, 0) as lifetime_value
    from customers
    left join customer_orders on customers.customer_id = customer_orders.customer_id

)

select * from final
`,

  'models/marts/order_items.sql': `{{ config(materialized = 'table') }}

with order_detail as (

    select * from {{ source('raw_pos', 'order_detail') }}

)

select
    order_detail_id as order_item_id,
    order_id,
    menu_item_id,
    quantity,
    unit_price,
    quantity * unit_price as gross_amount
from order_detail
`,

  'models/marts/_marts.yml': `version: 2

models:
  - name: orders
    description: "One row per order with customer and total."
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
      - name: order_total
        tests:
          - dbt_utils.accepted_range:
              min_value: 0

  - name: customers
    description: "Customer dimension with lifetime value."
    columns:
      - name: customer_id
        tests:
          - unique
          - not_null

  - name: order_items
    description: "One row per line item on an order."
`,

  // ─── models / staging ───────────────────────────────────────────────────────
  'models/staging/stg_orders.sql': `{{ config(materialized = 'view') }}

with source as (

    select * from {{ source('raw_pos', 'order_header') }}

),

renamed as (

    select
        order_id,
        customer_id,
        location_id,
        order_ts::date as order_date,
        order_amount
    from source

)

select * from renamed
`,

  'models/staging/stg_customers.sql': `{{ config(materialized = 'view') }}

with source as (

    select * from {{ source('raw_customer', 'customer_loyalty') }}

),

renamed as (

    select
        customer_id,
        first_name || ' ' || last_name as customer_name,
        city,
        country,
        sign_up_date::date as sign_up_date
    from source

)

select * from renamed
`,

  'models/staging/stg_locations.sql': `{{ config(materialized = 'view') }}

with source as (

    select * from {{ source('raw_pos', 'location') }}

)

select
    location_id,
    location_name,
    city,
    region,
    country
from source
`,

  'models/staging/_staging.yml': `version: 2

sources:
  - name: raw_pos
    database: tasty_bytes
    schema: raw_pos
    tables:
      - name: order_header
      - name: order_detail
      - name: location
      - name: menu

  - name: raw_customer
    database: tasty_bytes
    schema: raw_customer
    tables:
      - name: customer_loyalty

models:
  - name: stg_orders
    columns:
      - name: order_id
        tests: [unique, not_null]
  - name: stg_customers
    columns:
      - name: customer_id
        tests: [unique, not_null]
  - name: stg_locations
`,

  // ─── seeds ──────────────────────────────────────────────────────────────────
  'seeds/country_codes.csv': `country,country_code
United States,US
Canada,CA
United Kingdom,GB
Germany,DE
Japan,JP
Australia,AU
India,IN
Italy,IT
`,

  // ─── macros ───────────────────────────────────────────────────────────────────
  'macros/cents_to_dollars.sql': `{% macro cents_to_dollars(column_name, scale=2) %}
    round( ({{ column_name }}) / 100.0, {{ scale }} )
{% endmacro %}
`,

  // ─── tests ────────────────────────────────────────────────────────────────────
  'tests/assert_positive_total.sql': `-- Fails if any order has a non-positive total.
select
    order_id,
    order_total
from {{ ref('orders') }}
where order_total <= 0
`,

  // ─── project root ────────────────────────────────────────────────────────────
  'dbt_project.yml': `name: 'tasty_bytes'
version: '1.0.0'
config-version: 2

profile: 'tasty_bytes_dbt_demo'

model-paths: ["models"]
seed-paths: ["seeds"]
macro-paths: ["macros"]
test-paths: ["tests"]

models:
  tasty_bytes:
    staging:
      +materialized: view
    marts:
      +materialized: table
`,

  'packages.yml': `packages:
  - package: dbt-labs/dbt_utils
    version: 1.3.0
`,

  'README.md': `# tasty_bytes

A sample dbt project for the Tasty Bytes demo, running on **Snowflake Managed**.

## Models

- \`staging/\` — 1:1 views over raw POS and customer sources
- \`marts/\` — \`orders\`, \`customers\`, and \`order_items\`

## Running

Everything executes in Snowflake via \`EXECUTE DBT PROJECT\`. Use the
**Command Palette** (⌘⇧P → "dbt: Run Model") or the actions at the top right of the editor.
`,
}

export const PLACEHOLDER = '-- (file preview not available in this mock)\n'
