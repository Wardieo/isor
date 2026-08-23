create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_notes text,
  package jsonb not null,
  addons jsonb not null default '[]'::jsonb,
  appointment_date date not null,
  appointment_time time not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
revoke all on table public.bookings from anon, authenticated;

create unique index if not exists bookings_active_appointment_idx
  on public.bookings (appointment_date, appointment_time)
  where status in ('pending', 'confirmed', 'paid');

create or replace function public.create_booking(
  booking_reference text,
  booking_customer_name text,
  booking_customer_phone text,
  booking_customer_email text,
  booking_customer_notes text,
  booking_package jsonb,
  booking_addons jsonb,
  booking_date date,
  booking_time time,
  booking_total numeric
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_booking_id uuid;
begin
  if length(trim(booking_customer_name)) < 2 or length(trim(booking_customer_phone)) < 7 then
    raise exception 'Valid customer name and phone number are required';
  end if;

  insert into public.bookings (
    reference, customer_name, customer_phone, customer_email, customer_notes,
    package, addons, appointment_date, appointment_time, total_amount
  ) values (
    booking_reference, trim(booking_customer_name), trim(booking_customer_phone),
    nullif(trim(booking_customer_email), ''), nullif(trim(booking_customer_notes), ''),
    booking_package, coalesce(booking_addons, '[]'::jsonb), booking_date, booking_time, booking_total
  ) returning id into new_booking_id;

  return new_booking_id;
end;
$$;

revoke all on function public.create_booking(text, text, text, text, text, jsonb, jsonb, date, time, numeric) from public;
grant execute on function public.create_booking(text, text, text, text, text, jsonb, jsonb, date, time, numeric) to anon, authenticated;
