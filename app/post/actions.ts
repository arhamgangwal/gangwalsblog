
"use server";

import { randomUUID } from "crypto";
import Post from "@/lib/PostModel";
import dbConnect from "@/lib/mongoose";
import { initAuth } from "@/lib/auth";
import { headers } from "next/headers";

export interface PostType {
  id: string;
  date: Date;
  title: string;
  author: string;
  readingTime: string;
  categories: string[];
  content: {
    heading?: string;
    paragraphs: string[];
  }[];
}

export async function postBlog(
  post: Omit<PostType, "id" | "date"> & {
    id?: string;
    date?: Date;
  },
) {
  try {
  const auth = await initAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    session.user.email?.toLowerCase() !== "arhamgangwal@gmail.com"
  ) {
    throw new Error("Unauthorized: only the admin can publish posts.");
  }

  await dbConnect();

    const title = post.title?.trim();
    const author = post.author?.trim();
    const readingTime = post.readingTime?.trim();

    const categories = [
      ...new Set(
        (post.categories ?? [])
          .map((category) => category.trim())
          .filter(Boolean),
      ),
    ];

    const content = (post.content ?? [])
      .map((section) => ({
        heading: section.heading?.trim() ?? "",
        paragraphs: (section.paragraphs ?? [])
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
      }))
      .filter(
        (section) =>
          section.heading.length > 0 || section.paragraphs.length > 0,
      );

    if (!title) throw new Error("A blog title is required.");
    if (!author) throw new Error("An author is required.");
    if (!readingTime) throw new Error("Reading time is required.");

    if (categories.length === 0) {
      throw new Error("Choose at least one category.");
    }

    if (content.length === 0) {
      throw new Error("A blog must contain at least one section.");
    }

    const newPost = await Post.create({
      id: post.id?.trim() || randomUUID(),
      date: post.date ?? new Date(),
      title,
      author,
      readingTime,
      categories,
      content,
    });

    console.log("Blog saved to MongoDB:", newPost.id);

    return {
      success: true,
      id: newPost.id,
      title: newPost.title,
    };
  } catch (error) {
    console.error("Failed to save blog to MongoDB:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to save the blog to MongoDB.",
    );
  }
}
