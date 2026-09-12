-- CashFlow initial database schema

create type public.transaction_type as enum (
  'income',
  'expense'
);

create type public.account_type as enum (
  'cash',
  'checking',
  'savings',
  'credit',
  'investment',
  'other'
);

create type public.budget_period as enum (
  'monthly',
  'yearly'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  currency_code text not null default 'AUD'
    check (currency_code ~ '^[A-Z]{3}$'),
  timezone text not null default 'Australia/Melbourne',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  type public.account_type not null default 'checking',
  starting_balance numeric(14, 2) not null default 0,
  include_in_total boolean not null default true,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 50),
  type public.transaction_type not null,
  color text not null default '#64748B'
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon text not null default 'circle',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),

  unique (id, user_id)
);

create unique index categories_user_type_name_unique
  on public.categories (user_id, type, lower(name));

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  category_id uuid not null,
  type public.transaction_type not null,
  amount numeric(14, 2) not null check (amount > 0),
  description text not null
    check (char_length(trim(description)) between 1 and 150),
  merchant text
    check (merchant is null or char_length(trim(merchant)) <= 100),
  transaction_date date not null default current_date,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint transactions_account_owner_fk
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete restrict,

  constraint transactions_category_owner_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete restrict
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  amount numeric(14, 2) not null check (amount > 0),
  period public.budget_period not null default 'monthly',
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint budgets_valid_date_range
    check (end_date >= start_date),

  constraint budgets_category_owner_fk
    foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete cascade,

  unique (user_id, category_id, period, start_date)
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  target_amount numeric(14, 2) not null check (target_amount > 0),
  initial_amount numeric(14, 2) not null default 0
    check (initial_amount >= 0),
  target_date date,
  color text not null default '#059669'
    check (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon text not null default 'target',
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (id, user_id)
);

create table public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  amount numeric(14, 2) not null check (amount > 0),
  contribution_date date not null default current_date,
  notes text check (notes is null or char_length(notes) <= 300),
  created_at timestamptz not null default now(),

  constraint goal_contributions_goal_owner_fk
    foreign key (goal_id, user_id)
    references public.savings_goals (id, user_id)
    on delete cascade
);

-- Query indexes

create index accounts_user_id_idx
  on public.accounts (user_id);

create index categories_user_type_idx
  on public.categories (user_id, type);

create index transactions_user_date_idx
  on public.transactions (user_id, transaction_date desc);

create index transactions_user_type_date_idx
  on public.transactions (user_id, type, transaction_date desc);

create index transactions_account_idx
  on public.transactions (account_id);

create index transactions_category_idx
  on public.transactions (category_id);

create index budgets_user_dates_idx
  on public.budgets (user_id, start_date, end_date);

create index savings_goals_user_idx
  on public.savings_goals (user_id);

create index goal_contributions_goal_date_idx
  on public.goal_contributions (goal_id, contribution_date desc);

-- Automatically maintain updated_at

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

create trigger budgets_set_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

create trigger savings_goals_set_updated_at
before update on public.savings_goals
for each row execute function public.set_updated_at();

-- Create a profile, initial account and categories for each new user

create or replace function public.seed_user_finance_data(
  target_user_id uuid,
  target_display_name text,
  target_email text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name
  )
  values (
    target_user_id,
    coalesce(
      nullif(trim(target_display_name), ''),
      split_part(target_email, '@', 1),
      'CashFlow User'
    )
  )
  on conflict (id) do nothing;

  insert into public.accounts (
    user_id,
    name,
    type,
    starting_balance
  )
  select
    target_user_id,
    'Everyday Account',
    'checking'::public.account_type,
    0
  where not exists (
    select 1
    from public.accounts
    where user_id = target_user_id
  );

  insert into public.categories (
    user_id,
    name,
    type,
    color,
    icon,
    is_default
  )
  values
    (target_user_id, 'Salary',        'income',  '#059669', 'briefcase-business', true),
    (target_user_id, 'Freelance',     'income',  '#0D9488', 'laptop',             true),
    (target_user_id, 'Investment',    'income',  '#2563EB', 'chart-no-axes',      true),
    (target_user_id, 'Other Income',  'income',  '#7C3AED', 'circle-dollar-sign', true),
    (target_user_id, 'Housing',       'expense', '#8B5CF6', 'house',              true),
    (target_user_id, 'Groceries',     'expense', '#F59E0B', 'shopping-basket',    true),
    (target_user_id, 'Dining',        'expense', '#F97316', 'utensils',           true),
    (target_user_id, 'Transport',     'expense', '#3B82F6', 'car',                true),
    (target_user_id, 'Utilities',     'expense', '#06B6D4', 'lightbulb',          true),
    (target_user_id, 'Entertainment', 'expense', '#EC4899', 'popcorn',            true),
    (target_user_id, 'Health',        'expense', '#EF4444', 'heart-pulse',        true),
    (target_user_id, 'Shopping',      'expense', '#A855F7', 'shopping-bag',       true),
    (target_user_id, 'Education',     'expense', '#14B8A6', 'graduation-cap',     true),
    (target_user_id, 'Travel',        'expense', '#0EA5E9', 'plane',              true),
    (target_user_id, 'Other Expense', 'expense', '#64748B', 'circle-ellipsis',    true)
  on conflict do nothing;
end;
$$;

revoke all on function public.seed_user_finance_data(uuid, text, text)
from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.seed_user_finance_data(
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    new.email
  );

  return new;
end;
$$;

revoke all on function public.handle_new_user()
from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Enable Row Level Security

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.goal_contributions enable row level security;

-- Remove public client access, then grant only signed-in access

revoke all on table
  public.profiles,
  public.accounts,
  public.categories,
  public.transactions,
  public.budgets,
  public.savings_goals,
  public.goal_contributions
from anon, authenticated;

grant select, update
on table public.profiles
to authenticated;

grant select, insert, update, delete
on table
  public.accounts,
  public.categories,
  public.transactions,
  public.budgets,
  public.savings_goals,
  public.goal_contributions
to authenticated;

-- Profiles policies

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Accounts policies

create policy "Users can view their own accounts"
on public.accounts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own accounts"
on public.accounts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own accounts"
on public.accounts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own accounts"
on public.accounts
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Categories policies

create policy "Users can view their own categories"
on public.categories
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own categories"
on public.categories
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own categories"
on public.categories
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own categories"
on public.categories
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Transactions policies

create policy "Users can view their own transactions"
on public.transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own transactions"
on public.transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own transactions"
on public.transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own transactions"
on public.transactions
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Budgets policies

create policy "Users can view their own budgets"
on public.budgets
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own budgets"
on public.budgets
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own budgets"
on public.budgets
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own budgets"
on public.budgets
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Savings goals policies

create policy "Users can view their own savings goals"
on public.savings_goals
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own savings goals"
on public.savings_goals
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own savings goals"
on public.savings_goals
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own savings goals"
on public.savings_goals
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Goal contribution policies

create policy "Users can view their own goal contributions"
on public.goal_contributions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own goal contributions"
on public.goal_contributions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own goal contributions"
on public.goal_contributions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own goal contributions"
on public.goal_contributions
for delete
to authenticated
using ((select auth.uid()) = user_id);

-- Backfill finance data for users registered before this migration

select public.seed_user_finance_data(
  id,
  raw_user_meta_data ->> 'display_name',
  email
)
from auth.users;