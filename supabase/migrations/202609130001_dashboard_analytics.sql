-- Aggregate dashboard totals for the authenticated user.

create or replace function public.get_dashboard_summary(
  p_period_start date,
  p_period_end date
)
returns table (
  currency_code text,
  current_balance numeric,
  period_income numeric,
  period_expenses numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    profile.currency_code,

    coalesce(
      (
        select sum(account.starting_balance)
        from public.accounts account
        where account.user_id = (select auth.uid())
          and account.include_in_total = true
          and account.is_archived = false
      ),
      0
    )
    +
    coalesce(
      (
        select sum(
          case
            when transaction.type = 'income'
              then transaction.amount
            else -transaction.amount
          end
        )
        from public.transactions transaction
        join public.accounts account
          on account.id = transaction.account_id
          and account.user_id = transaction.user_id
        where transaction.user_id = (select auth.uid())
          and account.include_in_total = true
          and account.is_archived = false
      ),
      0
    ) as current_balance,

    coalesce(
      (
        select sum(transaction.amount)
        from public.transactions transaction
        where transaction.user_id = (select auth.uid())
          and transaction.type = 'income'
          and transaction.transaction_date >= p_period_start
          and transaction.transaction_date <= p_period_end
      ),
      0
    ) as period_income,

    coalesce(
      (
        select sum(transaction.amount)
        from public.transactions transaction
        where transaction.user_id = (select auth.uid())
          and transaction.type = 'expense'
          and transaction.transaction_date >= p_period_start
          and transaction.transaction_date <= p_period_end
      ),
      0
    ) as period_expenses

  from public.profiles profile
  where profile.id = (select auth.uid());
$$;

-- Return one income/expense row for each month in the requested range.
-- generate_series ensures months with no activity still return zero.

create or replace function public.get_monthly_cash_flow(
  p_start_month date,
  p_end_month date
)
returns table (
  month_start date,
  income numeric,
  expenses numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  with months as (
    select generate_series(
      date_trunc('month', p_start_month::timestamp),
      date_trunc('month', p_end_month::timestamp),
      interval '1 month'
    )::date as month_start
  )
  select
    month.month_start,

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

  from months month

  left join public.transactions transaction
    on transaction.user_id = (select auth.uid())
    and transaction.transaction_date >= month.month_start
    and transaction.transaction_date
      < (month.month_start + interval '1 month')::date

  group by month.month_start
  order by month.month_start;
$$;

-- Return current-period expense totals grouped by category.

create or replace function public.get_spending_by_category(
  p_period_start date,
  p_period_end date
)
returns table (
  category_id uuid,
  category_name text,
  category_color text,
  total numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    category.id,
    category.name,
    category.color,
    sum(transaction.amount) as total

  from public.transactions transaction

  join public.categories category
    on category.id = transaction.category_id
    and category.user_id = transaction.user_id

  where transaction.user_id = (select auth.uid())
    and transaction.type = 'expense'
    and transaction.transaction_date >= p_period_start
    and transaction.transaction_date <= p_period_end

  group by
    category.id,
    category.name,
    category.color

  order by total desc;
$$;

revoke all
on function public.get_dashboard_summary(date, date)
from public, anon;

revoke all
on function public.get_monthly_cash_flow(date, date)
from public, anon;

revoke all
on function public.get_spending_by_category(date, date)
from public, anon;

grant execute
on function public.get_dashboard_summary(date, date)
to authenticated;

grant execute
on function public.get_monthly_cash_flow(date, date)
to authenticated;

grant execute
on function public.get_spending_by_category(date, date)
to authenticated;