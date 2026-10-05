-- ===== supabase-setup.sql =====
-- Paste this WHOLE file into Supabase: SQL Editor -> New query -> Run.
-- It creates our table, the safety rules, and the staff buttons.

-- ---------------------------------------------------------------
-- 1. THE TABLE (think of it as a spreadsheet; each row = one person)
-- ---------------------------------------------------------------
create table queue (
  number     int generated always as identity primary key,  -- 1, 2, 3 ... given by the database (never duplicates)
  name       text not null check (char_length(name) between 1 and 50),
  service    text not null check (char_length(service) <= 50),
  people     int  not null default 1 check (people between 1 and 10),
  appt_date  text,
  appt_time  text,
  priority   boolean not null default false,                -- true = senior / PWD / pregnant
  status     text not null default 'waiting'
             check (status in ('waiting', 'serving', 'done')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 2. SAFETY RULES (Row Level Security)
-- Anyone using the website can READ the queue and ADD a booking.
-- Nobody can edit or delete directly from the website.
-- Changes are only allowed through the staff functions below (they need the PIN).
-- ---------------------------------------------------------------
alter table queue enable row level security;

create policy "anyone can read the queue"
  on queue for select using (true);

create policy "anyone can book (only as waiting)"
  on queue for insert with check (status = 'waiting');

-- ---------------------------------------------------------------
-- 3. THE STAFF PIN (stored in the database, NOT in the website code)
-- No policy is created for this table, so the website cannot read it.
-- To change the PIN later:  update staff_settings set pin = 'newpin' where id = 1;
-- ---------------------------------------------------------------
create table staff_settings (
  id  int primary key,
  pin text not null
);
alter table staff_settings enable row level security;

insert into staff_settings (id, pin) values (1, '1234');   -- CHANGE 1234 to your own PIN!

-- ---------------------------------------------------------------
-- 4. STAFF FUNCTIONS (the website calls these; each one checks the PIN first)
-- ---------------------------------------------------------------

-- Is this PIN correct?  Returns true or false.
create or replace function check_pin(p_pin text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from staff_settings where id = 1 and pin = p_pin);
$$;

-- Finish the person being served.
create or replace function finish_current(p_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not check_pin(p_pin) then
    raise exception 'Wrong PIN';
  end if;

  update queue set status = 'done' where status = 'serving';
end;
$$;

-- Finish the current person, then serve the next one.
-- "Next" = priority people first, then the smallest number.
create or replace function call_next(p_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not check_pin(p_pin) then
    raise exception 'Wrong PIN';
  end if;

  update queue set status = 'done' where status = 'serving';

  update queue set status = 'serving'
  where number = (
    select number from queue
    where status = 'waiting'
    order by priority desc, number asc
    limit 1
  );
end;
$$;

-- Delete everyone and start numbering again at 1.
create or replace function clear_all(p_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not check_pin(p_pin) then
    raise exception 'Wrong PIN';
  end if;

  delete from queue where true;
  alter table queue alter column number restart with 1;
end;
$$;

-- ---------------------------------------------------------------
-- 5. LIVE UPDATES: tell Supabase to announce every change in this table
-- ---------------------------------------------------------------
alter publication supabase_realtime add table queue;
