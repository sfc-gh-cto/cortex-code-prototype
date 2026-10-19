// Compiled SQL per model — what Snowflake actually executes once dbt resolves
// {{ ref }} / {{ source }} to fully-qualified relations and expands macros, then
// wraps the model in the materialization DDL for the target.

const COMPILED: Record<string, string> = {
  orders: `create or replace transient table TASTY_BYTES_PROD.ANALYTICS.ORDERS
cluster by (order_date)
as (

with orders as (

    select * from TASTY_BYTES_PROD.ANALYTICS.STG_ORDERS

),

customers as (

    select * from TASTY_BYTES_PROD.ANALYTICS.STG_CUSTOMERS

),

order_items as (

    select * from TASTY_BYTES_PROD.ANALYTICS.ORDER_ITEMS

),

final as (

    select
        orders.order_id,
        orders.customer_id,
        customers.customer_name,
        orders.order_date,
        orders.location_id,
        sum(order_items.quantity) as item_count,
        round( (sum(order_items.gross_amount)) / 100.0, 2 ) as order_total
    from orders
    left join customers on orders.customer_id = customers.customer_id
    left join order_items on orders.order_id = order_items.order_id
    group by 1, 2, 3, 4, 5

)

select * from final

);`,

  customers: `create or replace transient table TASTY_BYTES_PROD.ANALYTICS.CUSTOMERS
as (

with customers as (

    select * from TASTY_BYTES_PROD.ANALYTICS.STG_CUSTOMERS

),

orders as (

    select * from TASTY_BYTES_PROD.ANALYTICS.ORDERS

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

);`,

  order_items: `create or replace transient table TASTY_BYTES_PROD.ANALYTICS.ORDER_ITEMS
as (

select
    order_detail_id as order_item_id,
    order_id,
    menu_item_id,
    quantity,
    unit_price,
    quantity * unit_price as gross_amount
from TASTY_BYTES_PROD.RAW_POS.ORDER_DETAIL

);`,

  stg_orders: `create or replace view TASTY_BYTES_PROD.ANALYTICS.STG_ORDERS
as (

with source as (

    select * from TASTY_BYTES_PROD.RAW_POS.ORDER_HEADER

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

);`,

  stg_customers: `create or replace view TASTY_BYTES_PROD.ANALYTICS.STG_CUSTOMERS
as (

with source as (

    select * from TASTY_BYTES_PROD.RAW_CUSTOMER.CUSTOMER_LOYALTY

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

);`,
}

export function compiledSql(model: string): string {
  return (
    COMPILED[model] ??
    `-- Compiled SQL for ${model} is not available in this mock.\n-- Run \`dbt: Compile Model\` to generate it.`
  )
}
