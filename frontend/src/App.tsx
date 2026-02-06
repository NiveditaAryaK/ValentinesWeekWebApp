import { useEffect, useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";

const TOTAL_DAYS = 1;
const DAY_INDEX = 1;
const NOTE_CONTENT =
  "I regret what we both lost. I still think of the good in us, and I never stopped caring.";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

type AuthState = "checking" | "authenticated" | "unauthenticated";

function PixelRose() {
  const pixel = 8;
  const size = 12;
  const toPx = (value: number) => value * pixel;

  const bloom = [
    [5, 1, "#d1788c"],
    [4, 2, "#b84d66"],
    [5, 2, "#d1788c"],
    [6, 2, "#b84d66"],
    [3, 3, "#b84d66"],
    [4, 3, "#d1788c"],
    [5, 3, "#9c2f4c"],
    [6, 3, "#d1788c"],
    [7, 3, "#b84d66"],
    [3, 4, "#b84d66"],
    [4, 4, "#d1788c"],
    [5, 4, "#b84d66"],
    [6, 4, "#d1788c"],
    [7, 4, "#b84d66"],
    [4, 5, "#b84d66"],
    [5, 5, "#9c2f4c"],
    [6, 5, "#b84d66"],
    [5, 6, "#b84d66"]
  ] as const;

  const stem = [
    [5, 7],
    [5, 8],
    [5, 9],
    [5, 10],
    [4, 8],
    [6, 8]
  ] as const;

  return (
    <svg
      width={pixel * size}
      height={pixel * size}
      viewBox={`0 0 ${pixel * size} ${pixel * size}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {bloom.map(([x, y, color]) => (
        <rect
          key={`b-${x}-${y}`}
          x={toPx(x)}
          y={toPx(y)}
          width={pixel}
          height={pixel}
          fill={color}
        />
      ))}
      {stem.map(([x, y]) => (
        <rect
          key={`s-${x}-${y}`}
          x={toPx(x)}
          y={toPx(y)}
          width={pixel}
          height={pixel}
          fill="#4d7c4a"
        />
      ))}
    </svg>
  );
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isRoseOpened, setIsRoseOpened] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyStatus, setReplyStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${apiBase}/auth/me`, {
          credentials: "include"
        });
        setAuthState(response.ok ? "authenticated" : "unauthenticated");
      } catch {
        setAuthState("unauthenticated");
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      setAuthState("authenticated");
    } catch (error) {
      setLoginError("That username or password did not match.");
      setAuthState("unauthenticated");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoseClick = () => {
    setIsRoseOpened(true);
  };

  const handleReplySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = replyDraft.trim();
    if (!message) return;
    setReplyStatus("saving");

    try {
      const response = await fetch(`${apiBase}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error("Failed to save reply");
      }

      setReplyStatus("saved");
      setReplyDraft("");
    } catch {
      setReplyStatus("error");
    }
  };

  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <div className="rounded-3xl bg-white/80 px-8 py-10 text-center shadow-soft">
            <p className="text-sm uppercase tracking-[0.2em] text-rose-500">
              Opening your day
            </p>
            <p className="mt-3 font-serif text-2xl text-ink-900">
              One moment, love.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto flex min-h-screen max-w-lg items-center px-6">
          <Card className="w-full animate-fadeIn">
            <CardHeader>
              <Badge className="w-fit">Private</Badge>
              <h1 className="mt-4 font-serif text-3xl text-ink-900">
                Valentine Week
              </h1>
              <p className="mt-2 text-sm text-ink-700/80">
                Sign in to reveal today&apos;s plan and your personal note.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-700">
                    Username
                  </label>
                  <Input
                    autoComplete="username"
                    value={credentials.username}
                    onChange={(event) =>
                      setCredentials((prev) => ({
                        ...prev,
                        username: event.target.value
                      }))
                    }
                    placeholder="Rehyann"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-700">
                    Password
                  </label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={credentials.password}
                    onChange={(event) =>
                      setCredentials((prev) => ({
                        ...prev,
                        password: event.target.value
                      }))
                    }
                    placeholder="••••••••"
                  />
                </div>
                {loginError ? (
                  <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-700">
                    {loginError}
                  </p>
                ) : null}
                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Checking" : "Unlock Rose Day"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-col gap-6 border-b border-rose-100 pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-rose-500">
              Valentine Week
            </p>
            <h1 className="mt-3 font-serif text-3xl text-ink-900">
              Rose Day
            </h1>
          </div>
          <span className="w-fit rounded-full border border-rose-200 bg-rose-50 px-4 py-1 text-sm text-rose-700">
            Day 1 • Only today
          </span>
        </header>

        <section className="mt-10">
          <div className="space-y-6">
            <Badge className="w-fit">Day {DAY_INDEX} of {TOTAL_DAYS}</Badge>
            <h2 className="font-serif text-4xl text-ink-900">
              A rose for what we lost.
            </h2>
            <p className="max-w-xl text-lg text-ink-700/80">
              &nbsp;
            </p>
            <div className="max-w-xl rounded-3xl border border-rose-100 bg-white/70 px-6 py-5 text-center shadow-card">
              <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
                Tap to reveal
              </p>
              <div className="mt-4 flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <button
                    type="button"
                    className="letter"
                    onClick={handleRoseClick}
                    aria-pressed={isRoseOpened}
                  >
                    <span className="letter__base" />
                    <span className="letter__flap" />
                  </button>
                  <div
                    className={`rose-sprite ${isRoseOpened ? "rose-sprite--open" : ""}`}
                  >
                    <PixelRose />
                  </div>
                </div>
                <p className="text-sm text-ink-700/80">
                  {isRoseOpened
                    ? "A rose has been left for you."
                    : "Click the letter."}
                </p>
              </div>
            </div>
            <p className="max-w-xl text-base italic text-ink-700/70">
              “roses are red violets are blue I still love you”
            </p>
          </div>
        </section>

        <section id="note" className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="h-full">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
                A note left for you
              </p>
              <h3 className="mt-2 font-serif text-2xl text-ink-900">
                Read when you are ready
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-rose-100 bg-white/70 px-5 py-4 text-sm text-ink-700/90">
                {NOTE_CONTENT}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-rose-500">
                  A little clue
                </p>
                <p className="mt-2 text-sm text-ink-700/80">
                  The rose was chosen with care, by someone who still thinks of
                  you in quiet moments.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
                  Leave a reply
                </p>
                <h3 className="mt-2 font-serif text-2xl text-ink-900">
                  If you want to say something
                </h3>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleReplySubmit}>
                  <Textarea
                    value={replyDraft}
                    onChange={(event) => {
                      setReplyDraft(event.target.value);
                      if (replyStatus !== "idle") {
                        setReplyStatus("idle");
                      }
                    }}
                    placeholder="Write a few words if you want to."
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="submit"
                      disabled={replyStatus === "saving" || replyDraft.trim().length === 0}
                    >
                      {replyStatus === "saving" ? "Saving..." : "Send reply"}
                    </Button>
                    {replyStatus === "saved" ? (
                      <span className="text-sm text-rose-600">Reply saved.</span>
                    ) : null}
                    {replyStatus === "error" ? (
                      <span className="text-sm text-rose-600">
                        Something went wrong. Try again.
                      </span>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="mt-12" />
      </div>
    </div>
  );
}
