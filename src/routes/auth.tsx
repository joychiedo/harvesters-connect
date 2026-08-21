import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { BrandWordmark } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ORG_NAME, describeDbError } from "@/lib/constants";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | Harvesters Outreach" },
      {
        name: "description",
        content:
          "Sign in to the outreach workspace of Harvesters International Christian Centre to register people reached and manage follow-up.",
      },
      { property: "og:title", content: "Sign in | Harvesters Outreach" },
      {
        property: "og:description",
        content: "Sign in to the outreach workspace of Harvesters International Christian Centre.",
      },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Enter your full name" })
    .max(100, { message: "Name must be under 100 characters" }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) navigate({ to: "/dashboard", replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const parsed =
      mode === "signup"
        ? signUpSchema.safeParse({ fullName, email, password })
        : signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          toast.success("Account created. Welcome.");
          navigate({ to: "/dashboard", replace: true });
        } else {
          setInfo("Account created. Check your email to confirm the address, then sign in.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(
            /invalid login credentials/i.test(signInError.message)
              ? "Incorrect email or password."
              : describeDbError(signInError),
          );
          return;
        }
        toast.success("Signed in.");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      setError(describeDbError(err as { message?: string }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <BrandWordmark className="h-7" />
          <h1 className="mt-6 text-lg font-semibold text-foreground">
            {mode === "signin" ? "Sign in to the outreach workspace" : "Create your team account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restricted to authorised outreach volunteers and leaders.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  className="h-11"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="h-11"
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                {info}
              </p>
            )}

            <Button type="submit" className="h-11 w-full" disabled={busy}>
              {busy
                ? mode === "signin"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
          >
            {mode === "signin"
              ? "New team member? Create an account"
              : "Already have an account? Sign in"}
          </button>

          <p className="mt-8 text-xs text-muted-foreground">
            New accounts start with volunteer access. An administrator assigns roles.
          </p>
        </div>
      </div>
      <footer className="border-t border-border py-5">
        <p className="mx-auto max-w-sm px-4 text-xs text-muted-foreground">{ORG_NAME}</p>
      </footer>
    </div>
  );
}
