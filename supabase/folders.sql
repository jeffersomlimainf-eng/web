-- Create folders table
create table folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text,
  parent_id uuid references public.folders(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add folder_id to notes
alter table notes 
add column folder_id uuid references public.folders(id);

-- RLS Policies for folders
alter table folders enable row level security;

create policy "Users can create their own folders"
  on folders for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own folders"
  on folders for select
  using (auth.uid() = user_id);

create policy "Users can update their own folders"
  on folders for update
  using (auth.uid() = user_id);

create policy "Users can delete their own folders"
  on folders for delete
  using (auth.uid() = user_id);

-- Trigger for updating updated_at on folders
create trigger update_folders_modtime
  before update on folders
  for each row execute procedure update_modified_column();
