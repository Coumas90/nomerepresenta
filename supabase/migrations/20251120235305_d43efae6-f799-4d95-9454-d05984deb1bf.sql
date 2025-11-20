-- Create enum for user roles
create type public.app_role as enum ('admin', 'user');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz default now() not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create series table
create table public.series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.series enable row level security;

-- Create artworks table
create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references public.series(id) on delete cascade not null,
  title text not null,
  year text not null,
  dimensions text not null,
  technique text not null,
  materials text not null,
  description text not null,
  image_url text not null,
  image_detail_url text not null,
  display_order integer not null default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.artworks enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for user_roles
create policy "Admins can view all roles"
  on public.user_roles for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
  on public.user_roles for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
  on public.user_roles for delete
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for series
create policy "Anyone can view series"
  on public.series for select
  using (true);

create policy "Admins can insert series"
  on public.series for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update series"
  on public.series for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete series"
  on public.series for delete
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for artworks
create policy "Anyone can view artworks"
  on public.artworks for select
  using (true);

create policy "Admins can insert artworks"
  on public.artworks for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update artworks"
  on public.artworks for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete artworks"
  on public.artworks for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add triggers for updated_at
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.series
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.artworks
  for each row execute function public.handle_updated_at();

-- Create trigger function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  
  -- Auto-assign admin role to specific email
  if new.email = 'ivncoms@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin');
  end if;
  
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Insert initial series data
insert into public.series (name, description, display_order) values
('Tri-Peel', 'A series exploring the intersection of geometric forms and organic textures through mixed media', 1);

-- Insert initial artworks data (using the series we just created)
insert into public.artworks (series_id, title, year, dimensions, technique, materials, description, image_url, image_detail_url, display_order)
select 
  s.id,
  'Tri-Peel I',
  '2024',
  '120 x 100 cm',
  'Mixed media on canvas',
  'Acrylic, oil pastels, canvas',
  'The first piece in the Tri-Peel series explores the intersection of geometric forms and organic textures. Through layered application of mixed media, this work creates a dialogue between structure and spontaneity.',
  '/src/assets/tri-peel-1.png',
  '/src/assets/tri-peel-1-detail.jpg',
  1
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel II', '2024', '120 x 100 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas',
  'Building upon the foundational concepts of the series, this piece delves deeper into the relationship between color and form. The layering technique creates depth and movement within a seemingly static composition.',
  '/src/assets/tri-peel-2.png', '/src/assets/tri-peel-1-detail.jpg', 2
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel III', '2024', '120 x 100 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas',
  'The third iteration examines the balance between order and chaos. Through deliberate mark-making and controlled accidents, the work invites contemplation on the nature of creation itself.',
  '/src/assets/tri-peel-3.png', '/src/assets/tri-peel-1-detail.jpg', 3
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel IV', '2024', '150 x 120 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, collage elements',
  'This larger format piece expands the visual language of the series. The introduction of collage elements adds a new dimension to the exploration of texture and layering.',
  '/src/assets/tri-peel-4.jpg', '/src/assets/tri-peel-4.jpg', 4
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel V', '2024', '150 x 120 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, collage elements',
  'Continuing the expanded format, this work explores the tension between fragmentation and unity. Each section speaks its own language while contributing to a cohesive whole.',
  '/src/assets/tri-peel-5.jpg', '/src/assets/tri-peel-5.jpg', 5
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel VI', '2024', '150 x 120 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, spray paint',
  'The introduction of spray paint techniques brings an urban energy to the series. This piece bridges the gap between studio practice and street art aesthetics.',
  '/src/assets/tri-peel-6.jpg', '/src/assets/tri-peel-6.jpg', 6
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel VII', '2024', '180 x 150 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, spray paint',
  'A monumental piece that pushes the boundaries of the series. The scale allows for a more immersive experience, drawing the viewer into its complex layered world.',
  '/src/assets/tri-peel-7.jpg', '/src/assets/tri-peel-7.jpg', 7
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel VIII', '2024', '180 x 150 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, spray paint, charcoal',
  'Charcoal marks add gestural energy to the composition. This piece represents a more expressive turn in the series, embracing spontaneity and raw emotion.',
  '/src/assets/tri-peel-8.jpg', '/src/assets/tri-peel-8.jpg', 8
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel IX', '2024', '180 x 150 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, spray paint, charcoal',
  'This work synthesizes all previous explorations in the series. The convergence of techniques creates a rich, textured surface that rewards close inspection.',
  '/src/assets/tri-peel-9.jpg', '/src/assets/tri-peel-9.jpg', 9
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel X', '2024', '200 x 160 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, spray paint, charcoal, ink',
  'The largest piece in the series represents a culmination of ideas. The addition of ink work adds fine detail that contrasts with the bold gestural marks.',
  '/src/assets/tri-peel-10.jpg', '/src/assets/tri-peel-10.jpg', 10
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel XI', '2024', '200 x 160 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, spray paint, charcoal, ink',
  'This penultimate piece reflects on the journey of the series. It speaks to themes of memory, accumulation, and transformation through its complex layering.',
  '/src/assets/tri-peel-11.jpg', '/src/assets/tri-peel-11.jpg', 11
from public.series s where s.name = 'Tri-Peel'
union all
select 
  s.id, 'Tri-Peel XII', '2024', '200 x 160 cm', 'Mixed media on canvas', 'Acrylic, oil pastels, canvas, spray paint, charcoal, ink',
  'The final piece in the series brings closure while opening new possibilities. It represents both an ending and a beginning, embodying the cyclical nature of artistic practice.',
  '/src/assets/tri-peel-12.jpg', '/src/assets/tri-peel-12.jpg', 12
from public.series s where s.name = 'Tri-Peel';

-- Create storage bucket for artwork images
insert into storage.buckets (id, name, public) 
values ('artwork-images', 'artwork-images', true);

-- Storage policies for artwork-images bucket
create policy "Anyone can view artwork images"
  on storage.objects for select
  using (bucket_id = 'artwork-images');

create policy "Admins can upload artwork images"
  on storage.objects for insert
  with check (bucket_id = 'artwork-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update artwork images"
  on storage.objects for update
  using (bucket_id = 'artwork-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete artwork images"
  on storage.objects for delete
  using (bucket_id = 'artwork-images' and public.has_role(auth.uid(), 'admin'));