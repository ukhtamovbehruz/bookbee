"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  return (
    <form
      className="glass space-y-4 rounded-2xl p-6"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Message sent — we'll get back to you soon.");
        e.currentTarget.reset();
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="contact-name">Name</Label>
        <Input id="contact-name" name="name" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input id="contact-email" name="email" type="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" rows={5} required />
      </div>
      <Button type="submit" className="h-11 w-full rounded-full">
        Send message
      </Button>
    </form>
  );
}
