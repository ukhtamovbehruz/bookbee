import type { Metadata } from "next";
import { Heart, Sparkles, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About — BookBee",
  description: "The story behind BookBee and why we're building it.",
};

const VALUES = [
  {
    icon: Target,
    title: "Our mission",
    body: "Make lifelong learning and great storytelling accessible to anyone with a pair of headphones — on a commute, a walk, or a quiet evening at home.",
  },
  {
    icon: Sparkles,
    title: "Why BookBee",
    body: "We built BookBee because we were tired of audiobook apps that felt clunky and impersonal. We wanted something fast, beautiful, and genuinely built around how people actually listen.",
  },
  {
    icon: Users,
    title: "Who we are",
    body: "A small, independent team based in Tashkent, Uzbekistan — book lovers, engineers, and designers who believe great audio experiences shouldn't be complicated.",
  },
  {
    icon: Heart,
    title: "What we care about",
    body: "Honest pricing, real craftsmanship, and a product that respects your time and attention. No dark patterns, no clutter — just books.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
        About BookBee
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
        Built by listeners, for listeners.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        BookBee started as a simple idea: what if the audiobook app itself
        felt as good as the stories it carries? We founded BookBee in
        Tashkent to bring a faster, more beautiful, and more personal way to
        listen to your next favorite book — across business, psychology,
        technology, history, and beyond.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {VALUES.map((value) => {
          const Icon = value.icon;
          return (
            <div key={value.title} className="glass rounded-2xl p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 font-semibold text-foreground">{value.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 rounded-2xl border border-white/5 bg-card/40 p-6">
        <h2 className="font-semibold text-foreground">From our founding team</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          BookBee was founded by a small group of readers and builders who
          wanted an audiobook platform that felt local, personal, and fast —
          without losing the polish of the biggest global apps. We&apos;re
          still early, still growing, and still listening to feedback from
          every person who joins us.
        </p>
      </div>
    </div>
  );
}
