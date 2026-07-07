import { notFound } from "next/navigation";
import { CollectionView } from "@/components/book/CollectionView";
import { collections } from "@/lib/mock-data/collections";

export function generateStaticParams() {
  return collections.map((collection) => ({ id: collection.id }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = collections.find((c) => c.id === id);
  if (!collection) notFound();

  return <CollectionView initial={collection} />;
}
