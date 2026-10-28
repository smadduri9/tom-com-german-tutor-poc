create table profiles (id uuid primary key references auth.users on delete cascade,
  full_name text not null default '', ui_language text not null default 'en' check (ui_language in ('en','te','hi')),
  created_at timestamptz default now());
create table progress (user_id uuid references auth.users on delete cascade, level text not null,
  lesson_slug text not null, lesson_completed boolean not null default false, quiz_score int,
  updated_at timestamptz not null default now(), primary key (user_id, level, lesson_slug));
create table certificates (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade,
  level text not null, score int not null, issued_at timestamptz not null default now(),
  public_slug text unique not null default substr(md5(random()::text), 1, 12), unique (user_id, level));
alter table profiles enable row level security;
alter table progress enable row level security;
alter table certificates enable row level security;
create policy own_profile on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy own_progress on progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_certs on certificates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
