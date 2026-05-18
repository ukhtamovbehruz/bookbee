import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, ChevronRight, Circle, CircleDot, Flame, Hexagon, Library, Play, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BookCard from '../components/BookCard';
import { useAudioPlayer } from '../context/AudioPlayerContext.jsx';
import { getDashboardData, getHomeFeed, upsertLibraryItem } from '../lib/supabaseData';

const guestCards = [
  {
    title: 'Whispering Heights',
    src: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80',
    className: 'left-0 top-12 h-72 w-48 md:h-80 md:w-56',
  },
  {
    title: 'Savanna Light',
    src: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=80',
    className: 'left-24 top-0 z-10 h-80 w-56 md:left-32 md:h-[26rem] md:w-64',
  },
  {
    title: 'Living Echoes',
    src: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=700&q=80',
    className: 'bottom-0 right-0 h-72 w-48 md:h-80 md:w-56',
  },
];

function Home({ session, profile, isBootstrapping, previewData = null }) {
  const { t } = useTranslation();
  const { playBook } = useAudioPlayer();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [feed, setFeed] = useState(previewData?.feed || { featured: [], trending: [], all: [] });
  const [dashboard, setDashboard] = useState(previewData?.dashboard || null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (previewData?.feed) {
      setFeed(previewData.feed);
      return undefined;
    }

    let isActive = true;

    getHomeFeed()
      .then((data) => {
        if (isActive) {
          setFeed(data);
        }
      })
      .catch((nextError) => {
        if (isActive) {
          setError(nextError.message);
        }
      });

    return () => {
      isActive = false;
    };
  }, [previewData]);

  useEffect(() => {
    if (previewData?.dashboard) {
      setDashboard(previewData.dashboard);
      return undefined;
    }

    if (!profile?.id) {
      return undefined;
    }

    let isActive = true;

    getDashboardData(profile.id)
      .then((data) => {
        if (isActive) {
          setDashboard(data);
        }
      })
      .catch((nextError) => {
        if (isActive) {
          setError(nextError.message);
        }
      });

    return () => {
      isActive = false;
    };
  }, [previewData, profile?.id]);

  useEffect(() => {
    if (feed.featured.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % feed.featured.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [feed.featured.length]);

  const isLoggedIn = Boolean(session && profile);
  const activeDashboard = profile?.id ? dashboard : null;
  const continueItem = activeDashboard?.continueListening;
  const featuredBooks = feed.featured;
  const recommendedBooks = feed.trending.slice(0, 8);
  const allBooks = feed.all.slice(0, 8);
  async function handleSave(bookId) {
    if (!profile) {
      setError(t('auth_sign_in_required'));
      return;
    }

    try {
      await upsertLibraryItem(profile.id, bookId, 'want-to-listen');
      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  function handleContinuePlay() {
    if (!continueItem?.book) {
      return;
    }

    playBook(continueItem.book, continueItem.chapter);
  }

  if (isBootstrapping) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pb-12">
        <p className="text-midnight/50 dark:text-parchment/50">{t('dashboard_loading')}</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-10 pb-12">
      {error && (
        <motion.div className="mx-6 mt-6 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </motion.div>
      )}

      {!isLoggedIn ? (
        <>
          <section className="px-4 pt-4 md:px-6">
            <div className="overflow-hidden rounded-[2.5rem] border border-[#efcfc3] bg-[#fff7f2] shadow-[0_30px_90px_rgba(184,111,85,0.16)] dark:border-white/10 dark:bg-[#13232c]">
              <div className="grid gap-10 bg-[radial-gradient(circle_at_top_left,_rgba(223,123,103,0.18),_transparent_26%),linear-gradient(180deg,#fffaf7_0%,#fff4ef_100%)] px-6 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-14 dark:bg-[radial-gradient(circle_at_top_left,_rgba(223,123,103,0.14),_transparent_22%),linear-gradient(180deg,#12212a_0%,#102028_100%)]">
                <div className="flex flex-col justify-center">
                  <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-forest shadow-sm dark:bg-white/10">
                    <Sparkles className="h-4 w-4" />
                    {t('new_release')}
                  </div>
                  <h1 className="max-w-xl text-5xl font-black leading-[1.05] text-[#22485c] dark:text-white md:text-6xl">
                    {t('hero_title_prefix')} <span className="text-forest">{t('hero_title_emphasis')}</span> {t('hero_title_suffix')}
                  </h1>
                  <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f717d] dark:text-parchment/70">
                    {t('hero_subtitle')}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to="/auth?redirect=%2Fexplore"
                      className="rounded-full bg-forest px-7 py-3 font-semibold text-white shadow-xl shadow-forest/20 transition-colors hover:bg-forest/90"
                    >
                      {t('cta_explore')}
                    </Link>
                    <Link
                      to="/auth?mode=signup&redirect=%2Fexplore"
                      className="rounded-full border border-[#dfb3a6] px-7 py-3 font-semibold text-[#a75443] transition-colors hover:bg-white/70 dark:border-white/15 dark:text-parchment dark:hover:bg-white/5"
                    >
                      {t('cta_signup')}
                    </Link>
                  </div>
                </div>

                <div className="relative min-h-[360px]">
                  <div className="absolute left-10 top-8 h-64 w-64 rounded-[2rem] border-[12px] border-[#f1d8d0] dark:border-white/10" />
                  {guestCards.map((card) => (
                    <div key={card.title} className={`absolute overflow-hidden rounded-[1.75rem] shadow-[0_25px_45px_rgba(36,72,92,0.2)] ${card.className}`}>
                      <img src={card.src} alt={card.title} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="px-6 pt-4">
            <div className="glass-card border border-forest/20 bg-gradient-to-br from-forest/10 via-transparent to-honey/10 p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-forest">
                    <Sparkles className="h-4 w-4" />
                    {t('dashboard_welcome')}
                  </div>
                  <h1 className="mb-1 text-3xl font-bold text-midnight dark:text-parchment md:text-4xl">
                    {t('dashboard_hello', { name: profile.displayName })}
                  </h1>
                  <p className="text-midnight/60 dark:text-parchment/60">{t('dashboard_subtitle')}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-black/5 p-4 text-center dark:bg-white/5">
                    <Hexagon className="mx-auto mb-1 h-5 w-5 text-honey" />
                    <p className="text-xl font-bold text-midnight dark:text-parchment">{profile.beePoints}</p>
                    <p className="text-xs text-midnight/50 dark:text-parchment/50">{t('points')}</p>
                  </div>
                  <div className="rounded-2xl bg-black/5 p-4 text-center dark:bg-white/5">
                    <Flame className="mx-auto mb-1 h-5 w-5 text-teal" />
                    <p className="text-xl font-bold text-midnight dark:text-parchment">{profile.streakDays}</p>
                    <p className="text-xs text-midnight/50 dark:text-parchment/50">{t('streak')}</p>
                  </div>
                  <div className="rounded-2xl bg-black/5 p-4 text-center dark:bg-white/5">
                    <Play className="mx-auto mb-1 h-5 w-5 text-lavender" />
                    <p className="text-xl font-bold text-midnight dark:text-parchment">{activeDashboard?.stats.readingCount ?? 0}</p>
                    <p className="text-xs text-midnight/50 dark:text-parchment/50">{t('reading')}</p>
                  </div>
                  <div className="rounded-2xl bg-black/5 p-4 text-center dark:bg-white/5">
                    <Library className="mx-auto mb-1 h-5 w-5 text-sky" />
                    <p className="text-xl font-bold text-midnight dark:text-parchment">{activeDashboard?.stats.libraryCount ?? 0}</p>
                    <p className="text-xs text-midnight/50 dark:text-parchment/50">{t('dashboard_saved')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="relative px-4">
            {featuredBooks.length > 0 ? (
              <div className="relative h-[400px] w-full overflow-hidden rounded-[2rem] md:h-[450px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBanner}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <img src={featuredBooks[currentBanner]?.cover} alt={featuredBooks[currentBanner]?.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-midnight/80 to-honey/40 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-0 left-0 z-10 w-full p-8 md:w-2/3 md:p-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentBanner}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="mb-4 inline-block rounded-full border border-honey/30 bg-honey/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-honey">
                        {t('featured_today')}
                      </div>
                      <h2 className="mb-2 text-4xl font-bold leading-tight text-white md:text-5xl">
                        {featuredBooks[currentBanner]?.title}
                      </h2>
                      <p className="mb-6 text-lg text-white/80">
                        {featuredBooks[currentBanner]?.author} • {featuredBooks[currentBanner]?.genre}
                      </p>
                      <div className="flex gap-4">
                        <Link
                          to={`/book/${featuredBooks[currentBanner]?.id}`}
                          className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 font-semibold text-white shadow-lg shadow-forest/30 transition-colors hover:bg-forest/90"
                        >
                          <Play className="h-5 w-5 fill-white" />
                          {t('start_listening')}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleSave(featuredBooks[currentBanner]?.id)}
                          className="glass-pill flex h-12 w-12 items-center justify-center transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          <Bookmark className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="absolute bottom-6 right-8 z-10 flex gap-2">
                  {featuredBooks.map((book, idx) => (
                    <button key={book.id} onClick={() => setCurrentBanner(idx)} className="text-white/70 transition-colors hover:text-white">
                      {idx === currentBanner ? <CircleDot className="h-4 w-4 text-honey" /> : <Circle className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-[400px] w-full items-center justify-center rounded-[2rem] border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5 md:h-[450px]">
                <p className="text-midnight/50 dark:text-parchment/50">{t('featured_empty')}</p>
              </div>
            )}
          </section>

          <section className="px-6">
            <h2 className="mb-4 text-xl font-bold text-midnight dark:text-parchment">{t('continue_listening')}</h2>
            {continueItem ? (
              <div className="glass-card group flex items-center gap-4 p-4 transition-colors hover:bg-black/5 dark:hover:bg-white/10">
                <Link to={`/book/${continueItem.book.id}`}>
                  <img src={continueItem.book.cover} alt={continueItem.book.title} className="h-16 w-16 rounded-lg object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/book/${continueItem.book.id}`}>
                    <h4 className="truncate font-bold text-midnight transition-colors group-hover:text-honey dark:text-parchment">
                      {continueItem.book.title}
                    </h4>
                  </Link>
                  <p className="mb-2 truncate text-sm text-midnight/60 dark:text-parchment/60">{continueItem.chapter?.title || 'Chapter 1'}</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div className="h-full rounded-full bg-teal shadow-[0_0_10px_rgba(72,219,187,0.5)]" style={{ width: `${continueItem.progressPercent}%` }} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleContinuePlay}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-white shadow-lg shadow-forest/20 transition-transform hover:scale-105"
                >
                  <Play className="ml-0.5 h-5 w-5 fill-white" />
                </button>
              </div>
            ) : (
              <div className="glass-card p-6 text-center text-midnight/50 dark:text-parchment/50">
                <p>{t('dashboard_no_continue')}</p>
              </div>
            )}
          </section>

          {activeDashboard?.libraryPreview?.length > 0 && (
            <section className="px-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-midnight dark:text-parchment">{t('dashboard_your_library')}</h2>
                <Link to="/library" className="flex items-center text-sm text-midnight/50 transition-colors hover:text-honey dark:text-parchment/50">
                  {t('see_all')} <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="scrollbar-hide -mx-6 flex gap-6 overflow-x-auto px-6 pb-4">
                {activeDashboard.libraryPreview.map((item) => (
                  <BookCard key={`library-${item.book.id}`} book={item.book} />
                ))}
              </div>
            </section>
          )}

          <section className="px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-midnight dark:text-parchment">{t('recommended_title')}</h2>
              <Link to="/explore" className="flex items-center text-sm text-midnight/50 transition-colors hover:text-honey dark:text-parchment/50">
                {t('see_all')} <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="scrollbar-hide -mx-6 flex gap-6 overflow-x-auto px-6 pb-4">
              {recommendedBooks.map((book) => (
                <BookCard key={`recommended-${book.id}`} book={book} />
              ))}
            </div>
          </section>

          <section className="px-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-midnight dark:text-parchment">{t('featured_title')}</h2>
              <Link to="/explore" className="flex items-center text-sm text-midnight/50 transition-colors hover:text-honey dark:text-parchment/50">
                {t('see_all')} <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="scrollbar-hide -mx-6 flex gap-6 overflow-x-auto px-6 pb-4">
              {allBooks.map((book) => (
                <BookCard key={`featured-${book.id}`} book={book} />
              ))}
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}

export default Home;
