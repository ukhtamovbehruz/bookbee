"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, MessageCircle, Send, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useAuth } from "@/context/AuthProvider";
import { addComment, getComments, type Comment } from "@/lib/discussions";
import { askAI, suggestedQuestions } from "@/lib/ai-assistant";
import type { Book } from "@/lib/types";

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function BookDiscussion({ book }: { book: Book }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: `Hi! I'm your BookBee reading assistant for “${book.title}”. Ask me anything — a summary, key takeaways, or tips to get the most from your listen.`,
    },
  ]);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setComments(getComments(book.id));
  }, [book.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function postComment() {
    if (!user || !draft.trim()) return;
    addComment(book.id, user.name, draft);
    setComments(getComments(book.id));
    setDraft("");
  }

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((prev) => [...prev, { role: "user", text: clean }]);
    setQuestion("");
    setThinking(true);
    const answer = askAI(book, clean);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
      setThinking(false);
    }, 650);
  }

  return (
    <section>
      <SectionHeading
        title="Discussion & AI"
        subtitle="Talk about this book or ask the reading assistant"
        className="mb-5"
      />
      <Tabs defaultValue="discussion">
        <TabsList>
          <TabsTrigger value="discussion" className="gap-1.5">
            <MessageCircle className="size-4" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Sparkles className="size-4" />
            Ask AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussion" className="mt-4">
          <div className="glass rounded-2xl p-4 sm:p-6">
            {user ? (
              <div className="flex gap-3">
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {initialsOf(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Share your thoughts about this book..."
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" disabled={!draft.trim()} onClick={postComment}>
                      Post comment
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>{" "}
                to join the discussion.
              </p>
            )}

            <div className="mt-6 space-y-4">
              {comments.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No comments yet — be the first to start the conversation.
                </p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-muted text-xs">
                      {initialsOf(c.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(c.ts)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <div className="glass flex flex-col rounded-2xl p-4 sm:p-6">
            <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "flex justify-end" : "flex gap-3"}
                >
                  {m.role === "ai" && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Bot className="size-4" />
                    </span>
                  )}
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                        : "max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm"
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Bot className="size-4" />
                  </span>
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    <span className="flex gap-1">
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedQuestions().map((sq) => (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => send(sq)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            )}

            <form
              className="mt-4 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(question);
              }}
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about this book..."
                className="h-11 flex-1 rounded-full border border-input bg-transparent px-4 text-sm outline-none focus-visible:border-primary/50"
              />
              <Button type="submit" size="icon" className="size-11 rounded-full" disabled={!question.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
