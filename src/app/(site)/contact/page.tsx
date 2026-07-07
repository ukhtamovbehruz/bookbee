import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact — BookBee",
  description: "Get in touch with the BookBee team.",
};

const CONTACT_DETAILS = [
  {
    icon: Phone,
    label: "Phone",
    value: "+998 (94) 086-5-600",
    href: "tel:+998940865600",
  },
  {
    icon: Mail,
    label: "Email (Support)",
    value: "uktamovbekhruz08@gmail.com",
    href: "mailto:uktamovbekhruz08@gmail.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Uzbekistan, Tashkent, Yunusabad, Chingiz Aitmatov street, 1st narrow, home 9",
    href: undefined,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact us</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Questions, feedback, or need help with your account? Reach out — we
        typically respond within one business day.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {CONTACT_DETAILS.map((detail) => {
            const Icon = detail.icon;
            const content = (
              <div className="glass flex items-start gap-4 rounded-2xl p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {detail.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {detail.value}
                  </p>
                </div>
              </div>
            );
            return detail.href ? (
              <a key={detail.label} href={detail.href}>
                {content}
              </a>
            ) : (
              <div key={detail.label}>{content}</div>
            );
          })}
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
