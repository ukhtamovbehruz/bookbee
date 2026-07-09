"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CertificateCard } from "@/components/certificate/CertificateCard";
import { useAuth } from "@/context/AuthProvider";
import { getBookById } from "@/lib/mock-data/books";
import { getCustomBookById } from "@/lib/mock-data/custom-books";
import { getLibraryEntry } from "@/lib/library";
import type { Book } from "@/lib/types";
import type { LibraryEntry } from "@/lib/library";

export default function CertificatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [book, setBook] = useState<Book | null | undefined>(undefined);
  const [entry, setEntry] = useState<LibraryEntry | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBook(getBookById(params.id) ?? getCustomBookById(params.id) ?? null);
    setEntry(getLibraryEntry(params.id));
  }, [params.id]);

  useEffect(() => {
    if (isReady && !user) router.replace("/signup");
  }, [isReady, user, router]);

  if (!isReady || !user || book === undefined) return null;

  if (book === null || !entry?.certificateEarned) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold">No certificate found</h1>
        <p className="mt-2 text-muted-foreground">
          Complete the quiz for this book to earn your certificate.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link href={`/book/${params.id}/quiz`}>Take the quiz</Link>
        </Button>
      </div>
    );
  }

  const finishedDate = entry.finishedAt
    ? new Date(entry.finishedAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  const fileSlug = book.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

  async function downloadPdf() {
    const node = certRef.current;
    if (!node) return;
    setBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#f7f2e5",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`BookBee-Certificate-${fileSlug}.pdf`);
      toast.success("Certificate downloaded.");
    } catch {
      toast.error("Could not generate the certificate PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My BookBee Certificate",
          text: `I earned a BookBee Certificate of Achievement for “${book!.title}”!`,
          url,
        });
        return;
      } catch {
        /* user cancelled or unsupported — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Certificate link copied to clipboard.");
    } catch {
      toast.error("Could not share the certificate.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap justify-end gap-3">
        <Button variant="outline" className="gap-2 rounded-full" onClick={share}>
          <Share2 className="size-4" />
          Share
        </Button>
        <Button className="gap-2 rounded-full" onClick={downloadPdf} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {busy ? "Generating…" : "Download PDF"}
        </Button>
      </div>

      <CertificateCard
        ref={certRef}
        data={{
          recipient: user.name,
          bookTitle: book.title,
          bookAuthor: book.author,
          score: entry.quizScore,
          date: finishedDate,
        }}
      />
    </div>
  );
}
