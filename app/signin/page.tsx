"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface UserType {
  email: string;
  name: string;
  password: string;
  signUp: boolean;
}

function SignInForm() {
  const { data: session, isPending } = authClient.useSession();

  const [user, setUser] = useState<UserType>({
    email: "",
    name: "",
    password: "",
    signUp: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/");
    }
  }, [session, isPending, router]);

  function getDestination() {
    const next = searchParams.get("next");

    if (
      !next?.startsWith("/") ||
      next.startsWith("//") ||
      next.includes("\\")
    ) {
      return "/";
    }

    try {
      const destination = new URL(next, window.location.origin);

      return destination.origin === window.location.origin
        ? `${destination.pathname}${destination.search}${destination.hash}`
        : "/";
    } catch {
      return "/";
    }
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (user.signUp) {
        const { email, name, password } = user;

        const result = await authClient.signUp.email(
          { email, name, password },
          {
            onSuccess: () => router.push(getDestination()),
          },
        );

        if (result.error) {
          setError(result.error.message || "Sign-up failed.");
        }
      } else {
        const { email, password } = user;

        const result = await authClient.signIn.email(
          { email, password },
          {
            onSuccess: () => router.push(getDestination()),
          },
        );

        if (result.error) {
          setError(result.error.message || "Sign-in failed.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function skipLogin() {
    router.push(getDestination());
  }

  // Avoid showing the sign-in form while the session is being checked
  // or redirecting an already authenticated user.
  if (isPending || session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#031b2b] text-[#c4cedd]">
        <p className="font-mono text-sm">
          {isPending ? "CHECKING SESSION..." : "REDIRECTING..."}
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#031b2b] px-5 py-12 text-[#c4cedd]">
      <div className="w-full max-w-md border border-[#29475c] bg-[#061f30] p-7 sm:p-10">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="font-mono text-xs text-[#73dfd0] hover:underline"
        >
          ← BACK TO HOME
        </button>

        <p className="mt-10 font-mono text-xs tracking-widest text-[#73dfd0]">
          / MEMBER ACCESS
        </p>

        <h1 className="mt-3 text-4xl tracking-tight">
          {user.signUp ? "Create account." : "Welcome back."}
        </h1>

        <p className="mt-3 text-sm text-[#91abc1]">
          {user.signUp
            ? "Create an account to join the blog."
            : "Sign in to continue reading the blog."}
        </p>

        <form onSubmit={handleSignIn} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-mono text-xs text-[#a8c5db]"
            >
              EMAIL ADDRESS
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={user.email}
              onChange={(e) =>
                setUser({ ...user, email: e.target.value })
              }
              className="w-full border border-[#29475c] bg-[#031b2b] px-4 py-3 text-sm outline-none focus:border-[#73dfd0]"
            />
          </div>

          {user.signUp && (
            <div>
              <label
                htmlFor="name"
                className="mb-2 block font-mono text-xs text-[#a8c5db]"
              >
                YOUR NAME
              </label>

              <input
                id="name"
                required
                autoComplete="name"
                placeholder="Your name"
                value={user.name}
                onChange={(e) =>
                  setUser({ ...user, name: e.target.value })
                }
                className="w-full border border-[#29475c] bg-[#031b2b] px-4 py-3 text-sm outline-none focus:border-[#73dfd0]"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-xs text-[#a8c5db]"
            >
              PASSWORD
            </label>

            <input
              id="password"
              type="password"
              required
              autoComplete={
                user.signUp ? "new-password" : "current-password"
              }
              placeholder="Enter your password"
              value={user.password}
              onChange={(e) =>
                setUser({ ...user, password: e.target.value })
              }
              className="w-full border border-[#29475c] bg-[#031b2b] px-4 py-3 text-sm outline-none focus:border-[#73dfd0]"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#73dfd0] px-4 py-3 font-mono text-sm font-semibold text-[#05202b] hover:bg-[#a0f0e4] disabled:opacity-50"
          >
            {loading
              ? "PLEASE WAIT..."
              : user.signUp
                ? "CREATE ACCOUNT →"
                : "SIGN IN →"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError("");
            setUser({ ...user, signUp: !user.signUp });
          }}
          className="mt-5 w-full text-sm text-[#73dfd0] hover:underline"
        >
          {user.signUp
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>

        <div className="my-5 border-t border-[#29475c]" />

        <button
          type="button"
          onClick={skipLogin}
          className="w-full border border-[#29475c] px-4 py-3 font-mono text-sm hover:bg-[#0c3447]"
        >
          SKIP LOGIN →
        </button>

        <p className="mt-6 text-center font-mono text-xs text-[#83a7c3]">
          ARHAM GANGWAL · PERSONAL BLOG
        </p>
      </div>
    </main>
  );
}

function SignInFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#031b2b] px-5 py-12 text-[#c4cedd]">
      <div className="w-full max-w-md border border-[#29475c] bg-[#061f30] p-7 sm:p-10">
        <p className="font-mono text-xs tracking-widest text-[#73dfd0]">
          / MEMBER ACCESS
        </p>
        <p className="mt-3 text-sm text-[#91abc1]">
          Loading sign-in...
        </p>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}