-- Internal trigger functions should not be callable through the API.
revoke execute
on function public.set_updated_at()
from public, anon, authenticated;

-- Keep registration helpers explicitly private.
-- These statements are intentionally repeated to document and preserve
-- the expected permission model.
revoke execute
on function public.handle_new_user()
from public, anon, authenticated;

revoke execute
on function public.seed_user_finance_data(uuid, text, text)
from public, anon, authenticated;