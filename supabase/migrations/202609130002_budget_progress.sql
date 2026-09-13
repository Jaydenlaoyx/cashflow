create or replace function public.get_budget_progress(
  p_month_start date,
  p_month_end date
)
returns table (
  budget_id uuid,
  category_id uuid,
  category_name text,
  category_color text,
  budget_amount numeric,
  spent_amount numeric,
  remaining_amount numeric,
  percentage_used numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    budget.id as budget_id,
    category.id as category_id,
    category.name as category_name,
    category.color as category_color,
    budget.amount as budget_amount,
    coalesce(spending.total, 0) as spent_amount,
    budget.amount - coalesce(spending.total, 0) as remaining_amount,
    case
      when budget.amount > 0 then
        round(
          (coalesce(spending.total, 0) / budget.amount) * 100,
          1
        )
      else 0
    end as percentage_used

  from public.budgets budget

  join public.categories category
    on category.id = budget.category_id
    and category.user_id = budget.user_id

  left join lateral (
    select sum(transaction.amount) as total
    from public.transactions transaction
    where transaction.user_id = budget.user_id
      and transaction.category_id = budget.category_id
      and transaction.type = 'expense'
      and transaction.transaction_date >= p_month_start
      and transaction.transaction_date <= p_month_end
  ) spending on true

  where budget.user_id = (select auth.uid())
    and budget.period = 'monthly'
    and budget.start_date = p_month_start
    and budget.end_date = p_month_end

  order by percentage_used desc, category.name;
$$;

revoke all
on function public.get_budget_progress(date, date)
from public, anon;

grant execute
on function public.get_budget_progress(date, date)
to authenticated;