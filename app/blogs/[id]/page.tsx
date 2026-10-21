
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Post from "@/lib/PostModel";
import dbConnect from "@/lib/mongoose";
import CopyLinkButton from "@/components/CopyLinkButton";
import ProfileMenu from "@/components/ProfileMenu";
import ArticleEngagement from "@/components/ArticleEngagement";
import ThemeToggle from "@/components/ThemeToggle";
import { getEngagement } from "@/app/blogs/actions";
import { connection } from "next/server";

type ArticleSection = {
  heading?: string;
  paragraphs: string[];
};

async function BlogArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;

  await dbConnect();
  const post = await Post.findOne({ id }).lean();

  if (!post) {
    notFound();
  }

  const article = {
    title: post.title,
    date: new Date(post.date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    author: post.author || "ARHAM GANGWAL",
    readingTime: post.readingTime || "3 MIN READ",
    categories: post.categories || ["IDEAS & NOTES"],
    content: post.content as ArticleSection[],
  };

  const engagement = await getEngagement(id);

  const articleUrl =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
      ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/blogs/${encodeURIComponent(id)}`
      : `/blogs/${encodeURIComponent(id)}`;

  return (
    <main className="article-page min-h-screen bg-transparent font-sans text-[var(--ink)]">
      <div className="mx-auto my-4 min-h-[calc(100vh-2rem)] max-w-[1800px] overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--page)] shadow-xl [html.light_&]:w-[calc(100%-2rem)] sm:[html.light_&]:my-8 sm:[html.light_&]:w-[calc(100%-4rem)] lg:[html.light_&]:my-10 lg:[html.light_&]:w-[calc(100%-5rem)]">
        <style>{`
          .article-page .article-header-controls > span,
          .article-page .article-header-controls > a,
          .article-page .article-header-controls > div > button {
            border-color: var(--line);
            background-color: var(--surface);
            color: var(--accent);
          }

          .article-page .article-header-controls > div > div {
            border-color: var(--line);
            background-color: var(--surface);
            color: var(--ink);
          }

          .article-page .article-header-controls > div > div p {
            color: var(--muted);
          }

          .article-page .article-header-controls > div > div p:first-child {
            color: var(--ink);
          }

          .article-page .article-header-controls > div > div button {
            border-color: var(--line);
            color: var(--accent);
          }

          .article-page .article-share-controls button,
          .article-page .article-engagement-theme #engagement button {
            border-color: var(--line);
            color: var(--accent);
          }

          .article-page .article-share-controls button:hover,
          .article-page .article-engagement-theme #engagement button:hover {
            border-color: var(--accent);
            background-color: var(--accent);
            color: var(--accent-ink);
          }

          .article-page .article-engagement-theme #engagement {
            border-color: var(--line);
          }

          .article-page .article-engagement-theme #engagement p,
          .article-page .article-engagement-theme #engagement h2,
          .article-page .article-engagement-theme #engagement time {
            color: var(--muted);
          }

          .article-page .article-engagement-theme #engagement h3 {
            color: var(--accent);
          }

          .article-page .article-engagement-theme #engagement label {
            color: var(--muted);
          }

          .article-page .article-engagement-theme #engagement button[aria-pressed="true"] {
            border-color: var(--accent);
            background-color: var(--accent);
            color: var(--accent-ink);
          }

          .article-page .article-engagement-theme #engagement textarea {
            border-color: var(--line);
            background-color: var(--surface);
            color: var(--ink);
          }

          .article-page .article-engagement-theme #engagement textarea::placeholder {
            color: var(--muted);
            opacity: 0.75;
          }

          .article-page .article-engagement-theme #engagement .divide-y {
            border-color: var(--line);
          }

          .article-page .article-engagement-theme #engagement article p {
            color: var(--ink);
          }
        `}</style>
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
              className="bg-[var(--accent)] px-3 py-2 text-[var(--accent-ink)] hover:brightness-110"
            >
              [B] BLOG
            </Link>

            <Link
              href="/"
              className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] hover:brightness-110"
            >
              [E] EVENTS
            </Link>

            <Link
              href="/about"
              className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] hover:brightness-110"
            >
              [D] DOCS
            </Link>

            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] hover:brightness-110"
            >
              [Y] YOUTUBE
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] hover:brightness-110"
            >
              [G] GITHUB
            </a>

            <Link
              href="/about"
              className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] hover:brightness-110"
            >
              [M] PROJECTS
            </Link>

            <Link
              href="/about"
              className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] hover:brightness-110"
            >
              [U] ABOUT
            </Link>
          </nav>

          <div className="article-header-controls flex gap-2 font-mono text-[10px] sm:text-xs">
            <ThemeToggle />

            <ProfileMenu />

            <Link
              href="/signin"
              className="bg-[var(--surface)] px-3 py-2 text-[var(--accent)] hover:brightness-110"
            >
              [C] CONSOLE
            </Link>
          </div>
        </header>

        {/* Article title */}
        <section className="relative border-b border-[var(--line)] px-5 py-12 sm:px-8 sm:py-16">
          <div className="pointer-events-none absolute inset-0 grid grid-cols-4 grid-rows-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className="flex items-start justify-start border-r border-[var(--line)]/40 p-2 text-xs text-[var(--muted)]"
              >
                +
              </div>
            ))}
          </div>

          <div className="relative flex items-start justify-between gap-6">
            <h1 className="max-w-[1250px] break-words text-5xl font-normal leading-[0.98] tracking-[-0.065em] text-[var(--ink)] sm:text-7xl lg:text-[112px]">
              {article.title}
            </h1>

            <span className="hidden shrink-0 rounded-full border border-[var(--highlight)] px-3 py-2 font-mono text-xs text-[var(--highlight)] sm:block">
              DEV
            </span>
          </div>

          <p className="relative mt-6 font-mono text-xs tracking-[0.2em] text-[var(--muted)]">
            / ARHAM GANGWAL — PERSONAL BLOG
          </p>
        </section>

        {/* Metadata and article */}
        <section className="grid grid-cols-1 gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[28%_minmax(0,1fr)] lg:gap-16">
          <aside>
            <h2 className="border-b border-[var(--line)] pb-2 font-mono text-xs text-[var(--muted)]">
              / METADATA
            </h2>

            <div className="divide-y divide-dotted divide-[var(--line)] font-mono text-[11px] sm:text-xs">
              <div className="flex items-start justify-between gap-3 py-4">
                <span className="text-[var(--date)]">DATE:</span>
                <span className="text-right text-[var(--muted)]">
                  {article.date}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 py-4">
                <span className="text-[var(--date)]">AUTHOR:</span>
                <span className="text-right text-[var(--muted)]">
                  {article.author}
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 py-4">
                <span className="text-[var(--date)]">READING TIME:</span>
                <span className="text-right text-[var(--muted)]">
                  {article.readingTime}
                </span>
              </div>

              <div className="py-4">
                <p className="mb-3 text-[var(--date)]">CATEGORIES:</p>
                <div className="flex flex-wrap gap-2">
                  {article.categories.map((category: string) => (
                    <span
                      key={category}
                      className="border border-dashed border-[var(--line)] px-2 py-1 text-[var(--muted)]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="py-4">
                <p className="mb-3 text-[var(--date)]">SHARE:</p>
                <div className="article-share-controls flex flex-wrap gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-[var(--accent)] px-4 py-2 text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
                  >
                    Twitter / X
                  </a>

                  <CopyLinkButton />
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="mt-6 inline-block font-mono text-xs text-[var(--accent)] hover:brightness-110"
            >
              ← BACK TO BLOG
            </Link>
          </aside>

          <article className="min-w-0">
            <h2 className="border-b border-[var(--line)] pb-2 font-mono text-xs text-[var(--muted)]">
              / ARTICLE
            </h2>

            <div className="max-w-[850px] space-y-7 py-5 text-base leading-[1.65] text-[var(--ink)] sm:text-lg">
              {article.content.map((section, index) => (
                <section key={index} className="space-y-4">
                  {section.heading && (
                    <h2 className="pt-2 text-2xl font-medium tracking-tight text-[var(--ink)] sm:text-3xl">
                      {section.heading}
                    </h2>
                  )}

                  {(section.paragraphs ?? []).map(
                    (paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ),
                  )}
                </section>
              ))}
            </div>

            <div className="mt-8 border-t border-[var(--line)] py-6">
              <p className="font-mono text-xs text-[var(--muted)]">
                / END OF ARTICLE
              </p>

              <Link
                href="/"
                className="mt-4 inline-block border border-[var(--accent)] px-5 py-3 font-mono text-xs text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
              >
                VIEW ALL POSTS →
              </Link>
            </div>

            {/* Like, comment and share */}
            <div className="article-engagement-theme">
              <ArticleEngagement
                postId={id}
                articleUrl={articleUrl}
                initialLikeCount={engagement.likeCount}
                initialLiked={engagement.liked}
                initialComments={engagement.comments}
              />
            </div>
          </article>
        </section>

        {/* Footer */}
        <footer className="mx-4 mt-4 grid grid-cols-1 gap-6 border-t border-[var(--line)] py-8 sm:mx-8 sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs tracking-wider text-[var(--ink)]">
              + &nbsp; A BLOG BY ARHAM GANGWAL
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Notes, projects, technology and everything in between.
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-mono text-xs text-[var(--muted)]">
              DESIGNED TO DOCUMENT THE PROCESS.
            </p>
            <p className="mt-3 font-mono text-xs text-[var(--accent)]">
              JAIPUR, INDIA
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function BlogArticleFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--page)] font-mono text-sm text-[var(--muted)]">
      Loading article...
    </main>
  );
}

export default function BlogArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<BlogArticleFallback />}>
      <BlogArticle params={params} />
    </Suspense>
  );
}
