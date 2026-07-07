import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center — BookBee",
  description: "Get help with your BookBee account and listening experience.",
};

const TOPICS = [
  {
    title: "Getting started",
    body: "Learn how to create an account, find your first book, and start listening in seconds.",
    href: "/faq",
  },
  {
    title: "Billing & Premium",
    body: "Manage your subscription, understand what's included in Premium, and how to cancel.",
    href: "/faq",
  },
  {
    title: "Account & library",
    body: "Add books to your library, track your listening streak, and manage your saved notes.",
    href: "/library",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
        <HelpCircle className="size-4" />
        Help Center
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
        How can we help?
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Browse common topics below, check our FAQ, or reach out directly —
        we&apos;re happy to help.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TOPICS.map((topic) => (
          <Link
            key={topic.title}
            href={topic.href}
            className="glass rounded-2xl p-5 transition-transform hover:-translate-y-1"
          >
            <h2 className="font-semibold text-foreground">{topic.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{topic.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-white/5 bg-card/40 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="size-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">Still need help?</p>
            <p className="text-sm text-muted-foreground">
              Our support team responds within one business day.
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Mail className="size-4" />
          Contact support
        </Link>
      </div>
    </div>
  );
}
