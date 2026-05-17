import { supabase, isSupabaseConfigured } from '../supabaseClient';

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDuration(seconds) {
  const total = Number(seconds) || 0;
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function mapBook(book) {
  if (!book) {
    return null;
  }

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author_name,
    cover: book.cover_url || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    description: book.description || '',
    genre: book.genre,
    isPremium: Boolean(book.is_premium),
    beeScore: book.bee_score ?? 0,
    listeners: book.listener_count ?? 0,
    rating: Number(book.rating ?? 0),
    featured: Boolean(book.featured),
    featuredRank: book.featured_rank,
    isHot: Boolean(book.is_hot),
    chapters: (book.chapters || [])
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        audioUrl: chapter.audio_url,
        summary: chapter.summary || '',
        durationSeconds: chapter.duration_seconds,
        duration: formatDuration(chapter.duration_seconds),
        isFree: Boolean(chapter.is_free),
        orderIndex: chapter.order_index,
      })),
  };
}

function mapProfile(profile) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    displayName: profile.display_name || 'Reader',
    avatarUrl: profile.avatar_url,
    beePoints: profile.bee_points ?? 0,
    streakDays: profile.streak_days ?? 0,
    role: profile.role || 'user',
    createdAt: profile.created_at,
  };
}

async function getSessionProfile() {
  ensureConfigured();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user) {
    return { session: null, profile: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) {
    throw error;
  }

  return { session, profile: mapProfile(data) };
}

async function listBooks(searchQuery = '') {
  ensureConfigured();

  let query = supabase
    .from('books')
    .select('*, chapters(*)')
    .order('featured_rank', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (searchQuery.trim()) {
    const search = searchQuery.trim();
    query = query.or(`title.ilike.%${search}%,author_name.ilike.%${search}%,genre.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(mapBook);
}

async function getHomeFeed() {
  const books = await listBooks();

  return {
    featured: books.filter((book) => book.featured).sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999)),
    trending: books.slice().sort((a, b) => b.beeScore - a.beeScore),
    all: books,
  };
}

async function getBookDetails(bookId) {
  ensureConfigured();

  const { data, error } = await supabase
    .from('books')
    .select('*, chapters(*), votes(value)')
    .eq('id', bookId)
    .single();

  if (error) {
    throw error;
  }

  return mapBook({
    ...data,
    bee_score: data.votes?.reduce((sum, vote) => sum + vote.value, 0) ?? data.bee_score,
  });
}

async function getPublicProfile(username) {
  ensureConfigured();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (profileError) {
    throw profileError;
  }

  const { data: shelf, error: shelfError } = await supabase
    .from('library_items')
    .select('status, book:books(*)')
    .eq('profile_id', profile.id);

  if (shelfError) {
    throw shelfError;
  }

  return {
    profile: mapProfile(profile),
    shelf: shelf.map((item) => ({
      status: item.status,
      book: mapBook(item.book),
    })),
  };
}

async function getMyLibrary(profileId) {
  ensureConfigured();

  const { data, error } = await supabase
    .from('library_items')
    .select('status, book:books(*, chapters(*))')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map((item) => ({
    status: item.status,
    book: mapBook(item.book),
  }));
}

async function upsertLibraryItem(profileId, bookId, status) {
  ensureConfigured();

  const payload = {
    profile_id: profileId,
    book_id: bookId,
    status,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('library_items').upsert(payload, { onConflict: 'profile_id,book_id' });

  if (error) {
    throw error;
  }
}

async function saveProgress(profileId, chapterId, positionSeconds, completed = false) {
  ensureConfigured();

  const payload = {
    profile_id: profileId,
    chapter_id: chapterId,
    position_seconds: Math.max(0, Math.floor(positionSeconds)),
    completed,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('progress').upsert(payload, { onConflict: 'profile_id,chapter_id' });

  if (error) {
    throw error;
  }
}

async function voteForBook(profileId, bookId, value) {
  ensureConfigured();

  const { error } = await supabase.from('votes').upsert(
    {
      profile_id: profileId,
      book_id: bookId,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,book_id' }
  );

  if (error) {
    throw error;
  }
}

async function updateMyProfile(profileId, updates) {
  ensureConfigured();

  const payload = {};

  if (typeof updates.displayName === 'string') {
    payload.display_name = updates.displayName.trim();
  }

  if (typeof updates.username === 'string' && updates.username.trim()) {
    payload.username = slugify(updates.username);
  }

  if (typeof updates.avatarUrl === 'string') {
    payload.avatar_url = updates.avatarUrl;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', profileId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data);
}

async function uploadAvatar(profileId, file) {
  ensureConfigured();

  const extension = file.name.split('.').pop() || 'png';
  const filePath = `${profileId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}

async function createBook(profileId, payload) {
  ensureConfigured();

  const { data, error } = await supabase
    .from('books')
    .insert({
      title: payload.title.trim(),
      slug: slugify(payload.slug || payload.title),
      author_name: payload.author.trim(),
      cover_url: payload.cover.trim(),
      description: payload.description.trim(),
      genre: payload.genre.trim(),
      is_premium: Boolean(payload.isPremium),
      featured: Boolean(payload.featured),
      is_hot: Boolean(payload.isHot),
      created_by: profileId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapBook(data);
}

async function signInWithGoogle() {
  ensureConfigured();

  const redirectTo = window.location.origin;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    throw error;
  }
}

async function signOut() {
  ensureConfigured();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export {
  createBook,
  getBookDetails,
  getHomeFeed,
  getMyLibrary,
  getPublicProfile,
  getSessionProfile,
  listBooks,
  saveProgress,
  signInWithGoogle,
  signOut,
  updateMyProfile,
  uploadAvatar,
  upsertLibraryItem,
  voteForBook,
};
