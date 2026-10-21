export const instant = false;
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { initAuth } from "@/lib/auth";
import PostForm from "@/components/PostForm";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Page() {

  const auth = await initAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin?next=%2Fpost");
  }

  if (
    session.user.email?.toLowerCase() !== "arhamgangwal@gmail.com"
  ) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#031b2b] px-5 py-12 text-[#c4cedd] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-[#73dfd0]">
              / ADMIN CONSOLE
            </p>
            <h1 className="mt-3 text-4xl tracking-tight text-[#c4cedd]">
              Create a post
            </h1>
            <p className="mt-3 text-sm text-[#83a7c3]">
              Write, categorise, and publish a new article.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />

            <Link
              href="/"
              className="border border-[#29475c] px-4 py-2 font-mono text-xs text-[#73dfd0] transition hover:bg-[#0b2a3c]"
            >
              ← BACK TO HOME
            </Link>
          </div>
        </div>

        <div className="border border-[#29475c] bg-[#061f30] p-5 sm:p-8">
          <PostForm />
        </div>
      </div>
    </main>
  );
}
