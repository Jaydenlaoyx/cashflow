create or replace function public.get_daily_cash_flow(
  p_start_date date,
  p_end_date date
)
returns table (
  activity_date date,
  income numeric,
  expenses numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  with days as (
    select generate_series(
      p_start_date::timestamp,
      p_end_date::timestamp,
      interval '1 day'
    )::date as activity_date
  )
  select
    day.activity_date,

    coalesce(
      sum(transaction.amount)
        filter (where transaction.type = 'income'),
      0
    ) as income,

    coalesce(
      sum(transaction.amount)
        filter (where transaction.type = 'expense'),
      0
    ) as expenses

  from days day

  left join public.transactions transaction
    on transaction.user_id = (select auth.uid())
    and transaction.transaction_date = day.activity_date

  group by day.activity_date
  order by day.activity_date;
$$;

revoke all
on function public.get_daily_cash_flow(date, date)
from public, anon;

grant execute
on function public.get_daily_cash_flow(date, date)
to authenticated;