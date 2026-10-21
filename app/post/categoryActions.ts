
"use server";

import { randomUUID } from "crypto";
import { initAuth } from "@/lib/auth";
import Category from "@/lib/CategoryModel";
import Post from "@/lib/PostModel";
import dbConnect from "@/lib/mongoose";
import { headers } from "next/headers";

const ADMIN_EMAIL = "arhamgangwal@gmail.com";

async function requireAdmin() {
  const auth = await initAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  ) {
    throw new Error("You are not authorized to manage categories.");
  }
}

function makeSlug(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getCategories() {
  await dbConnect();

  const categories = await Category.find()
    .sort({ name: 1 })
    .select("name slug")
    .lean();

  return categories.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
  }));
}

export async function createCategory(name: string) {
  await requireAdmin();
  await dbConnect();

  const cleanName = name.trim().replace(/\s+/g, " ");

  if (!cleanName) {
    throw new Error("Enter a category name.");
  }

  if (cleanName.length > 50) {
    throw new Error("Category names must be 50 characters or fewer.");
  }

  const slug = makeSlug(cleanName);

  if (!slug) {
    throw new Error("Use a category name containing letters or numbers.");
  }

  const existing = await Category.findOne({
    $or: [
      { name: { $regex: `^${escapeRegex(cleanName)}$`, $options: "i" } },
      { slug },
    ],
  }).lean();

  if (existing) {
    throw new Error("That category already exists.");
  }

  const category = await Category.create({
    name: cleanName,
    slug,
  });

  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
  };
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  await dbConnect();

  if (!/^[a-f\d]{24}$/i.test(categoryId)) {
    throw new Error("Invalid category.");
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new Error("Category not found.");
  }

  const inUse = await Post.exists({
    categories: {
      $in: [category.name],
    },
  });

  if (inUse) {
    throw new Error(
      "This category is used by a blog post. Remove it from those posts first.",
    );
  }

  await Category.deleteOne({ _id: category._id });

  return { success: true };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
