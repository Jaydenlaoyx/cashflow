-- Calculate the next occurrence while preserving the original
-- day of month where possible.

create or replace function public.calculate_next_recurrence_date(
  p_current_date date,
  p_start_date date,
  p_frequency public.recurrence_frequency
)
returns date
language plpgsql
immutable
set search_path = ''
as $$
declare
  next_month_start date;
  target_month_start date;
  last_day_number integer;
  anchor_day integer;
  target_year integer;
begin
  case p_frequency
    when 'weekly' then
      return p_current_date + 7;

    when 'fortnightly' then
      return p_current_date + 14;

    when 'monthly' then
      next_month_start :=
        (
          date_trunc('month', p_current_date::timestamp)
          + interval '1 month'
        )::date;

      last_day_number :=
        extract(
          day from (
            next_month_start
            + interval '1 month'
            - interval '1 day'
          )
        )::integer;

      anchor_day :=
        extract(day from p_start_date)::integer;

      return next_month_start
        + (least(anchor_day, last_day_number) - 1);

    when 'yearly' then
      target_year :=
        extract(year from p_current_date)::integer + 1;

      target_month_start := make_date(
        target_year,
        extract(month from p_start_date)::integer,
        1
      );

      last_day_number :=
        extract(
          day from (
            target_month_start
            + interval '1 month'
            - interval '1 day'
          )
        )::integer;

      anchor_day :=
        extract(day from p_start_date)::integer;

      return target_month_start
        + (least(anchor_day, last_day_number) - 1);
  end case;

  raise exception 'Unsupported recurrence frequency';
end;
$$;

-- Generate all occurrences due for the current authenticated user.

create or replace function public.process_due_recurring_transactions(
  p_through_date date
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  schedule public.recurring_transactions%rowtype;
  occurrence_date date;
  last_generated date;
  inserted_rows integer;
  generated_count integer := 0;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  for schedule in
    select recurring.*
    from public.recurring_transactions recurring
    where recurring.user_id = (select auth.uid())
      and recurring.is_active = true
      and recurring.next_occurrence <= p_through_date
      and (
        recurring.end_date is null
        or recurring.next_occurrence <= recurring.end_date
      )
    order by recurring.next_occurrence
    for update
  loop
    occurrence_date := schedule.next_occurrence;
    last_generated := schedule.last_generated_date;

    while occurrence_date <= p_through_date
      and (
        schedule.end_date is null
        or occurrence_date <= schedule.end_date
      )
    loop
      insert into public.transactions (
        user_id,
        account_id,
        category_id,
        type,
        amount,
        description,
        merchant,
        transaction_date,
        notes,
        recurring_transaction_id,
        recurrence_date
      )
      values (
        schedule.user_id,
        schedule.account_id,
        schedule.category_id,
        schedule.type,
        schedule.amount,
        schedule.description,
        schedule.merchant,
        occurrence_date,
        schedule.notes,
        schedule.id,
        occurrence_date
      )
      on conflict do nothing;

      get diagnostics inserted_rows = row_count;

      generated_count :=
        generated_count + inserted_rows;

      last_generated := occurrence_date;

      occurrence_date :=
        public.calculate_next_recurrence_date(
          occurrence_date,
          schedule.start_date,
          schedule.frequency
        );
    end loop;

    update public.recurring_transactions
    set
      next_occurrence = occurrence_date,
      last_generated_date = last_generated,
      is_active = case
        when schedule.end_date is not null
          and occurrence_date > schedule.end_date
        then false
        else true
      end
    where id = schedule.id
      and user_id = schedule.user_id;
  end loop;

  return generated_count;
end;
$$;

revoke all
on function public.calculate_next_recurrence_date(
  date,
  date,
  public.recurrence_frequency
)
from public, anon;

revoke all
on function public.process_due_recurring_transactions(date)
from public, anon;

grant execute
on function public.calculate_next_recurrence_date(
  date,
  date,
  public.recurrence_frequency
)
to authenticated;

grant execute
on function public.process_due_recurring_transactions(date)
to authenticated;