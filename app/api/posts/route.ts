
import { NextResponse } from "next/server";
import Post from "@/lib/PostModel";
import Category from "@/lib/CategoryModel";
import dbConnect from "@/lib/mongoose";

export async function GET() {
  try {
    await dbConnect();

    const [posts, categories] = await Promise.all([
      Post.find()
        .sort({ date: -1 })
        .select("id title date categories")
        .lean(),
      Category.find().sort({ name: 1 }).select("name").lean(),
    ]);

    return NextResponse.json(
      {
        posts: posts.map((post) => ({
          id: post.id,
          title: post.title,
          date: new Date(post.date)
            .toLocaleDateString("en-CA")
            .replace(/-/g, "."),
          href: `/blogs/${encodeURIComponent(post.id)}`,
          categories: post.categories ?? [],
        })),
        categories: categories.map((category) => category.name),
      },
    );
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
