-- ShopWires schema — run this in Supabase SQL editor
create extension if not exists "uuid-ossp";

create table merchants (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid references auth.users(id) on delete cascade not null unique,
  shop_name              text not null default '',
  shop_category          text not null default '',
  phone                  text not null default '',
  address                text,
  keyword                text not null default '',
  twilio_account_sid     text,
  twilio_auth_token      text,
  twilio_phone_number    text,
  plan                   text check (plan in ('starter','growth','pro')),
  stripe_customer_id     text,
  stripe_subscription_id text,
  onboarding_step        integer not null default 1,
  onboarding_complete    boolean not null default false,
  created_at             timestamptz not null default now()
);

create table customers (
  id           uuid primary key default uuid_generate_v4(),
  merchant_id  uuid references merchants(id) on delete cascade not null,
  phone        text not null,
  name         text,
  status       text not null default 'active' check (status in ('active','unsubscribed')),
  opted_in_at  timestamptz not null default now(),
  last_visit   timestamptz,
  visit_count  integer not null default 0,
  birthday     date,
  notes        text,
  created_at   timestamptz not null default now(),
  unique (merchant_id, phone)
);

create table messages_log (
  id                 uuid primary key default uuid_generate_v4(),
  merchant_id        uuid references merchants(id) on delete cascade not null,
  customer_id        uuid references customers(id) on delete set null,
  direction          text not null check (direction in ('inbound','outbound')),
  body               text not null,
  twilio_message_sid text,
  status             text not null default 'sent',
  sent_at            timestamptz not null default now()
);

create table campaigns (
  id            uuid primary key default uuid_generate_v4(),
  merchant_id   uuid references merchants(id) on delete cascade not null,
  name          text not null,
  type          text not null check (type in ('winback','birthday','broadcast','scheduled')),
  trigger_rules jsonb not null default '{}',
  message_body  text not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Row level security
alter table merchants    enable row level security;
alter table customers    enable row level security;
alter table messages_log enable row level security;
alter table campaigns    enable row level security;

create policy "merchants own row"    on merchants    for all using (auth.uid() = user_id);
create policy "customers own"        on customers    for all using (merchant_id in (select id from merchants where user_id = auth.uid()));
create policy "messages_log own"     on messages_log for all using (merchant_id in (select id from merchants where user_id = auth.uid()));
create policy "campaigns own"        on campaigns    for all using (merchant_id in (select id from merchants where user_id = auth.uid()));

-- Indexes
create index on customers    (merchant_id, status);
create index on messages_log (merchant_id, sent_at desc);
create index on campaigns    (merchant_id, active);
