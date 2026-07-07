import { notFound } from "next/navigation";
import { CategoryBooksGrid } from "@/components/book/CategoryBooksGrid";
import { categories } from "@/lib/mock-data/categories";
import { getBooksByCategory } from "@/lib/mock-data/books";

export function generateStaticParams() {
  return categories.map((category) => ({ id: category.id }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  const books = getBooksByCategory(category.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <span
          className="size-3 rounded-full"
          style={{ backgroundColor: category.colorHex }}
        />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {category.name}
        </h1>
        <span className="text-sm text-muted-foreground">
          {books.length} books
        </span>
      </div>

      <CategoryBooksGrid categoryId={category.id} initial={books} />
    </div>
  );
}
