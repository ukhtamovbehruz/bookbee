import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Hexagon, Star, ArrowLeft, Plus, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getBookDetails, upsertLibraryItem, voteForBook } from '../lib/supabaseData';
import BookInlinePlayer from '../components/BookInlinePlayer';
import { useAudioPlayer } from '../context/AudioPlayerContext.jsx';

const BookDetail = ({ profile }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { playBook } = useAudioPlayer();
  const [book, setBook] = useState(null);
  const [error, setError] = useState('');
  const [selectedVote, setSelectedVote] = useState(null);

  useEffect(() => {
    let isActive = true;

    getBookDetails(id)
      .then((data) => {
        if (isActive) {
          setBook(data);
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
  }, [id]);

  async function handleVote(value) {
    if (!profile || !book) {
      setError('Sign in to vote on books.');
      return;
    }

    try {
      await voteForBook(profile.id, book.id, value);
      setSelectedVote(value);
      const refreshedBook = await getBookDetails(book.id);
      setBook(refreshedBook);
      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  async function handleSaveToLibrary() {
    if (!profile || !book) {
      setError('Sign in to add books to your library.');
      return;
    }

    try {
      await upsertLibraryItem(profile.id, book.id, 'want-to-listen');
      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  function handlePlayChapter(chapter) {
    if (!chapter.isFree) {
      setError('This chapter is premium only.');
      return;
    }

    const started = playBook(book, chapter);
    if (!started) {
      setError('No audio available for this chapter.');
      return;
    }
    setError('');
  }

  if (!book) {
    return (
      <div className="pb-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold text-midnight dark:text-parchment mb-2">Book loading</h2>
          <p className="text-midnight/60 dark:text-parchment/60">{error || 'Fetching live data from Supabase...'}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="pb-12">
      {error && (
        <motion.div className="mx-6 mt-6 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </motion.div>
      )}

      <section className="relative w-full pb-8">
        <motion.div className="absolute inset-0 overflow-hidden min-h-[520px] md:min-h-[480px]">
          <img src={book.cover} alt="Background" className="w-full h-full object-cover blur-3xl opacity-30 scale-110" />
        </motion.div>
        <motion.div className="absolute inset-0 min-h-[520px] md:min-h-[480px] bg-gradient-to-t from-parchment dark:from-midnight via-parchment/80 dark:via-midnight/80 to-transparent" />

        <motion.div className="relative z-10 p-6 md:px-12 pt-6">
          <button onClick={() => navigate(-1)} className="mb-6 p-2 glass-pill hover:bg-black/10 dark:hover:bg-white/10 text-midnight dark:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>

          <motion.div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
            <motion.img
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              src={book.cover}
              alt="Cover"
              className="w-40 md:w-52 lg:w-56 shrink-0 aspect-[2/3] object-cover rounded-2xl shadow-2xl shadow-black/50 border border-black/10 dark:border-white/10 mx-auto lg:mx-0"
            />
            <BookInlinePlayer
              book={book}
              onError={setError}
              onHeard={() => {
                if (profile) {
                  upsertLibraryItem(profile.id, book.id, 'finished').catch((nextError) => setError(nextError.message));
                }
              }}
            />
          </motion.div>

          <motion.div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <motion.div className="inline-flex items-center gap-2 bg-white/50 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-xs font-semibold text-midnight dark:text-white">{book.listeners} {t('listening_now')}</span>
            </motion.div>

            <motion.div className="flex items-center gap-6">
              <motion.div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleVote(1)}
                  className={`transition-colors ${selectedVote === 1 ? 'text-honey' : 'text-midnight/50 dark:text-parchment/50 hover:text-honey'}`}
                >
                  <Hexagon className="w-8 h-8" />
                </button>
                <span className="text-xl font-bold text-honey">{book.beeScore}</span>
                <button
                  type="button"
                  onClick={() => handleVote(-1)}
                  className={`transition-colors rotate-180 ${selectedVote === -1 ? 'text-coral' : 'text-midnight/50 dark:text-parchment/50 hover:text-coral'}`}
                >
                  <Hexagon className="w-8 h-8" />
                </button>
              </motion.div>
              <motion.div className="w-px h-8 bg-black/10 dark:bg-white/10" />
              <motion.div className="flex items-center gap-1.5 text-midnight dark:text-parchment font-semibold text-lg">
                <Star className="w-6 h-6 fill-honey text-honey" />
                {book.rating.toFixed(1)}
              </motion.div>
              <button
                type="button"
                onClick={handleSaveToLibrary}
                className="p-3 glass-card hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-xl"
                aria-label="Add to library"
              >
                <Plus className="w-6 h-6 text-midnight dark:text-white" />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-6 md:px-12 pt-8 max-w-4xl">
        <motion.div className="space-y-10">
          <motion.div>
            <h3 className="text-xl font-bold text-midnight dark:text-white mb-3">{t('about_book')}</h3>
            <p className="text-midnight/70 dark:text-parchment/70 leading-relaxed text-lg">{book.description}</p>
          </motion.div>

          <motion.div>
            <motion.div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-midnight dark:text-white">{t('chapters')}</h3>
              <span className="text-sm text-forest font-semibold">{book.chapters.length} chapters</span>
            </motion.div>
            <motion.div className="space-y-3">
              {book.chapters.map((chapter) => (
                <motion.div
                  key={chapter.id}
                  className="flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <motion.div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => (chapter.isFree ? handlePlayChapter(chapter) : setError('This chapter is premium only.'))}
                      className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors"
                    >
                      {chapter.isFree ? <Play className="w-4 h-4 ml-0.5 text-midnight dark:text-white group-hover:text-white" /> : <Lock className="w-4 h-4 text-midnight dark:text-white group-hover:text-white" />}
                    </button>
                    <motion.div>
                      <h4 className="font-semibold text-midnight dark:text-parchment group-hover:text-forest transition-colors">{chapter.title}</h4>
                      <p className="text-sm text-midnight/50 dark:text-parchment/50">{chapter.duration}</p>
                      {chapter.summary && <p className="text-xs text-midnight/50 dark:text-parchment/50 mt-1">{chapter.summary}</p>}
                    </motion.div>
                  </motion.div>
                  {!chapter.isFree && <span className="text-xs font-semibold px-2 py-1 bg-lavender/20 text-lavender rounded-full">{t('premium')}</span>}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default BookDetail;
