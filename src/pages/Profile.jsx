import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Hexagon, Clock, BookOpen, User, Bell, Shield, LogOut, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { signInWithGoogle, signOut, updateMyProfile, uploadAvatar } from '../lib/supabaseData';

const Profile = ({ profile, session, refreshProfile }) => {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [error, setError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef(null);
  const [tempName, setTempName] = useState(profile?.displayName || '');
  const [tempUsername, setTempUsername] = useState(profile?.username || '');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || 'https://i.pravatar.cc/300?u=bookbee');

  const stats = [
    { icon: <Hexagon className="w-5 h-5 text-honey" />, label: 'BeeScore', value: profile?.beePoints ?? 0 },
    { icon: <Clock className="w-5 h-5 text-sky" />, label: t('listen_time') || 'Listen Time', value: `${profile?.streakDays ?? 0}d` },
    { icon: <BookOpen className="w-5 h-5 text-lavender" />, label: t('books_read') || 'Books Read', value: session ? 'Synced' : 'Offline' },
  ];

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file || !profile) {
      return;
    }

    if (file.size > 7 * 1024 * 1024) {
      setError(t('file_too_large') || 'File size exceeds 7MB limit.');
      return;
    }

    try {
      setError('');
      const uploadedUrl = await uploadAvatar(profile.id, file);
      setAvatarPreview(uploadedUrl);
      await updateMyProfile(profile.id, { avatarUrl: uploadedUrl });
      await refreshProfile();
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  const handleSave = async () => {
    if (!profile) {
      return;
    }

    try {
      await updateMyProfile(profile.id, { displayName: tempName, username: tempUsername, avatarUrl: avatarPreview });
      await refreshProfile();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  if (!session || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-32">
        <div className="glass-card p-10 text-center">
          <h1 className="text-3xl font-bold text-midnight dark:text-parchment mb-3">{t('profile') || 'Profile'}</h1>
          <p className="text-midnight/60 dark:text-parchment/60 mb-8">
            {t('auth_sign_in_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth" className="px-6 py-3 rounded-xl bg-forest text-white font-bold hover:bg-forest/90 transition-colors">
              {t('auth_sign_in')}
            </Link>
            <Link to="/auth?mode=signup" className="px-6 py-3 rounded-xl border border-forest text-forest font-bold hover:bg-forest/10 transition-colors">
              {t('auth_sign_up')}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => signInWithGoogle().catch((nextError) => setError(nextError.message))}
            className="mt-4 px-6 py-3 rounded-xl border border-black/10 dark:border-white/10 font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {t('auth_google')}
          </button>
          {error && <p className="mt-4 text-sm text-coral">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-32">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-midnight dark:text-parchment">{t('profile') || 'Profile'}</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-forest text-white' : 'glass-card text-midnight/70 dark:text-parchment/70 hover:text-midnight dark:hover:text-parchment'}`}
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className={`space-y-8 transition-all duration-300 ${showSettings ? 'md:col-span-1' : 'md:col-span-3'}`}>
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-black/10 dark:border-white/10 mb-4 relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{t('edit_photo') || 'Edit Photo'}</span>
              </div>
            </div>
            {error && (
              <div className="text-coral text-sm font-semibold mb-4 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <h2 className="text-2xl font-bold text-midnight dark:text-parchment mb-1">{profile.displayName}</h2>
            <p className="text-midnight/60 dark:text-parchment/60 font-medium mb-2">@{profile.username}</p>
            <p className="text-sm text-midnight/50 dark:text-parchment/50 mb-6">{profile.email}</p>
            <div className="w-full h-px bg-black/10 dark:bg-white/10 mb-6" />
            <div className={`grid gap-4 w-full ${showSettings ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center p-3 glass-pill bg-black/5 dark:bg-white/5">
                  <div className="mb-1">{stat.icon}</div>
                  <span className="text-xl font-bold text-midnight dark:text-parchment">{stat.value}</span>
                  <span className="text-xs font-semibold text-midnight/50 dark:text-parchment/50 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="md:col-span-2 space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-midnight dark:text-parchment mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-sky" /> {t('account_settings') || 'Account Settings'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-midnight/70 dark:text-parchment/70 mb-1">{t('display_name') || 'Display Name'}</label>
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => { setTempName(e.target.value); setIsSaved(false); }}
                      className="w-full px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment outline-none focus:border-forest/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-midnight/70 dark:text-parchment/70 mb-1">Username</label>
                    <input
                      type="text"
                      value={tempUsername}
                      onChange={(e) => { setTempUsername(e.target.value); setIsSaved(false); }}
                      className="w-full px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment outline-none focus:border-forest/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-midnight/70 dark:text-parchment/70 mb-1">{t('email_address') || 'Email Address'}</label>
                    <input
                      type="email"
                      disabled
                      value={profile.email || ''}
                      className="w-full px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment opacity-70"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-forest text-white font-bold rounded-xl hover:bg-forest/90 transition-colors mt-2"
                  >
                    {isSaved ? (t('saved') || 'Saved!') : (t('save_changes') || 'Save Changes')}
                  </button>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-midnight dark:text-parchment mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-honey" /> {t('preferences') || 'Preferences'}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setNotifications(!notifications)}>
                    <div>
                      <h4 className="font-semibold text-midnight dark:text-parchment">{t('push_notifications') || 'Push Notifications'}</h4>
                      <p className="text-sm text-midnight/50 dark:text-parchment/50">{t('notify_desc') || 'Get updates on co-listen rooms and new releases.'}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-forest' : 'bg-black/20 dark:bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications ? 'left-7' : 'left-1'}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-midnight/70 dark:text-parchment/70 group-hover:text-midnight dark:group-hover:text-parchment transition-colors" />
                      <span className="font-semibold text-midnight/70 dark:text-parchment/70 group-hover:text-midnight dark:group-hover:text-parchment transition-colors">{t('privacy_security') || 'Privacy & Security'}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-midnight/30 dark:text-parchment/30 group-hover:text-midnight dark:group-hover:text-parchment" />
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut().catch((nextError) => setError(nextError.message))}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-coral/10 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-coral/70 group-hover:text-coral transition-colors" />
                      <span className="font-semibold text-coral/70 group-hover:text-coral transition-colors">{t('log_out') || 'Log Out'}</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
