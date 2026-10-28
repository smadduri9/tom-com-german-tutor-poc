-- Rows are written only by the tutor function (service role); no policies, so app users cannot read or write them.
create table tutor_usage (id bigserial primary key, user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now());
alter table tutor_usage enable row level security;
create index tutor_usage_user_day on tutor_usage (user_id, created_at);
