import { useEffect, useState } from 'react';
import { Book, Users, Settings, Plus } from 'lucide-react';
import { createBook, listBooks } from '../lib/supabaseData';

const emptyForm = {
  title: '',
  author: '',
  genre: '',
  cover: '',
  description: '',
  slug: '',
  isPremium: false,
  featured: false,
  isHot: false,
};

const Admin = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let isActive = true;

    listBooks()
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
  }, []);

  const tabs = [
    { id: 'books', label: 'Manage Books', icon: Book },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  async function handleCreateBook(event) {
    event.preventDefault();

    if (!profile) {
      setError('Sign in as an admin before creating books.');
      return;
    }

    try {
      const nextBook = await createBook(profile.id, form);
      setBooks((current) => [nextBook, ...current]);
      setForm(emptyForm);
      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        <div className="glass-card p-8 text-center text-midnight/70 dark:text-parchment/70">
          This dashboard is admin-only. After the schema is installed, promote your profile by setting `role = 'admin'` in the `profiles` table.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-32">
      {error && (
        <div className="mb-6 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-midnight dark:text-parchment">Admin Dashboard</h1>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto scrollbar-hide border-b border-black/10 dark:border-white/10 pb-4">
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

      {activeTab === 'books' && (
        <div className="space-y-8">
          <form onSubmit={handleCreateBook} className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-5 h-5 text-forest" />
              <h2 className="text-xl font-bold text-midnight dark:text-parchment">Add Book</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['title', 'Title'],
                ['author', 'Author'],
                ['genre', 'Genre'],
                ['slug', 'Slug (optional)'],
                ['cover', 'Cover URL'],
              ].map(([field, label]) => (
                <input
                  key={field}
                  type="text"
                  value={form[field]}
                  onChange={(e) => setForm((current) => ({ ...current, [field]: e.target.value }))}
                  placeholder={label}
                  className="w-full px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment outline-none focus:border-forest/50 transition-colors"
                />
              ))}
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              placeholder="Description"
              className="w-full min-h-28 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment outline-none focus:border-forest/50 transition-colors"
            />
            <div className="flex flex-wrap gap-4">
              {[
                ['isPremium', 'Premium'],
                ['featured', 'Featured'],
                ['isHot', 'Hot'],
              ].map(([field, label]) => (
                <label key={field} className="flex items-center gap-2 text-sm text-midnight/70 dark:text-parchment/70">
                  <input
                    type="checkbox"
                    checked={form[field]}
                    onChange={(e) => setForm((current) => ({ ...current, [field]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button type="submit" className="px-4 py-2 bg-forest text-white rounded-lg font-bold hover:bg-forest/90 transition-colors">
              Create Book
            </button>
          </form>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-midnight dark:text-parchment">Books Inventory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 text-midnight/60 dark:text-parchment/60">
                    <th className="p-3 font-semibold">Title</th>
                    <th className="p-3 font-semibold">Author</th>
                    <th className="p-3 font-semibold">Genre</th>
                    <th className="p-3 font-semibold">Bee Score</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-b border-black/5 dark:border-white/5">
                      <td className="p-3 text-midnight dark:text-parchment">{book.title}</td>
                      <td className="p-3 text-midnight/70 dark:text-parchment/70">{book.author}</td>
                      <td className="p-3 text-midnight/70 dark:text-parchment/70">{book.genre}</td>
                      <td className="p-3 text-honey font-semibold">{book.beeScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-midnight dark:text-parchment mb-6">Registered Users</h2>
          <p className="text-midnight/60 dark:text-parchment/60">
            User management is backed by Supabase Auth. Inspect `Authentication {'>'} Users` in the Supabase dashboard, and edit `profiles.role` in the Table Editor when you need to grant admin access.
          </p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-bold text-midnight dark:text-parchment">Platform Settings</h2>
          <div>
            <label className="block text-sm font-semibold text-midnight/70 dark:text-parchment/70 mb-1">Supabase URL</label>
            <input type="text" disabled placeholder="Configured via .env" className="w-full px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-midnight/70 dark:text-parchment/70 mb-1">Supabase Anon Key</label>
            <input type="password" disabled placeholder="Configured via .env" className="w-full px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-midnight dark:text-parchment opacity-50 cursor-not-allowed" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
