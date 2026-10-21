
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  addComment,
  toggleLike,
} from "@/app/blogs/actions";

type CommentItem = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

type ArticleEngagementProps = {
  postId: string;
  articleUrl: string;
  initialLikeCount: number;
  initialLiked: boolean;
  initialComments: CommentItem[];
};

export default function ArticleEngagement({
  postId,
  articleUrl,
  initialLikeCount,
  initialLiked,
  initialComments,
}: ArticleEngagementProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLiked);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    setMessage("");

    startTransition(async () => {
      try {
        const result = await toggleLike(postId);
        setLiked(result.liked);
        setLikeCount(result.likeCount);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not update your like.",
        );
      }
    });
  }

  function handleComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const comment = await addComment(postId, commentText);
        setComments((current) => [comment, ...current]);
        setCommentText("");
        setMessage("Comment posted.");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not post your comment.",
        );
      }
    });
  }

  async function handleShare() {
    setShareMessage("");

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: document.title,
          url: articleUrl,
        });
        setShareMessage("Share menu opened.");
      } else {
        await navigator.clipboard.writeText(articleUrl);
        setShareMessage("Article link copied.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      try {
        await navigator.clipboard.writeText(articleUrl);
        setShareMessage("Article link copied.");
      } catch {
        setShareMessage("Could not share automatically. Copy the page URL from your browser.");
      }
    }
  }

  return (
    <section
      id="engagement"
      className="mt-8 border-t border-[#36546a] py-7"
    >
      <p className="mb-5 font-mono text-xs tracking-wider text-[#83a7c3]">
        / READER ENGAGEMENT
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleLike}
          disabled={isPending}
          aria-pressed={liked}
          className={`border px-4 py-3 font-mono text-xs transition disabled:opacity-50 ${
            liked
              ? "border-[#73dfd0] bg-[#73dfd0] text-[#05202b]"
              : "border-[#36546a] text-[#73dfd0] hover:border-[#73dfd0]"
          }`}
        >
          {liked ? "♥ LIKED" : "♡ LIKE"} ({likeCount})
        </button>

        <button
          type="button"
          onClick={() =>
            document.getElementById("comment-input")?.focus()
          }
          className="border border-[#36546a] px-4 py-3 font-mono text-xs text-[#83a7c3] transition hover:border-[#73dfd0] hover:text-[#73dfd0]"
        >
          COMMENT ({comments.length})
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="border border-[#36546a] px-4 py-3 font-mono text-xs text-[#83a7c3] transition hover:border-[#73dfd0] hover:text-[#73dfd0]"
        >
          ↗ SHARE
        </button>
      </div>

      {message && (
        <p
          role="status"
          className="mt-4 text-sm text-[#73dfd0]"
        >
          {message}
          {message.toLowerCase().includes("sign in") && (
            <>
              {" "}
              <Link
                href="/signin"
                className="underline underline-offset-4"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      )}

      {shareMessage && (
        <p role="status" className="mt-3 text-xs text-[#83a7c3]">
          {shareMessage}
        </p>
      )}

      <div className="mt-9">
        <h2 className="mb-5 font-mono text-sm text-[#83a7c3]">
          / COMMENTS ({comments.length})
        </h2>

        <form onSubmit={handleComment} className="space-y-3">
          <label
            htmlFor="comment-input"
            className="block font-mono text-xs text-[#70a8ff]"
          >
            JOIN THE DISCUSSION
          </label>

          <textarea
            id="comment-input"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Write a thoughtful comment..."
            maxLength={2000}
            rows={4}
            required
            className="w-full resize-y border border-[#36546a] bg-[#061f30] p-4 text-sm text-[#c4cedd] outline-none placeholder:text-[#52748c] focus:border-[#73dfd0]"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[10px] text-[#52748c]">
              {commentText.length}/2000
            </span>

            <button
              type="submit"
              disabled={isPending || !commentText.trim()}
              className="border border-[#73dfd0] px-5 py-3 font-mono text-xs text-[#73dfd0] transition hover:bg-[#73dfd0] hover:text-[#05202b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "PLEASE WAIT..." : "POST COMMENT →"}
            </button>
          </div>
        </form>

        <div className="mt-8 divide-y divide-[#244458]">
          {comments.length === 0 ? (
            <p className="py-6 text-sm text-[#83a7c3]">
              No comments yet. Start the conversation.
            </p>
          ) : (
            comments.map((comment) => (
              <article key={comment.id} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-medium text-[#73dfd0]">
                    {comment.authorName}
                  </h3>
                  <time
                    dateTime={comment.createdAt}
                    className="font-mono text-[10px] text-[#52748c]"
                  >
                    {new Date(comment.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </time>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#c4cedd]">
                  {comment.text}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
