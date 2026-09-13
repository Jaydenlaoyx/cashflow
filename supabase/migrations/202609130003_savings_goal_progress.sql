create or replace function public.get_savings_goal_progress()
returns table (
  goal_id uuid,
  goal_name text,
  target_amount numeric,
  initial_amount numeric,
  contribution_total numeric,
  current_amount numeric,
  remaining_amount numeric,
  percentage_complete numeric,
  target_date date,
  color text,
  is_completed boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    goal.id,
    goal.name,
    goal.target_amount,
    goal.initial_amount,
    coalesce(contribution.total, 0),
    goal.initial_amount + coalesce(contribution.total, 0),
    greatest(
      goal.target_amount -
        goal.initial_amount -
        coalesce(contribution.total, 0),
      0
    ),
    round(
      least(
        (
          (
            goal.initial_amount +
            coalesce(contribution.total, 0)
          ) / goal.target_amount
        ) * 100,
        100
      ),
      1
    ),
    goal.target_date,
    goal.color,
    goal.is_completed

  from public.savings_goals goal

  left join lateral (
    select sum(item.amount) as total
    from public.goal_contributions item
    where item.goal_id = goal.id
      and item.user_id = goal.user_id
  ) contribution on true

  where goal.user_id = (select auth.uid())

  order by
    goal.is_completed,
    goal.target_date nulls last,
    goal.created_at;
$$;

revoke all
on function public.get_savings_goal_progress()
from public, anon;

grant execute
on function public.get_savings_goal_progress()
to authenticated;