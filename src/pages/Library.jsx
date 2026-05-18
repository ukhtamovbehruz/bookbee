import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Hexagon, Flame, BookOpen, CheckCircle, Clock, Heart } from 'lucide-react';
import BookCard from '../components/BookCard';
import { useTranslation } from 'react-i18next';
import { getMyLibrary } from '../lib/supabaseData';

const Library = ({ profile }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('currently-reading');
  const [libraryItems, setLibraryItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    if (!profile) {
      return undefined;
    }

    getMyLibrary(profile.id)
      .then((data) => {
        if (isActive) {
          setLibraryItems(data);
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
  }, [profile]);

  function BookmarkIcon(props) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    );
  }

  const tabs = [
    { id: 'currently-reading', label: t('reading'), icon: Clock },
    { id: 'finished', label: t('finished'), icon: CheckCircle },
    { id: 'want-to-listen', label: t('want_listen'), icon: BookmarkIcon },
    { id: 'voted', label: t('voted'), icon: Heart },
  ];

  const filteredBooks = useMemo(() => {
    if (activeTab === 'voted') {
      return libraryItems.map((item) => item.book);
    }

    return libraryItems.filter((item) => item.status === activeTab).map((item) => item.book);
  }, [activeTab, libraryItems]);

  if (!profile) {
    return (
      <div className="pb-12 px-6 pt-12">
        <div className="glass-card p-8 text-center text-midnight/70 dark:text-parchment/70">
          <p className="mb-6">{t('dashboard_sign_in_continue')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth" className="px-6 py-3 rounded-xl bg-forest text-white font-bold hover:bg-forest/90 transition-colors">
              {t('auth_sign_in')}
            </Link>
            <Link to="/auth?mode=signup" className="px-6 py-3 rounded-xl border border-forest text-forest font-bold hover:bg-forest/10 transition-colors">
              {t('auth_sign_up')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 space-y-8 px-6 pt-6">
      {error && (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      )}

      <section className="glass-card p-6 flex flex-col md:flex-row items-center md:justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-black/10 dark:border-white/20">
            <img src={profile.avatarUrl || 'https://i.pravatar.cc/150?u=bookbee'} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-midnight dark:text-white mb-1">{profile.displayName}</h1>
            <p className="text-midnight/60 dark:text-parchment/60">@{profile.username} • Member</p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-sm font-semibold">
                <Flame className="w-4 h-4" />
                <span>{profile.streakDays} {t('streak')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20 text-lavender text-sm font-semibold">
                <Hexagon className="w-4 h-4" />
                <span>{profile.beePoints} {t('points')}</span>
              </div>
            </div>
          </div>
        </div>
        <button className="p-3 glass-pill hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <Settings className="w-6 h-6 text-midnight/70 dark:text-parchment/70 hover:text-midnight dark:hover:text-white" />
        </button>
      </section>

      <section>
        <div className="flex gap-2 border-b border-black/10 dark:border-white/10 pb-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-forest text-white shadow-lg shadow-forest/20'
                  : 'text-midnight/60 dark:text-parchment/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-midnight dark:hover:text-parchment'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
        {filteredBooks.length === 0 && (
          <div className="aspect-[2/3] rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-midnight/40 dark:text-parchment/40 hover:bg-black/5 dark:hover:bg-white/5 transition-colors hover:border-black/20 dark:hover:border-white/20 w-48">
            <BookOpen className="w-12 h-12 mb-2 opacity-50" />
            <span className="font-medium">No books here yet</span>
          </div>
        )}
      </section>
    </div>
  );
};

export default Library;
