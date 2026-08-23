create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  description text not null check (char_length(trim(description)) between 3 and 1000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;
grant select, insert on table public.reviews to anon, authenticated;

create policy "Public reviews are readable"
  on public.reviews for select
  to anon, authenticated
  using (is_visible = true);

create policy "Visitors can submit visible reviews"
  on public.reviews for insert
  to anon, authenticated
  with check (
    is_visible = true
    and char_length(trim(name)) between 2 and 80
    and rating between 1 and 5
    and char_length(trim(description)) between 3 and 1000
  );

create index if not exists reviews_visible_created_at_idx
  on public.reviews (created_at desc)
  where is_visible = true;

create or replace function public.get_review_stats()
returns table (review_count bigint, average_rating numeric)
language sql
stable
security definer
set search_path = public
as $$
  select count(*), round(avg(rating), 1)
  from public.reviews
  where is_visible = true;
$$;

revoke all on function public.get_review_stats() from public;
grant execute on function public.get_review_stats() to anon, authenticated;
