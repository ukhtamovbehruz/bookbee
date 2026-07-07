import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BookBee",
};

const SECTIONS = [
  {
    title: "1. Information we collect",
    body: [
      "When you create a BookBee account, we collect your name, email address, and password. We do not collect payment details directly — Premium billing (when enabled) is handled by a third-party payment processor.",
      "We also collect information about your activity on BookBee, such as books you've listened to, your listening progress, ratings you leave, books saved to your library, and your listening streak, so we can personalize your experience.",
    ],
  },
  {
    title: "2. How we use your information",
    body: [
      "We use your information to operate and improve BookBee: to sync your library and progress across devices, to recommend books, to award listening streaks and completion certificates, and to respond to support requests sent to uktamovbekhruz08@gmail.com.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    title: "3. Cookies and local storage",
    body: [
      "BookBee uses browser local storage to keep you signed in, remember your library, ratings, and listening streak, and to store preferences like playback speed and volume. You can clear this data at any time by clearing your browser's site data, though this will sign you out and reset your local library.",
    ],
  },
  {
    title: "4. Data sharing",
    body: [
      "We do not share your personal data with third parties except where required by law, to protect the rights and safety of BookBee and its users, or with service providers who help us operate the platform (such as hosting providers) under confidentiality obligations.",
    ],
  },
  {
    title: "5. Data security",
    body: [
      "We take reasonable technical and organizational measures to protect your information. However, no method of electronic storage or transmission is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "6. Children's privacy",
    body: [
      "BookBee is not directed at children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will remove it.",
    ],
  },
  {
    title: "7. Your rights",
    body: [
      "You may request access to, correction of, or deletion of your personal data at any time by contacting us at uktamovbekhruz08@gmail.com.",
    ],
  },
  {
    title: "8. Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time. We'll post the updated version on this page with a new effective date.",
    ],
  },
  {
    title: "9. Contact us",
    body: [
      "If you have questions about this Privacy Policy, contact us at uktamovbekhruz08@gmail.com or +998 (94) 086-5-600.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Effective date: January 1, 2026
      </p>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        This Privacy Policy explains how BookBee (&quot;we&quot;, &quot;us&quot;)
        collects, uses, and protects your information when you use our
        audiobook platform.
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
