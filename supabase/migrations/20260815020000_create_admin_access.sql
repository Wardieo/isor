create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

grant select, update on table public.bookings to authenticated;
grant select, update, delete on table public.reviews to authenticated;

create policy "Admins can read bookings"
  on public.bookings for select to authenticated
  using (public.is_admin());

create policy "Admins can update bookings"
  on public.bookings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can read all reviews"
  on public.reviews for select to authenticated
  using (public.is_admin());

create policy "Admins can update reviews"
  on public.reviews for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins can delete reviews"
  on public.reviews for delete to authenticated
  using (public.is_admin());
