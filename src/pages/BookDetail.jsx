import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Hexagon, Star, ArrowLeft, Users, Plus, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getBookDetails, saveProgress, upsertLibraryItem, voteForBook } from '../lib/supabaseData';

const BookDetail = ({ profile }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  async function handleSaveChapterProgress(chapter) {
    if (!profile) {
      setError('Sign in to save listening progress.');
      return;
    }

    try {
      await saveProgress(profile.id, chapter.id, 60, false);
      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
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
    <div className="pb-24">
      {error && (
        <div className="mx-6 mt-6 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      )}

      <section className="relative h-[50vh] md:h-[60vh] w-full">
        <div className="absolute inset-0 overflow-hidden">
          <img src={book.cover} alt="Background" className="w-full h-full object-cover blur-3xl opacity-30 scale-110" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-parchment dark:from-midnight via-parchment/80 dark:via-midnight/80 to-transparent" />

        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
          <button onClick={() => navigate(-1)} className="p-2 glass-pill hover:bg-black/10 dark:hover:bg-white/10 text-midnight dark:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:px-12 flex flex-col md:flex-row items-end gap-8 z-10">
          <motion.img
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            src={book.cover}
            alt="Cover"
            className="w-48 md:w-64 aspect-[2/3] object-cover rounded-2xl shadow-2xl shadow-black/50 border border-black/10 dark:border-white/10"
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex-1 space-y-4"
          >
            <div className="inline-flex items-center gap-2 bg-white/50 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-xs font-semibold text-midnight dark:text-white">{book.listeners} {t('listening_now')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-midnight dark:text-white leading-tight">{book.title}</h1>
            <p className="text-xl text-midnight/80 dark:text-parchment/80">{book.author}</p>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
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
              </div>
              <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
              <div className="flex items-center gap-1.5 text-midnight dark:text-parchment font-semibold text-lg">
                <Star className="w-6 h-6 fill-honey text-honey" />
                {book.rating.toFixed(1)}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 md:px-12 pt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-10">
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 bg-forest hover:bg-forest/90 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-forest/20">
              <Play className="w-6 h-6 fill-white" /> {t('play_sample')}
            </button>
            <button
              type="button"
              onClick={handleSaveToLibrary}
              className="px-6 glass-card hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Plus className="w-6 h-6 text-midnight dark:text-white" />
            </button>
          </div>

          <div>
            <h3 className="text-xl font-bold text-midnight dark:text-white mb-3">{t('about_book')}</h3>
            <p className="text-midnight/70 dark:text-parchment/70 leading-relaxed text-lg">{book.description}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-midnight dark:text-white">{t('chapters')}</h3>
              <span className="text-sm text-forest font-semibold">{book.chapters.length} chapters</span>
            </div>
            <div className="space-y-3">
              {book.chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between p-4 glass-card hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleSaveChapterProgress(chapter)}
                      className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors"
                    >
                      {chapter.isFree ? <Play className="w-4 h-4 ml-0.5 text-midnight dark:text-white group-hover:text-white" /> : <Lock className="w-4 h-4 text-midnight dark:text-white group-hover:text-white" />}
                    </button>
                    <div>
                      <h4 className="font-semibold text-midnight dark:text-parchment group-hover:text-forest transition-colors">{chapter.title}</h4>
                      <p className="text-sm text-midnight/50 dark:text-parchment/50">{chapter.duration}</p>
                      {chapter.summary && <p className="text-xs text-midnight/50 dark:text-parchment/50 mt-1">{chapter.summary}</p>}
                    </div>
                  </div>
                  {!chapter.isFree && <span className="text-xs font-semibold px-2 py-1 bg-lavender/20 text-lavender rounded-full">{t('premium')}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 border border-black/10 dark:border-white/10">
              <img src={book.cover} alt="Author" className="w-full h-full object-cover" />
            </div>
            <h4 className="text-xl font-bold text-midnight dark:text-white mb-1">{book.author}</h4>
            <p className="text-sm text-midnight/60 dark:text-parchment/60 mb-4">{book.genre}</p>
            <button className="w-full py-2 rounded-full border border-forest text-forest font-semibold hover:bg-forest hover:text-white transition-colors">
              {t('follow_author')}
            </button>
          </div>

          <div className="glass-card p-6">
            <h4 className="font-bold text-midnight dark:text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-sky" /> {t('co_listen')}
            </h4>
            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-midnight dark:text-white">{book.title} Club</p>
                <p className="text-xs text-midnight/50 dark:text-parchment/50">{book.listeners} active listeners</p>
              </div>
              <div className="px-3 py-1 bg-sky text-white text-xs font-bold rounded-full">Live</div>
            </div>
            <button className="w-full py-2 text-sm text-midnight/70 dark:text-parchment/70 font-semibold hover:text-midnight dark:hover:text-white transition-colors">
              {t('create_room')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookDetail;
