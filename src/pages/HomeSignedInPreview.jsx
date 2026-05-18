import Home from './Home';

const previewProfile = {
  id: 'preview-user',
  email: 'reader@bookbee.app',
  username: 'nadiabooks',
  displayName: 'Nadia',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  beePoints: 1280,
  streakDays: 12,
  role: 'user',
  createdAt: '2026-05-17T00:00:00.000Z',
};

const previewBooks = [
  {
    id: 'book-1',
    slug: 'midnight-library',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    description: 'A library between lives where every shelf opens a different path.',
    genre: 'Fantasy',
    isPremium: false,
    beeScore: 98,
    listeners: 142,
    rating: 4.8,
    featured: true,
    featuredRank: 1,
    isHot: true,
    chapters: [
      {
        id: 'chapter-1',
        title: 'Chapter 1: The Root Shelf',
        audioUrl: '#',
        summary: 'Nora arrives in the library and opens her first impossible life.',
        durationSeconds: 1220,
        duration: '20:20',
        isFree: true,
        orderIndex: 1,
      },
    ],
  },
  {
    id: 'book-2',
    slug: 'project-hail-mary',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80',
    description: 'A lone astronaut wakes up to a mission bigger than memory.',
    genre: 'Sci-Fi',
    isPremium: true,
    beeScore: 124,
    listeners: 206,
    rating: 4.9,
    featured: true,
    featuredRank: 2,
    isHot: true,
    chapters: [
      {
        id: 'chapter-2',
        title: 'Chapter 1: Wake Sequence',
        audioUrl: '#',
        summary: 'Ryland wakes up alone and starts piecing together the mission.',
        durationSeconds: 1510,
        duration: '25:10',
        isFree: true,
        orderIndex: 1,
      },
    ],
  },
  {
    id: 'book-3',
    slug: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
    description: 'Tiny changes that compound into meaningful routines.',
    genre: 'Self-Help',
    isPremium: false,
    beeScore: 88,
    listeners: 98,
    rating: 4.7,
    featured: false,
    featuredRank: null,
    isHot: false,
    chapters: [
      {
        id: 'chapter-3',
        title: 'Chapter 1: Tiny Changes',
        audioUrl: '#',
        summary: 'Small wins build identity over time.',
        durationSeconds: 980,
        duration: '16:20',
        isFree: true,
        orderIndex: 1,
      },
    ],
  },
  {
    id: 'book-4',
    slug: 'before-the-coffee-gets-cold',
    title: 'Before the Coffee Gets Cold',
    author: 'Toshikazu Kawaguchi',
    cover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80',
    description: 'A quiet cafe lets visitors revisit one moment, but only briefly.',
    genre: 'Magical Realism',
    isPremium: false,
    beeScore: 91,
    listeners: 117,
    rating: 4.6,
    featured: false,
    featuredRank: null,
    isHot: true,
    chapters: [
      {
        id: 'chapter-4',
        title: 'Chapter 1: The Cafe Rule',
        audioUrl: '#',
        summary: 'The rules sound simple until feelings enter the room.',
        durationSeconds: 1105,
        duration: '18:25',
        isFree: true,
        orderIndex: 1,
      },
    ],
  },
];

const previewData = {
  feed: {
    featured: [previewBooks[0], previewBooks[1]],
    trending: [previewBooks[1], previewBooks[0], previewBooks[3], previewBooks[2]],
    all: previewBooks,
  },
  dashboard: {
    stats: {
      libraryCount: 14,
      readingCount: 3,
      finishedCount: 9,
      wantCount: 2,
    },
    continueListening: {
      book: previewBooks[0],
      chapter: previewBooks[0].chapters[0],
      positionSeconds: 732,
      progressPercent: 60,
    },
    libraryPreview: [
      { status: 'currently-reading', book: previewBooks[0] },
      { status: 'currently-reading', book: previewBooks[1] },
      { status: 'want-to-listen', book: previewBooks[2] },
      { status: 'finished', book: previewBooks[3] },
    ],
  },
};

function HomeSignedInPreview() {
  return (
    <Home
      session={{ user: { id: previewProfile.id, email: previewProfile.email } }}
      profile={previewProfile}
      isBootstrapping={false}
      previewData={previewData}
    />
  );
}

export default HomeSignedInPreview;
