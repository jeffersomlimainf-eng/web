-- 1. Create the Notes table
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null default 'Sem título',
  content text,
  tags text[] default '{}',
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table notes enable row level security;

-- 3. Create Security Policy: User can only see and edit their own notes
create policy "Users can manage their own notes" 
on notes for all 
using (auth.uid() = user_id);

-- 4. Function to automatically update 'updated_at'
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_notes_modtime
    before update on notes
    for each row
    execute procedure update_modified_column();
