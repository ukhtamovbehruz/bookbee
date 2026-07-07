import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ — BookBee",
  description: "Frequently asked questions about BookBee.",
};

const FAQS = [
  {
    question: "Is BookBee free to use?",
    answer:
      "Yes. Creating an account is free and gives you access to our full catalog of standard titles. BookBee Premium unlocks offline listening, offline reading, unlimited downloads, AI summaries, listening statistics, and an ad-free experience.",
  },
  {
    question: "Do I need an account to listen?",
    answer:
      "You can browse every book, cover, and description without an account. To actually press play, you'll need a free BookBee account — this lets us save your progress, library, and listening streak.",
  },
  {
    question: "Can I listen offline?",
    answer:
      "Offline listening and downloads are part of BookBee Premium. Once downloaded, a title stays available even without an internet connection.",
  },
  {
    question: "What is the listening streak?",
    answer:
      "Your streak counts the number of consecutive days you've listened to at least one chapter. It resets if you miss a full day, so keep the habit going!",
  },
  {
    question: "What happens when I finish a book?",
    answer:
      "You can mark a book as finished from its details page. This unlocks a short 10-question quiz about the book — pass it and you'll receive a personalized certificate of completion you can save or print.",
  },
  {
    question: "How do ratings work?",
    answer:
      "Every rating you see is a genuine average built from real listener reviews. You can rate any book you've explored, and the average updates immediately.",
  },
  {
    question: "Can I cancel Premium anytime?",
    answer:
      "Yes — Premium is billed month-to-month with no long-term commitment. You can cancel anytime from your account settings and keep access until the end of your billing period.",
  },
  {
    question: "What devices does BookBee support?",
    answer:
      "BookBee works in any modern browser on desktop, tablet, or mobile. Native apps are on our roadmap.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Reach us anytime at uktamovbekhruz08@gmail.com or +998 (94) 086-5-600 — see our Contact page for full details.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-muted-foreground">
        Can&apos;t find what you&apos;re looking for? Reach out on our{" "}
        <a href="/contact" className="text-primary hover:underline">
          Contact page
        </a>
        .
      </p>

      <Accordion type="single" collapsible className="mt-8 w-full">
        {FAQS.map((faq, index) => (
          <AccordionItem key={faq.question} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
