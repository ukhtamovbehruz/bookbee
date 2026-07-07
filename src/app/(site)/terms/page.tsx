import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — BookBee",
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: [
      "By creating an account or using BookBee, you agree to these Terms of Use and our Privacy Policy. If you do not agree, please do not use the service.",
    ],
  },
  {
    title: "2. Using BookBee",
    body: [
      "You may browse BookBee's catalog without an account. Listening to audiobooks requires a free account. You agree to provide accurate information when signing up and to keep your login credentials secure.",
      "You must be at least 13 years old to create a BookBee account.",
    ],
  },
  {
    title: "3. Accounts and libraries",
    body: [
      "Books you add to your library, ratings you leave, and your listening streak are tied to your account and stored to personalize your experience. You are responsible for all activity under your account.",
    ],
  },
  {
    title: "4. Premium subscription",
    body: [
      "BookBee Premium is an optional paid tier offering offline listening, offline reading, unlimited downloads, AI summaries, listening statistics, and an ad-free experience. Premium is billed on a recurring basis and can be cancelled at any time; access continues until the end of the current billing period.",
    ],
  },
  {
    title: "5. Content and intellectual property",
    body: [
      "All audiobooks, cover art, and related content on BookBee are the property of their respective authors, narrators, and publishers, and are licensed or referenced for demonstration purposes. You may not download, redistribute, or reproduce content outside of BookBee's intended listening experience, except where explicitly permitted (such as Premium offline downloads for personal use).",
    ],
  },
  {
    title: "6. Certificates and quizzes",
    body: [
      "Completion quizzes and certificates are provided for personal enrichment and motivation. They are not accredited qualifications and should not be represented as formal certifications from any educational institution.",
    ],
  },
  {
    title: "7. Prohibited conduct",
    body: [
      "You agree not to misuse BookBee, including attempting to access other users' accounts, reverse-engineering the platform, scraping content at scale, or using the service for any unlawful purpose.",
    ],
  },
  {
    title: "8. Termination",
    body: [
      "We may suspend or terminate your account if you violate these terms. You may stop using BookBee and request account deletion at any time by contacting support.",
    ],
  },
  {
    title: "9. Disclaimer and limitation of liability",
    body: [
      "BookBee is provided \"as is\" without warranties of any kind. To the fullest extent permitted by law, BookBee is not liable for any indirect, incidental, or consequential damages arising from your use of the service.",
    ],
  },
  {
    title: "10. Governing law",
    body: [
      "These Terms are governed by the laws of the Republic of Uzbekistan, without regard to conflict of law principles.",
    ],
  },
  {
    title: "11. Contact",
    body: [
      "Questions about these Terms? Reach us at uktamovbekhruz08@gmail.com or +998 (94) 086-5-600.",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Use</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Effective date: January 1, 2026
      </p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        These Terms of Use govern your access to and use of BookBee. Please
        read them carefully.
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-foreground">
              {section.title}
            </h2>
            <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {section.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
