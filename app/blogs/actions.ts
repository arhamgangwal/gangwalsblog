
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongoose";
import { initAuth } from "@/lib/auth";
import Post from "@/lib/PostModel";
import Like from "@/lib/LikeModel";
import Comment from "@/lib/CommentModel";

async function getSignedInUser() {
  const auth = await initAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Please sign in to continue.");
  }

  return session.user;
}

async function validatePost(postId: string) {
  if (
    typeof postId !== "string" ||
    postId.trim().length === 0 ||
    postId.length > 200
  ) {
    throw new Error("Invalid post ID.");
  }

  const post = await Post.findOne({ id: postId }).select("id").lean();

  if (!post) {
    throw new Error("Post not found.");
  }

  return postId;
}

export async function toggleLike(postId: string) {
  const user = await getSignedInUser();

  await dbConnect();
  await validatePost(postId);

  const existingLike = await Like.findOne({
    postId,
    userId: user.id,
  });

  let liked: boolean;

  if (existingLike) {
    await Like.deleteOne({ _id: existingLike._id });
    liked = false;
  } else {
    try {
      await Like.create({
        postId,
        userId: user.id,
      });
      liked = true;
    } catch (error: unknown) {
      // Another request may have created the like first.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        liked = true;
      } else {
        throw error;
      }
    }
  }

  const likeCount = await Like.countDocuments({ postId });

  revalidatePath(`/blogs/${encodeURIComponent(postId)}`);

  return { liked, likeCount };
}

export async function addComment(postId: string, text: string) {
  const user = await getSignedInUser();

  if (typeof text !== "string") {
    throw new Error("Please enter a valid comment.");
  }

  const cleanedText = text.trim();

  if (!cleanedText || cleanedText.length > 2000) {
    throw new Error("Comments must contain 1–2000 characters.");
  }

  await dbConnect();
  await validatePost(postId);

  const comment = await Comment.create({
    postId,
    userId: user.id,
    authorName: user.name?.trim().slice(0, 100) || "Reader",
    text: cleanedText,
  });

  revalidatePath(`/blogs/${encodeURIComponent(postId)}`);

  return {
    id: comment._id.toString(),
    authorName: comment.authorName,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
  };
}

export async function getEngagement(postId: string) {
  await dbConnect();
  await validatePost(postId);

  const [likeCount, comments, user] = await Promise.all([
    Like.countDocuments({ postId }),
    Comment.find({ postId })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("authorName text createdAt")
      .lean(),
    getCurrentUser(),
  ]);

  const liked = user
    ? Boolean(await Like.exists({ postId, userId: user.id }))
    : false;

  return {
    likeCount,
    liked,
    comments: comments.map((comment) => ({
      id: comment._id.toString(),
      authorName: comment.authorName,
      text: comment.text,
      createdAt: new Date(comment.createdAt).toISOString(),
    })),
  };
}

async function getCurrentUser() {
  const auth = await initAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}
