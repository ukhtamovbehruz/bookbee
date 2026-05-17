import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronRight, Bookmark, Circle, CircleDot } from 'lucide-react';
import BookCard from '../components/BookCard';
import { useTranslation } from 'react-i18next';
import { getHomeFeed, upsertLibraryItem } from '../lib/supabaseData';

const Home = ({ profile, isBootstrapping }) => {
  const { t } = useTranslation();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [feed, setFeed] = useState({ featured: [], trending: [], all: [] });
  const [error, setError] = useState('');

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (feed.featured.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % feed.featured.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [feed.featured.length]);

  const heroBanners = feed.featured;
  const continueListening = feed.all[0];
  const forYou = feed.all.slice(0, 8);
  const trending = feed.trending.slice(0, 8);

  async function handleSave(bookId) {
    if (!profile) {
      setError('Sign in to save books to your library.');
      return;
    }

    try {
      await upsertLibraryItem(profile.id, bookId, 'want-to-listen');
      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <div className="pb-12 space-y-10">
      {error && (
        <div className="mx-6 mt-6 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      )}

      {!isBootstrapping && heroBanners.length === 0 && (
        <div className="mx-6 mt-6 rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-midnight/70 dark:border-white/10 dark:bg-white/5 dark:text-parchment/70">
          Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, run the SQL in `supabase/schema.sql`, then seed with `supabase/seed.sql`.
        </div>
      )}

      <section className="relative px-4 pt-4">
        {heroBanners.length > 0 ? (
          <div className="relative w-full h-[400px] md:h-[450px] rounded-[2rem] overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img src={heroBanners[currentBanner]?.cover} alt="Featured Book" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-midnight/80 to-honey/40 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3 z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBanner}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="inline-block px-3 py-1 bg-honey/20 border border-honey/30 text-honey rounded-full text-xs font-bold tracking-wide uppercase mb-4 shadow-[0_0_15px_rgba(245,200,66,0.3)]">
                    Featured
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                    {heroBanners[currentBanner]?.title}
                  </h1>
                  <p className="text-lg text-white/80 mb-6">
                    {heroBanners[currentBanner]?.author} • {heroBanners[currentBanner]?.genre}
                  </p>

                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 bg-forest hover:bg-forest/90 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-forest/30">
                      <Play className="w-5 h-5 fill-white" />
                      {t('start_listening')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave(heroBanners[currentBanner]?.id)}
                      className="flex items-center justify-center w-12 h-12 glass-pill hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <Bookmark className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="absolute bottom-6 right-8 flex gap-2 z-10">
              {heroBanners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentBanner(idx)} className="text-white/70 hover:text-white transition-colors">
                  {idx === currentBanner ? <CircleDot className="w-4 h-4 text-honey" /> : <Circle className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-[400px] md:h-[450px] rounded-[2rem] flex items-center justify-center bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <p className="text-midnight/50 dark:text-parchment/50">No featured banners available yet.</p>
          </div>
        )}
      </section>

      <section className="px-6">
        <h2 className="text-xl font-bold text-midnight dark:text-parchment mb-4">{t('continue_listening')}</h2>
        {continueListening ? (
          <div className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors group">
            <img src={continueListening.cover} alt="Cover" className="w-16 h-16 rounded-lg object-cover" />
            <div className="flex-1">
              <h4 className="font-bold text-midnight dark:text-parchment group-hover:text-honey transition-colors">{continueListening.title}</h4>
              <p className="text-sm text-midnight/60 dark:text-parchment/60 mb-2">
                {continueListening.chapters[0]?.title || 'Chapter 1'}
              </p>
              <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal h-full w-[35%] rounded-full shadow-[0_0_10px_rgba(72,219,187,0.5)]" />
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center hover:scale-105 transition-transform shrink-0 shadow-lg shadow-forest/20">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </button>
          </div>
        ) : (
          <div className="glass-card p-6 text-center text-midnight/50 dark:text-parchment/50">
            <p>Nothing currently playing. Seed a few books in Supabase to populate the feed.</p>
          </div>
        )}
      </section>

      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-midnight dark:text-parchment">{t('for_you')}</h2>
          <button className="text-sm text-midnight/50 dark:text-parchment/50 hover:text-honey flex items-center transition-colors">
            {t('see_all')} <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
          {forYou.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-midnight dark:text-parchment">{t('trending')}</h2>
          <button className="text-sm text-midnight/50 dark:text-parchment/50 hover:text-honey flex items-center transition-colors">
            {t('see_all')} <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
          {trending.map((book) => (
            <BookCard key={`trending-${book.id}`} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
