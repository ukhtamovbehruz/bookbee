import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { collections } from "@/lib/mock-data/collections";
import { getBookById } from "@/lib/mock-data/books";

export function FeaturedCollections() {
  return (
    <section id="collections" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8">
      <SectionHeading title="Featured Collections" className="mb-5" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => {
          const covers = collection.bookIds
            .slice(0, 3)
            .map((id) => getBookById(id))
            .filter(Boolean);

          return (
            <Link
              key={collection.id}
              href={`/collection/${collection.id}`}
              className="group relative flex h-40 overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Image
                src={`https://picsum.photos/seed/collection-${collection.id}/600/300`}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${collection.colorHex}66, rgba(11,11,15,0.85) 75%)`,
                }}
              />

              <div className="relative z-10 flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {collection.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {collection.bookIds.length} books
                </span>
              </div>

              <div className="relative z-10 hidden shrink-0 items-center pr-5 sm:flex">
                <div className="flex -space-x-8">
                  {covers.map((book, i) => (
                    <div
                      key={book!.id}
                      className="relative aspect-2/3 w-16 overflow-hidden rounded-lg border-2 border-card shadow-lg transition-transform duration-300 group-hover:-translate-y-1"
                      style={{ zIndex: covers.length - i }}
                    >
                      <Image
                        src={book!.coverUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
