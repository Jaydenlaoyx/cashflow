alter table public.transactions
add column if not exists import_fingerprint text;

create unique index if not exists transactions_user_import_fingerprint_key
on public.transactions (user_id, import_fingerprint)
where import_fingerprint is not null;