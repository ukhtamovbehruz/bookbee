import type { Book, BookLanguage } from "@/lib/types";
import { SAMPLE_AUDIO_URLS } from "@/lib/constants";
import { generateChapters } from "./chapters";

interface SeedBook {
  id: string;
  title: string;
  author: string;
  narrator: string;
  publisher: string;
  description: string;
  categoryIds: string[];
  language?: BookLanguage;
  hours: number;
  rating: number;
  ratingCount: number;
  listenerCount: number;
  isPremium?: boolean;
  isNew?: boolean;
  publishedAt: string;
  tags?: string[];
  chapterCount?: number;
}

const seeds: SeedBook[] = [
  // Business
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    narrator: "James Clear",
    publisher: "Random House Audio",
    description:
      "A proven framework for improving every day. Learn how tiny changes in behavior compound into remarkable results over time.",
    categoryIds: ["business", "self-development"],
    hours: 5.8,
    rating: 4.8,
    ratingCount: 48210,
    listenerCount: 152000,
    tags: ["bestseller"],
    publishedAt: "2018-10-16",
  },
  {
    id: "lean-startup",
    title: "The Lean Startup",
    author: "Eric Ries",
    narrator: "Eric Ries",
    publisher: "Crown Business Audio",
    description:
      "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
    categoryIds: ["business"],
    hours: 8.4,
    rating: 4.5,
    ratingCount: 21870,
    listenerCount: 61200,
    publishedAt: "2011-09-13",
  },
  {
    id: "zero-to-one",
    title: "Zero to One",
    author: "Peter Thiel",
    narrator: "Blake Masters",
    publisher: "Currency Audio",
    description:
      "Notes on startups, and how to build the future by creating new things rather than copying what already works.",
    categoryIds: ["business"],
    hours: 4.9,
    rating: 4.6,
    ratingCount: 18340,
    listenerCount: 58900,
    isPremium: true,
    publishedAt: "2014-09-16",
  },
  {
    id: "good-to-great",
    title: "Good to Great",
    author: "Jim Collins",
    narrator: "Jim Collins",
    publisher: "HarperAudio",
    description:
      "Why some companies make the leap to sustained greatness while others fail to make the transition.",
    categoryIds: ["business"],
    hours: 10.2,
    rating: 4.4,
    ratingCount: 15230,
    listenerCount: 39400,
    publishedAt: "2001-10-16",
  },

  // Psychology
  {
    id: "thinking-fast-and-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    narrator: "Patrick Egan",
    publisher: "Macmillan Audio",
    description:
      "A groundbreaking tour of the mind, explaining the two systems that drive the way we think and make decisions.",
    categoryIds: ["psychology"],
    hours: 13.5,
    rating: 4.7,
    ratingCount: 39820,
    listenerCount: 98700,
    tags: ["award-winning"],
    isPremium: true,
    publishedAt: "2011-10-25",
  },
  {
    id: "power-of-habit",
    title: "The Power of Habit",
    author: "Charles Duhigg",
    narrator: "Mike Chamberlain",
    publisher: "Random House Audio",
    description:
      "Why we do what we do in life and business, and how understanding habit loops can transform them.",
    categoryIds: ["psychology", "self-development"],
    hours: 10.7,
    rating: 4.6,
    ratingCount: 27650,
    listenerCount: 71200,
    publishedAt: "2012-02-28",
  },
  {
    id: "influence",
    title: "Influence",
    author: "Robert Cialdini",
    narrator: "George Newbern",
    publisher: "HarperAudio",
    description:
      "The classic study of persuasion, explaining the psychology of why people say yes and how to apply it ethically.",
    categoryIds: ["psychology", "business"],
    hours: 12.1,
    rating: 4.7,
    ratingCount: 23110,
    listenerCount: 54300,
    publishedAt: "1984-01-01",
  },
  {
    id: "emotional-intelligence",
    title: "Emotional Intelligence",
    author: "Daniel Goleman",
    narrator: "Barrett Whitener",
    publisher: "Random House Audio",
    description:
      "Why emotional intelligence can matter more than IQ for success in life, work, and relationships.",
    categoryIds: ["psychology"],
    hours: 11.4,
    rating: 4.5,
    ratingCount: 16720,
    listenerCount: 41800,
    isNew: true,
    publishedAt: "2025-11-02",
  },

  // Technology
  {
    id: "the-innovators",
    title: "The Innovators",
    author: "Walter Isaacson",
    narrator: "Dennis Boutsikaris",
    publisher: "Simon & Schuster Audio",
    description:
      "How a group of inventors, hackers, and entrepreneurs created the digital revolution.",
    categoryIds: ["technology", "history"],
    hours: 15.3,
    rating: 4.6,
    ratingCount: 14980,
    listenerCount: 36700,
    publishedAt: "2014-10-07",
  },
  {
    id: "singularity-is-near",
    title: "The Singularity Is Near",
    author: "Ray Kurzweil",
    narrator: "George Wilson",
    publisher: "Penguin Audio",
    description:
      "A bold look at how technology will merge with human biology, transforming intelligence itself.",
    categoryIds: ["technology"],
    hours: 18.9,
    rating: 4.2,
    ratingCount: 8340,
    listenerCount: 19200,
    isPremium: true,
    publishedAt: "2005-09-22",
  },
  {
    id: "digital-minimalism",
    title: "Digital Minimalism",
    author: "Cal Newport",
    narrator: "Cal Newport",
    publisher: "Penguin Audio",
    description:
      "A philosophy of technology use in which you focus your online time on a small number of activities that strongly support things you value.",
    categoryIds: ["technology", "self-development"],
    hours: 7.6,
    rating: 4.5,
    ratingCount: 12980,
    listenerCount: 33100,
    isNew: true,
    publishedAt: "2026-03-10",
  },
  {
    id: "fourth-industrial-revolution",
    title: "The Fourth Industrial Revolution",
    author: "Klaus Schwab",
    narrator: "Susan Duerden",
    publisher: "Currency Audio",
    description:
      "An examination of how emerging technologies are reshaping economies, industries, and societies worldwide.",
    categoryIds: ["technology", "business"],
    hours: 6.3,
    rating: 4.0,
    ratingCount: 5210,
    listenerCount: 12400,
    publishedAt: "2016-01-03",
  },

  // Programming
  {
    id: "clean-code",
    title: "Clean Code",
    author: "Robert C. Martin",
    narrator: "Fred Berman",
    publisher: "Prentice Hall Audio",
    description:
      "A handbook of agile software craftsmanship that teaches you how to write code that is easy to read, maintain, and extend.",
    categoryIds: ["programming"],
    hours: 9.8,
    rating: 4.6,
    ratingCount: 19870,
    listenerCount: 47600,
    tags: ["bestseller"],
    isPremium: true,
    publishedAt: "2008-08-01",
  },
  {
    id: "pragmatic-programmer",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    narrator: "Peter Larkin",
    publisher: "Addison-Wesley Audio",
    description:
      "Your journey to mastery, covering the timeless techniques and philosophies of professional software development.",
    categoryIds: ["programming"],
    hours: 8.1,
    rating: 4.7,
    ratingCount: 17650,
    listenerCount: 43900,
    publishedAt: "1999-10-30",
  },
  {
    id: "designing-data-intensive-applications",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    narrator: "Anna Katarina",
    publisher: "O'Reilly Audio",
    description:
      "The big ideas behind reliable, scalable, and maintainable systems, distilled for practicing engineers.",
    categoryIds: ["programming", "technology"],
    hours: 16.7,
    rating: 4.8,
    ratingCount: 9430,
    listenerCount: 22100,
    isNew: true,
    publishedAt: "2026-01-20",
  },
  {
    id: "you-dont-know-js",
    title: "You Don't Know JS",
    author: "Kyle Simpson",
    narrator: "Kyle Simpson",
    publisher: "O'Reilly Audio",
    description:
      "A deep dive into the core mechanisms of JavaScript, challenging you to go beyond common practice.",
    categoryIds: ["programming"],
    hours: 5.4,
    rating: 4.4,
    ratingCount: 6540,
    listenerCount: 15800,
    publishedAt: "2014-12-01",
  },

  // History
  {
    id: "sapiens",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    narrator: "Derek Perkins",
    publisher: "HarperAudio",
    description:
      "A brief history of humankind, exploring how Homo sapiens came to dominate the world.",
    categoryIds: ["history"],
    hours: 15.2,
    rating: 4.8,
    ratingCount: 61230,
    listenerCount: 187400,
    tags: ["bestseller", "award-winning"],
    isPremium: true,
    publishedAt: "2015-02-10",
  },
  {
    id: "guns-germs-and-steel",
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    narrator: "Doug Ordunio",
    publisher: "Random House Audio",
    description:
      "The fates of human societies, explained through geography, agriculture, and the spread of technology.",
    categoryIds: ["history"],
    hours: 16.9,
    rating: 4.5,
    ratingCount: 14320,
    listenerCount: 34200,
    publishedAt: "1997-03-01",
  },
  {
    id: "silk-roads",
    title: "The Silk Roads",
    author: "Peter Frankopan",
    narrator: "Laurence Kennedy",
    publisher: "Bloomsbury Audio",
    description:
      "A new history of the world, told through the lens of the trade routes that connected East and West.",
    categoryIds: ["history"],
    hours: 24.2,
    rating: 4.6,
    ratingCount: 7820,
    listenerCount: 18300,
    publishedAt: "2015-08-27",
  },
  {
    id: "peoples-history-us",
    title: "A People's History of the United States",
    author: "Howard Zinn",
    narrator: "Jeff Zinn",
    publisher: "HarperAudio",
    description:
      "American history told from the perspective of the ordinary people who lived it, not just its leaders.",
    categoryIds: ["history"],
    hours: 19.4,
    rating: 4.5,
    ratingCount: 9870,
    listenerCount: 24100,
    isNew: true,
    publishedAt: "2025-12-05",
  },

  // Finance
  {
    id: "rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    narrator: "Tim Wheeler",
    publisher: "Plata Publishing Audio",
    description:
      "What the rich teach their kids about money that the poor and middle class do not.",
    categoryIds: ["finance", "business"],
    hours: 6.1,
    rating: 4.6,
    ratingCount: 43290,
    listenerCount: 138200,
    tags: ["bestseller"],
    publishedAt: "1997-04-01",
  },
  {
    id: "intelligent-investor",
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    narrator: "Larry Sellers",
    publisher: "HarperAudio",
    description:
      "The definitive book on value investing, teaching timeless strategies for long-term financial success.",
    categoryIds: ["finance"],
    hours: 17.6,
    rating: 4.7,
    ratingCount: 12980,
    listenerCount: 29700,
    isPremium: true,
    publishedAt: "1949-01-01",
  },
  {
    id: "psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    narrator: "Chris Hill",
    publisher: "Harriman House Audio",
    description:
      "Timeless lessons on wealth, greed, and happiness, exploring the strange ways people think about money.",
    categoryIds: ["finance", "psychology"],
    hours: 5.5,
    rating: 4.8,
    ratingCount: 28430,
    listenerCount: 82600,
    isNew: true,
    publishedAt: "2026-02-14",
  },
  {
    id: "naked-economics",
    title: "Naked Economics",
    author: "Charles Wheelan",
    narrator: "Alan Sklar",
    publisher: "Norton Audio",
    description:
      "Undressing the dismal science, making the core ideas of economics accessible and entertaining.",
    categoryIds: ["finance"],
    hours: 11.8,
    rating: 4.3,
    ratingCount: 5430,
    listenerCount: 13900,
    publishedAt: "2002-01-01",
  },

  // Literature
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    narrator: "Simon Prebble",
    publisher: "Penguin Audio",
    description:
      "A dystopian vision of a totalitarian future where truth is manipulated and independent thought is a crime.",
    categoryIds: ["literature"],
    hours: 11.4,
    rating: 4.9,
    ratingCount: 71230,
    listenerCount: 201400,
    tags: ["bestseller", "award-winning"],
    publishedAt: "1949-06-08",
  },
  {
    id: "to-kill-a-mockingbird",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    narrator: "Sissy Spacek",
    publisher: "HarperAudio",
    description:
      "A young girl's coming-of-age story set against the backdrop of racial injustice in the American South.",
    categoryIds: ["literature"],
    hours: 12.2,
    rating: 4.8,
    ratingCount: 54320,
    listenerCount: 143700,
    publishedAt: "1960-07-11",
  },
  {
    id: "the-great-gatsby",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    narrator: "Jake Gyllenhaal",
    publisher: "Simon & Schuster Audio",
    description:
      "A tragic tale of wealth, love, and the American Dream in the glittering excess of the Jazz Age.",
    categoryIds: ["literature"],
    hours: 4.8,
    rating: 4.6,
    ratingCount: 38970,
    listenerCount: 96200,
    isPremium: true,
    publishedAt: "1925-04-10",
  },
  {
    id: "crime-and-punishment",
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    narrator: "Constantine Gregory",
    publisher: "Naxos Audiobooks",
    description:
      "A psychological exploration of guilt and redemption through the eyes of a desperate young man in St. Petersburg.",
    categoryIds: ["literature"],
    hours: 22.3,
    rating: 4.7,
    ratingCount: 15870,
    listenerCount: 32400,
    publishedAt: "1866-01-01",
  },

  // Self Development
  {
    id: "seven-habits",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    narrator: "Stephen Covey",
    publisher: "Simon & Schuster Audio",
    description:
      "Powerful lessons in personal change, built around principles of fairness, integrity, and human dignity.",
    categoryIds: ["self-development", "business"],
    hours: 13.1,
    rating: 4.7,
    ratingCount: 33210,
    listenerCount: 89400,
    tags: ["bestseller"],
    publishedAt: "1989-08-15",
  },
  {
    id: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    narrator: "Jeff Bottoms",
    publisher: "Grand Central Audio",
    description:
      "Rules for focused success in a distracted world, and how to cultivate rare and valuable deep focus.",
    categoryIds: ["self-development", "business"],
    hours: 7.7,
    rating: 4.7,
    ratingCount: 22140,
    listenerCount: 58300,
    isPremium: true,
    publishedAt: "2016-01-05",
  },
  {
    id: "mindset",
    title: "Mindset",
    author: "Carol Dweck",
    narrator: "Bernadette Dunne",
    publisher: "Random House Audio",
    description:
      "The new psychology of success, revealing how a simple belief about ability shapes our whole lives.",
    categoryIds: ["self-development", "psychology"],
    hours: 10.1,
    rating: 4.6,
    ratingCount: 19870,
    listenerCount: 47100,
    isNew: true,
    publishedAt: "2026-04-22",
  },
  {
    id: "cant-hurt-me",
    title: "Can't Hurt Me",
    author: "David Goggins",
    narrator: "David Goggins",
    publisher: "Lioncrest Audio",
    description:
      "Master your mind and defy the odds through raw, unfiltered lessons from an extraordinary life.",
    categoryIds: ["self-development"],
    hours: 13.4,
    rating: 4.9,
    ratingCount: 61870,
    listenerCount: 172300,
    tags: ["bestseller"],
    isNew: true,
    publishedAt: "2025-10-30",
  },
];

function coverUrl(id: string): string {
  return `https://picsum.photos/seed/${id}/480/720`;
}

export const books: Book[] = seeds.map((seed) => {
  const durationSec = Math.round(seed.hours * 3600);
  const chapterCount = seed.chapterCount ?? Math.max(6, Math.round(seed.hours));

  return {
    id: seed.id,
    title: seed.title,
    author: seed.author,
    narrator: seed.narrator,
    publisher: seed.publisher,
    coverUrl: coverUrl(seed.id),
    description: seed.description,
    categoryIds: seed.categoryIds,
    language: seed.language ?? "en",
    durationSec,
    rating: seed.rating,
    ratingCount: seed.ratingCount,
    listenerCount: seed.listenerCount,
    isPremium: seed.isPremium ?? false,
    isNew: seed.isNew ?? false,
    publishedAt: seed.publishedAt,
    tags: seed.tags,
    audioSampleUrl:
      SAMPLE_AUDIO_URLS[
        Math.abs(hashCode(seed.id)) % SAMPLE_AUDIO_URLS.length
      ],
    chapters: generateChapters(seed.id, durationSec, chapterCount),
  };
});

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function getBookById(id: string): Book | undefined {
  return books.find((b) => b.id === id);
}

export function getBooksByCategory(categoryId: string): Book[] {
  return books.filter((b) => b.categoryIds.includes(categoryId));
}

export function getTrendingBooks(limit = 12): Book[] {
  return [...books]
    .sort((a, b) => b.listenerCount - a.listenerCount)
    .slice(0, limit);
}

export function getNewReleases(limit = 12): Book[] {
  return [...books]
    .filter((b) => b.isNew)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}

export function getMostPopularBooks(limit = 10): Book[] {
  return [...books]
    .sort((a, b) => b.rating * b.ratingCount - a.rating * a.ratingCount)
    .slice(0, limit);
}

export function getRecommendedBooks(book: Book, limit = 8): Book[] {
  return books
    .filter(
      (b) =>
        b.id !== book.id &&
        b.categoryIds.some((c) => book.categoryIds.includes(c)),
    )
    .slice(0, limit);
}
