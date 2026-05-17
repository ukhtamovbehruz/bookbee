insert into public.books (
  title,
  slug,
  author_name,
  cover_url,
  description,
  genre,
  is_premium,
  rating,
  featured,
  featured_rank,
  is_hot,
  listener_count
)
values
  (
    'The Midnight Library',
    'the-midnight-library',
    'Matt Haig',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    'Between life and death, Nora discovers an infinite library of possible lives and has to decide what makes a life worth living.',
    'Fantasy',
    false,
    4.8,
    true,
    1,
    true,
    142
  ),
  (
    'Project Hail Mary',
    'project-hail-mary',
    'Andy Weir',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    'A lone astronaut wakes up in deep space with no memory and a mission to save Earth.',
    'Sci-Fi',
    true,
    4.9,
    true,
    2,
    true,
    206
  ),
  (
    'Atomic Habits',
    'atomic-habits',
    'James Clear',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    'A practical system for building good habits and breaking bad ones in a way that actually sticks.',
    'Self-Help',
    false,
    4.7,
    false,
    null,
    false,
    98
  )
on conflict (slug) do nothing;

insert into public.chapters (book_id, title, audio_url, summary, duration_seconds, order_index, is_free)
select
  b.id,
  x.title,
  x.audio_url,
  x.summary,
  x.duration_seconds,
  x.order_index,
  x.is_free
from public.books b
join (
  values
    ('the-midnight-library', 'Chapter 1: The Root Shelf', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'Nora arrives in the library and learns every shelf opens into a different version of her life.', 1220, 1, true),
    ('the-midnight-library', 'Chapter 2: Second Chances', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'Each possible life offers relief at first, but the hidden cost becomes clearer.', 1450, 2, false),
    ('project-hail-mary', 'Chapter 1: Wake Sequence', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'Ryland wakes up alone, confused, and slowly realizes the mission is far bigger than survival.', 1510, 1, true),
    ('atomic-habits', 'Chapter 1: Tiny Changes', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'The compound effect of tiny choices explains why habits shape identity over time.', 980, 1, true)
) as x(slug, title, audio_url, summary, duration_seconds, order_index, is_free)
  on b.slug = x.slug
where not exists (
  select 1
  from public.chapters c
  where c.book_id = b.id and c.order_index = x.order_index
);
