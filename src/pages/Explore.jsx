import { useEffect, useState } from 'react';
import { Search, Flame, Hexagon, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { listBooks } from '../lib/supabaseData';

const Explore = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    listBooks(searchQuery)
      .then((data) => {
        if (isActive) {
          setBooks(data);
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
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const handleGenreClick = (genre) => {
    setSearchParams({ q: genre });
  };

  const filteredBooks = searchQuery
    ? books
    : books;

  return (
    <div className="pb-12 space-y-10 px-6 pt-6">
      {error && (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      )}

      <section className="text-center space-y-6 max-w-2xl mx-auto pt-8 pb-4">
        <h1 className="text-4xl font-bold text-midnight dark:text-white">{t('what_discover')}</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight/50 dark:text-parchment/50 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('search_placeholder')}
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full py-4 pl-12 pr-6 text-midnight dark:text-parchment placeholder:text-midnight/50 dark:placeholder:text-parchment/50 outline-none focus:border-forest/50 focus:bg-black/10 dark:focus:bg-white/10 transition-all text-lg backdrop-blur-md"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {['Sci-Fi', 'Fantasy', 'Self-Help', 'Thriller', 'Romance'].map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className="px-4 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm text-midnight/80 dark:text-parchment/80"
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {searchQuery ? (
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
            <BookOpen className="w-6 h-6 text-sky" />
            <h2 className="text-xl font-bold text-midnight dark:text-parchment">{t('search_results')} ({filteredBooks.length})</h2>
          </div>

          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-midnight/30 dark:text-parchment/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-midnight dark:text-white mb-2">{t('no_results')}</h3>
              <p className="text-midnight/60 dark:text-parchment/60">{t('no_results_desc')}</p>
            </div>
          )}
        </section>
      ) : (
        <>
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-lavender" />
              <h2 className="text-xl font-bold text-midnight dark:text-parchment">{t('mood_match')}</h2>
            </div>
            <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
              {books.slice(0, 4).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-amber" />
                <h2 className="text-xl font-bold text-midnight dark:text-parchment">{t('top_scores')}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.slice(0, 4).map((book, idx) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/book/${book.id}`)}
                  key={book.id}
                  className="glass-card p-4 flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-8 text-center font-bold text-amber text-xl">#{idx + 1}</div>
                  <img src={book.cover} alt={book.title} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-midnight dark:text-parchment">{book.title}</h4>
                    <p className="text-sm text-midnight/60 dark:text-parchment/60">{book.author}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-honey font-bold">
                      <Hexagon className="w-4 h-4 fill-honey/20" />
                      {book.beeScore}
                    </div>
                    {book.isHot && (
                      <div className="bg-coral text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {t('hot')}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Explore;
