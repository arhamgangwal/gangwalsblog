
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { initAuth } from "@/lib/auth";
import CategoryManager from "@/components/CategoryManager";

export const instant = false;

export default async function CategoriesPage() {
  const auth = await initAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    session.user.email.toLowerCase() !== "arhamgangwal@gmail.com"
  ) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#031b2b] p-4 sm:p-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <a
          href="/post"
          className="inline-block font-mono text-xs text-[#73dfd0] hover:text-[#a0f0e4]"
        >
          ← BACK TO BLOG EDITOR
        </a>

        <CategoryManager />
      </div>
    </main>
  );
}
