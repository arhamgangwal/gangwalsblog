
"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

type BlogPost = {
  id: string;
  date: string;
  title: string;
  href: string;
  categories: string[];
};

function normalizeCategory(category: string) {
  return category.trim().replace(/\s+/g, " ").toLowerCase();
}

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [managedCategories, setManagedCategories] = useState<string[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Posts");

  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isAdmin =
  !isPending &&
  session?.user?.email?.trim().toLowerCase() ===
    "arhamgangwal@gmail.com";

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const response = await fetch("/api/posts", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load posts");
        }

        const data: { posts: BlogPost[]; categories: string[] } =
          await response.json();

        if (active) {
          setPosts(data.posts);
          setManagedCategories(data.categories);
          setPostsError(false);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);

        if (active) {
          setPostsError(true);
        }
      } finally {
        if (active) {
          setPostsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, []);

  const categoryCounts = new Map<string, { name: string; count: number }>();

  for (const post of posts) {
    const postCategoryKeys = new Set<string>();

    for (const category of post.categories) {
      const name = category.trim().replace(/\s+/g, " ");
      const key = normalizeCategory(name);

      if (!key || postCategoryKeys.has(key)) continue;
      postCategoryKeys.add(key);

      const existing = categoryCounts.get(key);
      categoryCounts.set(key, {
        name: existing?.name ?? name,
        count: (existing?.count ?? 0) + 1,
      });
    }
  }

  for (const category of managedCategories) {
    const name = category.trim().replace(/\s+/g, " ");
    const key = normalizeCategory(name);

    if (key && !categoryCounts.has(key)) {
      categoryCounts.set(key, { name, count: 0 });
    }
  }

  const categories = [
    { name: "All Posts", count: posts.length },
    ...Array.from(categoryCounts.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  ];

  const filteredPosts =
    selectedCategory === "All Posts"
      ? posts
      : posts.filter((post) =>
          post.categories.some(
            (category) =>
              normalizeCategory(category) === normalizeCategory(selectedCategory),
          ),
        );

  const handleLogout = async () => {
    const result = await authClient.signOut();

    if (result.error) {
      console.error("Logout failed:", result.error);
      return;
    }

    setProfileOpen(false);
    router.replace("/");
    router.refresh();
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <main className="min-h-screen bg-transparent font-sans text-[var(--ink)]">
      <div className="mx-auto my-4 flex min-h-[calc(100vh-2rem)] max-w-[1800px] flex-col overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--page)] shadow-xl sm:[html.light_&]:my-8 lg:[html.light_&]:my-10">
        {/* Navigation */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
          <nav className="flex flex-wrap items-center gap-1 font-mono text-[10px] sm:text-xs">
            <Link
              href="/"
              aria-label="Home"
              className="mr-1 flex h-8 w-8 items-center justify-center bg-[var(--surface)] text-[var(--accent)]"
            >
              <span className="inline-block h-3 w-3 -skew-y-12 bg-current" />
            </Link>

            <Link
              href="/"
              className="bg-[var(--accent)] px-3 py-2 text-[var(--accent-ink)] transition hover:brightness-110"
            >
              [B] BLOG
            </Link>

          </nav>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] sm:text-xs">
            <ThemeToggle />

            {isPending ? (
              <span className="px-3 py-2 text-[var(--muted)]">Checking...</span>
            ) : session ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-label="Open user profile"
                  aria-expanded={profileOpen}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)] transition hover:border-[var(--accent)] hover:brightness-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 font-sans shadow-xl">
                    <p className="text-xs uppercase tracking-widest text-[var(--muted)]">
                      Signed in as
                    </p>

                    <p className="mt-2 break-words text-sm font-semibold text-[var(--ink)]">
                      {session.user.name || "User"}
                    </p>

                    <p className="mt-1 break-words text-sm text-[var(--muted)]">
                      {session.user.email}
                    </p>

                    {isAdmin && (
                      <p className="mt-3 text-xs text-[var(--accent)]">
                        Administrator
                      </p>
                    )}

                    <div className="my-4 border-t border-[var(--line)]" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-md border border-[var(--line)] px-3 py-2 text-left text-sm text-[var(--ink)] transition hover:border-[var(--accent)] hover:bg-[var(--page)] hover:text-[var(--accent)]"
                    >
                      Log out →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] transition hover:brightness-110"
              >
                [S] SIGN IN
              </Link>
            )}

            {isAdmin && (
  <Link
    href="/post"
    className="bg-[var(--accent)] px-3 py-2 text-[var(--accent-ink)] transition hover:brightness-110"
  >
    [+] CREATE POST
  </Link>
)}

<Link
  href={isAdmin ? "/post" : "/signin"}
  className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] transition hover:brightness-110"
>
  [C] CONSOLE
</Link>
          </div>
        </header>

        {/* Title */}
        <section className="px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="flex items-start gap-3">
            <h1 className="text-[84px] font-normal leading-[0.9] tracking-[-0.075em] sm:text-[112px] lg:text-[140px]">
              Blog
            </h1>

            <span className="mt-2 text-sm font-medium text-[var(--highlight)] sm:text-base">
              ({posts.length})
            </span>
          </div>

          <p className="mt-5 font-mono text-xs tracking-[0.22em] text-[var(--muted)]">
            BY ARHAM GANGWAL
          </p>
        </section>

        {/* Sidebar and post listing */}
        <section className="grid flex-1 grid-cols-1 gap-8 px-4 pb-8 sm:px-8 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-12">
          <aside className="border-[var(--line)] lg:border-r lg:pr-8">
            <div className="border-b border-[var(--line)] pb-2 font-mono text-xs text-[var(--muted)]">
              / FILTERS
            </div>

            <div className="flex items-center gap-2 py-4 text-sm">
              <span className="text-[var(--accent)]">⌄</span>

              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 7h7l2 2h9v10H3z" />
                <path d="M3 7V5h7l2 2" />
              </svg>

              <span className="text-[var(--accent)]">Topic</span>
            </div>

            <div className="space-y-2 pl-5">
              {categories.map((category) => {
                const selected = selectedCategory === category.name;

                return (
                  <button
                    type="button"
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    aria-pressed={selected}
                    className="flex w-full items-center gap-2 text-left text-xs text-[var(--muted)] transition hover:text-[var(--accent)]"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border ${
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent)]"
                          : "border-[var(--muted)]"
                      }`}
                    >
                      {selected && (
                        <span className="text-[10px] text-[var(--accent-ink)]">✓</span>
                      )}
                    </span>

                    <span>{category.name}</span>

                    <span className="font-mono text-[var(--muted)]">
                      ({category.count})
                    </span>
                  </button>
                );
              })}
            </div>

          </aside>

          <div className="min-w-0">
            <div className="grid grid-cols-[120px_minmax(0,1fr)_20px] gap-3 border-b border-[var(--line)] pb-3 font-mono text-xs text-[var(--muted)] sm:grid-cols-[130px_minmax(0,1fr)_20px]">
              <span>/ DATE</span>
              <span>/ NAME</span>
              <span />
            </div>

            {filteredPosts.map((post) => (
              <Link
                href={post.href}
                key={post.id}
                className="group grid grid-cols-[120px_minmax(0,1fr)_20px] items-center gap-3 border-b border-[var(--line)] py-4 transition hover:bg-[var(--surface)] sm:grid-cols-[130px_minmax(0,1fr)_20px]"
              >
                <span className="font-mono text-[10px] text-[var(--date)] sm:text-xs">
                  <span className="mr-2 text-[var(--date)]">■</span>
                  {post.date}
                </span>

                <span className="truncate text-base tracking-tight text-[var(--ink)] transition group-hover:text-[var(--accent)] sm:text-xl lg:text-2xl">
                  {post.title}
                </span>

                <span className="text-right text-lg text-[var(--muted)] transition group-hover:text-[var(--accent)]">
                  +
                </span>
              </Link>
            ))}

            {postsLoading && (
              <p className="py-8 text-sm text-[var(--muted)]">
                Loading posts...
              </p>
            )}

            {!postsLoading && postsError && (
              <p className="py-8 text-sm text-[#ff9eaa]">
                Could not load posts. Please refresh the page.
              </p>
            )}

            {!postsLoading && !postsError && filteredPosts.length === 0 && (
              <p className="py-8 text-sm text-[var(--muted)]">
                {posts.length === 0
                  ? "No posts published yet."
                  : `No posts in "${selectedCategory}".`}
              </p>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
