import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BookNotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-32 text-center">
      <h1 className="text-2xl font-bold">Book not found</h1>
      <p className="max-w-md text-muted-foreground">
        The book you&apos;re looking for doesn&apos;t exist or may have been
        removed from the library.
      </p>
      <Button asChild className="mt-2 rounded-full">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
