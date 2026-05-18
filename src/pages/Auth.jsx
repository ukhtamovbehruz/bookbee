import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '../lib/supabaseData';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const redirectTo = searchParams.get('redirect') || '/explore';

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim() || !password) {
      setError(t('auth_fill_required'));
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError(t('auth_password_short'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('auth_password_mismatch'));
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail({ email, password, displayName });
        if (result.session) {
          navigate(redirectTo);
          return;
        }
        setMessage(t('auth_check_email'));
        setMode('signin');
      } else {
        await signInWithEmail({ email, password });
        navigate(redirectTo);
      }
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    try {
      await signInWithGoogle();
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <motion.div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-midnight/60 dark:text-parchment/60 hover:text-forest transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_home')}
        </Link>

        <motion.div className="glass-card p-8 md:p-10 border border-black/10 dark:border-white/10 shadow-2xl">
          <motion.div className="text-center mb-8">
            <img src="/logo.png" alt="Bookbee" className="w-12 h-12 mx-auto mb-4 object-contain" />
            <h1 className="text-3xl font-bold text-midnight dark:text-parchment mb-2">
              {mode === 'signup' ? t('auth_sign_up') : t('auth_sign_in')}
            </h1>
            <p className="text-midnight/60 dark:text-parchment/60 text-sm">
              {mode === 'signup' ? t('auth_sign_up_desc') : t('auth_sign_in_desc')}
            </p>
          </motion.div>

          <motion.div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 mb-6">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === 'signin' ? 'bg-forest text-white shadow-md' : 'text-midnight/60 dark:text-parchment/60 hover:text-midnight dark:hover:text-parchment'}`}
            >
              {t('auth_sign_in')}
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-forest text-white shadow-md' : 'text-midnight/60 dark:text-parchment/60 hover:text-midnight dark:hover:text-parchment'}`}
            >
              {t('auth_sign_up')}
            </button>
          </motion.div>

          {error && (
            <motion.div className="mb-4 rounded-xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</motion.div>
          )}
          {message && (
            <motion.div className="mb-4 rounded-xl border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-forest">{message}</motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <motion.div>
                <label className="block text-xs font-semibold text-midnight/70 dark:text-parchment/70 mb-1.5 uppercase tracking-wide">{t('display_name')}</label>
                <motion.div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/40 dark:text-parchment/40" />
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('auth_name_placeholder')} className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment outline-none focus:border-forest/50" />
                </motion.div>
              </motion.div>
            )}
            <motion.div>
              <label className="block text-xs font-semibold text-midnight/70 dark:text-parchment/70 mb-1.5 uppercase tracking-wide">{t('email_address')}</label>
              <motion.div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/40 dark:text-parchment/40" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment outline-none focus:border-forest/50" />
              </motion.div>
            </motion.div>
            <motion.div>
              <label className="block text-xs font-semibold text-midnight/70 dark:text-parchment/70 mb-1.5 uppercase tracking-wide">{t('auth_password')}</label>
              <motion.div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/40 dark:text-parchment/40" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment outline-none focus:border-forest/50" />
              </motion.div>
            </motion.div>
            {mode === 'signup' && (
              <motion.div>
                <label className="block text-xs font-semibold text-midnight/70 dark:text-parchment/70 mb-1.5 uppercase tracking-wide">{t('auth_confirm_password')}</label>
                <motion.div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/40 dark:text-parchment/40" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="********" autoComplete="new-password" required className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment outline-none focus:border-forest/50" />
                </motion.div>
              </motion.div>
            )}
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-forest text-white font-bold hover:bg-forest/90 disabled:opacity-60 shadow-lg shadow-forest/20">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {mode === 'signup' ? t('auth_create_account') : t('auth_sign_in')}
            </button>
          </form>

          <motion.div className="relative my-6">
            <motion.div className="absolute inset-0 flex items-center"><motion.div className="w-full border-t border-black/10 dark:border-white/10" /></motion.div>
            <motion.div className="relative flex justify-center text-xs uppercase"><span className="px-2 text-midnight/50 dark:text-parchment/50">{t('auth_or')}</span></motion.div>
          </motion.div>

          <button type="button" onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-midnight/50 font-semibold hover:bg-black/5 dark:hover:bg-white/5">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t('auth_google')}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Auth;
