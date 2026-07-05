import { SectionHeading } from "@/components/shared/SectionHeading";
import { BookCard } from "@/components/book/BookCard";
import { getNewReleases } from "@/lib/mock-data/books";

export function NewReleasesGrid() {
  const releases = getNewReleases(12);
  if (releases.length === 0) return null;

  return (
    <section id="new-releases" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8">
      <SectionHeading
        title="New Releases"
        subtitle="Freshly added to the library"
        className="mb-5"
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {releases.map((book) => (
          <BookCard key={book.id} book={book} width="w-full" />
        ))}
      </div>
    </section>
  );
}
