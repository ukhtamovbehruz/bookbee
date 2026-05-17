import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Hexagon, Flame, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const NavBar = ({ isDark, toggleTheme, changeLanguage, currentLang, profilePic, profile, session, isSupabaseConfigured }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/explore?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 mb-2 px-6 py-3 flex items-center justify-between border-b-0">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Bookbee Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-tight text-midnight dark:text-parchment">Bookbee</span>
        </Link>
        <div className="hidden md:flex gap-6 font-medium text-midnight/70 dark:text-parchment/70">
          <Link to="/" className="text-midnight dark:text-parchment hover:text-honey dark:hover:text-honey transition-colors">{t('home')}</Link>
          <Link to="/explore" className="hover:text-honey transition-colors">{t('explore')}</Link>
          <Link to="/library" className="hover:text-honey transition-colors">{t('library')}</Link>
          <Link to="/admin" className="hover:text-honey transition-colors">Admin</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center glass-pill px-4 py-1.5 w-64 focus-within:border-forest/50 focus-within:bg-black/5 dark:focus-within:bg-white/10 transition-all">
          <Search className="w-4 h-4 text-midnight/50 dark:text-parchment/50" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_placeholder')} 
            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-midnight dark:text-parchment placeholder:text-midnight/50 dark:placeholder:text-parchment/50"
          />
        </form>

        {/* Stats */}
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-sm font-semibold"
          >
            <Flame className="w-4 h-4" />
            <span>{profile?.streakDays ?? 0}</span>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender/10 border border-lavender/20 text-lavender text-sm font-semibold"
          >
            <Hexagon className="w-4 h-4" />
            <span>{profile?.beePoints ?? 0}</span>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 border-l border-black/10 dark:border-white/10 pl-4 ml-2">
          {/* Lang */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1">
            {['en', 'ru', 'uz'].map(lang => (
              <button 
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full transition-colors ${currentLang === lang ? 'bg-forest text-white' : 'text-midnight/50 dark:text-parchment/50 hover:text-midnight dark:hover:text-parchment'}`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Theme */}
          <button onClick={toggleTheme} className="p-2 text-midnight/70 dark:text-parchment/70 hover:text-midnight dark:hover:text-parchment transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link to="/profile" className="ml-2 flex items-center gap-2 rounded-full border border-black/20 dark:border-white/20 px-2 py-1 hover:scale-105 transition-transform">
            <span className="hidden lg:block text-xs font-semibold text-midnight/70 dark:text-parchment/70">
              {session ? (profile?.displayName || 'Profile') : (isSupabaseConfigured ? 'Sign in' : 'Configure Supabase')}
            </span>
            <span className="w-8 h-8 rounded-full overflow-hidden block">
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
