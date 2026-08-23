alter table public.bookings
  add column if not exists payment_method text not null default 'cash'
  check (payment_method in ('cash', 'gcash'));

drop index if exists public.bookings_active_appointment_idx;

create unique index if not exists bookings_active_appointment_idx
  on public.bookings (appointment_date, appointment_time)
  where status in ('pending', 'paid');

create or replace function public.get_unavailable_times(requested_date date)
returns table (appointment_time time)
language sql
stable
security definer
set search_path = public
as $$
  select b.appointment_time
  from public.bookings b
  where b.appointment_date = requested_date
    and b.status in ('pending', 'paid');
$$;

revoke all on function public.get_unavailable_times(date) from public;
grant execute on function public.get_unavailable_times(date) to anon, authenticated;

drop function if exists public.create_booking(text, text, text, text, text, jsonb, jsonb, date, time, numeric);

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
  booking_total numeric,
  booking_payment_method text
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

  if booking_payment_method not in ('cash', 'gcash') then
    raise exception 'A valid payment method is required';
  end if;

  insert into public.bookings (
    reference, customer_name, customer_phone, customer_email, customer_notes,
    package, addons, appointment_date, appointment_time, total_amount, payment_method
  ) values (
    booking_reference, trim(booking_customer_name), trim(booking_customer_phone),
    nullif(trim(booking_customer_email), ''), nullif(trim(booking_customer_notes), ''),
    booking_package, coalesce(booking_addons, '[]'::jsonb), booking_date, booking_time, booking_total,
    booking_payment_method
  ) returning id into new_booking_id;

  return new_booking_id;
end;
$$;

revoke all on function public.create_booking(text, text, text, text, text, jsonb, jsonb, date, time, numeric, text) from public;
grant execute on function public.create_booking(text, text, text, text, text, jsonb, jsonb, date, time, numeric, text) to anon, authenticated;
