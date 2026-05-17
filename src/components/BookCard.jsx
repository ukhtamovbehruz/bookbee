import { Users, Hexagon, PlayCircle, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <motion.div 
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/book/${book.id}`)}
      className="relative flex-none w-48 group cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-lg shadow-black/40 border border-black/10 dark:border-white/5">
        <img 
          src={book.cover} 
          alt={book.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <PlayCircle className="w-12 h-12 text-white/90" />
        </div>

        {/* Hot Tag */}
        {book.isHot && (
          <div className="absolute top-2 left-2 bg-coral text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(255,107,107,0.5)]">
            <Flame className="w-3 h-3" />
            {t('hot')}
          </div>
        )}

        {/* Listener Count Badge */}
        {book.listeners > 0 && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Users className="w-3 h-3 text-teal" />
            {book.listeners}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="font-bold text-midnight dark:text-parchment text-sm line-clamp-1 leading-tight mb-0.5 group-hover:text-honey transition-colors">
          {book.title}
        </h3>
        <p className="text-midnight/60 dark:text-parchment/60 text-xs mb-2">{book.author}</p>
        
        {/* Bee Score */}
        <div className="flex items-center gap-1 text-honey text-xs font-semibold">
          <Hexagon className="w-3.5 h-3.5 fill-honey/20" />
          {book.beeScore}
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
