"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Award, ChevronRight, ScrollText } from "lucide-react";
import { getLibraryEntries } from "@/lib/library";
import { getCatalogBookById } from "@/lib/mock-data/catalog";
import { onActivityChanged } from "@/lib/activity";

interface EarnedCertificate {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  quizScore?: number;
  finishedAt?: string;
}

export function CertificatesGallery() {
  const [certificates, setCertificates] = useState<EarnedCertificate[]>([]);

  useEffect(() => {
    const refresh = () => {
      const earned = getLibraryEntries()
        .filter((e) => e.certificateEarned)
        .map((e): EarnedCertificate | null => {
          const book = getCatalogBookById(e.bookId);
          if (!book) return null;
          return {
            bookId: e.bookId,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            quizScore: e.quizScore,
            finishedAt: e.finishedAt,
          };
        })
        .filter((c): c is EarnedCertificate => c !== null);
      setCertificates(earned);
    };
    refresh();
    return onActivityChanged(refresh);
  }, []);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Certificates</h2>
        {certificates.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {certificates.length} earned
          </span>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <ScrollText className="size-6" />
          </span>
          <p className="mt-3 text-sm font-medium">No certificates yet</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Finish a book and pass its quiz to earn a Certificate of Completion
            you can revisit here.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {certificates.map((c) => (
            <Link
              key={c.bookId}
              href={`/book/${c.bookId}/certificate`}
              className="group flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={c.coverUrl}
                  alt={c.title}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.title}</p>
                <p className="truncate text-xs text-muted-foreground">{c.author}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                  <Award className="size-3" />
                  {typeof c.quizScore === "number" ? `${c.quizScore}/10` : "Completed"}
                </span>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
