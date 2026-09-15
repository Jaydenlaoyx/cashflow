alter table public.categories
add column is_archived boolean not null default false,
add column updated_at timestamptz not null default now();

create index categories_user_active_type_idx
on public.categories (
  user_id,
  is_archived,
  type
);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();