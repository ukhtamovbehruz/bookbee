"use client";

import { useEffect, useState } from "react";
import { getAllBooks, onCatalogChanged } from "@/lib/mock-data/catalog";
import type { Book } from "@/lib/types";

/**
 * Returns the full merged catalog (seed + admin edits + custom books),
 * re-reading whenever the catalog changes. Falls back to `initial` for SSR.
 */
export function useCatalog(
  selector: (books: Book[]) => Book[],
  initial: Book[],
): Book[] {
  const [result, setResult] = useState<Book[]>(initial);

  useEffect(() => {
    const refresh = () => setResult(selector(getAllBooks()));
    refresh();
    return onCatalogChanged(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return result;
}
