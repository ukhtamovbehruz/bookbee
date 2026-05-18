import { Link } from 'react-router-dom';
import { Hexagon, Flame, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const NavBar = ({ isDark, toggleTheme, changeLanguage, currentLang, profile, session }) => {
  const { t } = useTranslation();
  const exploreHref = session ? '/explore' : '/auth?redirect=%2Fexplore';
  const libraryHref = session ? '/library' : '/auth?redirect=%2Flibrary';

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 mb-2 px-6 py-3 flex items-center justify-between border-b-0 shadow-sm shadow-black/5">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Bookbee Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-tight text-midnight dark:text-parchment">Bookbee</span>
        </Link>
        <div className="hidden md:flex gap-6 font-medium text-midnight/70 dark:text-parchment/70">
          <Link to="/" className="hover:text-honey dark:hover:text-honey transition-colors">{t('home')}</Link>
          <Link to={exploreHref} className="hover:text-honey transition-colors">{t('explore')}</Link>
          <Link to={libraryHref} className="hover:text-honey transition-colors">{t('library')}</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {session && (
          <div className="hidden lg:flex items-center gap-3">
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
        )}

        <div className="flex items-center gap-2 border-l border-black/10 dark:border-white/10 pl-4 ml-2">
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-full p-1">
            {['en', 'ru', 'uz'].map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full transition-colors ${currentLang === lang ? 'bg-forest text-white' : 'text-midnight/50 dark:text-parchment/50 hover:text-midnight dark:hover:text-parchment'}`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button onClick={toggleTheme} className="p-2 text-midnight/70 dark:text-parchment/70 hover:text-midnight dark:hover:text-parchment transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link
            to={session ? '/profile' : '/auth'}
            className="ml-2 rounded-full border border-black/20 dark:border-white/20 px-4 py-2 text-sm font-semibold text-midnight dark:text-parchment hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {session ? profile?.displayName || t('profile') : t('auth_sign_in')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
