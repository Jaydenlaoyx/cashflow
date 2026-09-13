create type public.recurrence_frequency as enum (
  'weekly',
  'fortnightly',
  'monthly',
  'yearly'
);

create table public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  category_id uuid not null,
  type public.transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  description text not null
    check (char_length(trim(description)) between 1 and 150),
  merchant text
    check (
      merchant is null
      or char_length(trim(merchant)) <= 100
    ),
  notes text
    check (
      notes is null
      or char_length(notes) <= 1000
    ),
  frequency public.recurrence_frequency not null,
  start_date date not null,
  next_occurrence date not null,
  end_date date,
  last_generated_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint recurring_valid_date_range
    check (end_date is null or end_date >= start_date),

  constraint recurring_account_owner_fk
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete restrict,

  constraint recurring_category_owner_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict,

  unique (id, user_id)
);

alter table public.recurring_transactions
enable row level security;

-- These columns will let the next checkpoint generate each
-- scheduled occurrence exactly once.

alter table public.transactions
add column recurring_transaction_id uuid,
add column recurrence_date date;

alter table public.transactions
add constraint transactions_recurring_owner_fk
foreign key (recurring_transaction_id, user_id)
references public.recurring_transactions (id, user_id)
on delete set null;

create unique index transactions_recurring_occurrence_unique
on public.transactions (
  recurring_transaction_id,
  recurrence_date
)
where recurring_transaction_id is not null
  and recurrence_date is not null;

create index recurring_user_next_occurrence_idx
on public.recurring_transactions (
  user_id,
  is_active,
  next_occurrence
);

create trigger recurring_transactions_set_updated_at
before update on public.recurring_transactions
for each row execute function public.set_updated_at();

revoke all
on table public.recurring_transactions
from anon, authenticated;

grant select, insert, update, delete
on table public.recurring_transactions
to authenticated;

create policy "Users can view their own recurring transactions"
on public.recurring_transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own recurring transactions"
on public.recurring_transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own recurring transactions"
on public.recurring_transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own recurring transactions"
on public.recurring_transactions
for delete
to authenticated
using ((select auth.uid()) = user_id);