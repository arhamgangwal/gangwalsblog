
"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "@/app/post/categoryActions";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  async function refreshCategories() {
    setLoading(true);

    try {
      setCategories(await getCategories());
    } catch {
      setMessage("Could not load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshCategories();
  }, []);

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        const category = await createCategory(name);
        setCategories((current) =>
          [...current, category].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        );
        setName("");
        setMessage("Category created successfully.");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not create category.",
        );
      }
    });
  }

  function handleDelete(category: Category) {
    if (!window.confirm(`Delete "${category.name}"?`)) return;

    setMessage("");

    startTransition(async () => {
      try {
        await deleteCategory(category.id);
        setCategories((current) =>
          current.filter((item) => item.id !== category.id),
        );
        setMessage(`Deleted "${category.name}".`);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not delete category.",
        );
      }
    });
  }

  return (
    <section className="space-y-6 border border-[#17374b] bg-[#031b2b] p-5 text-[#c4cedd] sm:p-7">
      <div>
        <p className="font-mono text-xs tracking-widest text-[#73dfd0]">
          / CONTENT SETTINGS
        </p>
        <h2 className="mt-2 text-2xl text-[#7897b1]">
          Category Manager
        </h2>
        <p className="mt-2 text-sm text-[#83a7c3]">
          Create reusable categories for your blog posts. Categories in use
          cannot be deleted until you remove them from those posts.
        </p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. AI & Data Science"
          maxLength={50}
          required
          className="min-w-0 flex-1 border border-[#36546a] bg-[#092b3b] px-4 py-3 text-sm outline-none focus:border-[#73dfd0]"
        />
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="border border-[#73dfd0] px-5 py-3 font-mono text-xs text-[#73dfd0] hover:bg-[#73dfd0] hover:text-[#05202b] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "PLEASE WAIT..." : "+ ADD CATEGORY"}
        </button>
      </form>

      {message && (
        <p aria-live="polite" className="text-sm text-[#73dfd0]">
          {message}
        </p>
      )}

      <div className="border-t border-[#36546a] pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-xs text-[#83a7c3]">
            / SAVED CATEGORIES
          </h3>
          <span className="font-mono text-xs text-[#73dfd0]">
            {categories.length} TOTAL
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-[#83a7c3]">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-[#83a7c3]">
            No categories yet. Add your first one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 border border-[#17374b] bg-[#092b3b] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm text-[#b9a0ed]">
                    {category.name}
                  </p>
                  <p className="mt-1 break-all font-mono text-[10px] text-[#83a7c3]">
                    {category.slug}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  disabled={pending}
                  aria-label={`Delete ${category.name}`}
                  className="shrink-0 border border-[#8f5363] px-3 py-2 font-mono text-[10px] text-[#ff9eaa] hover:bg-[#8f5363]/20 disabled:opacity-50"
                >
                  DELETE
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
