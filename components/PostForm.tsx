
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { postBlog } from "@/app/post/actions";
import {
  createCategory,
  getCategories,
} from "@/app/post/categoryActions";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

function estimateReadingTime(sections: ArticleSection[]) {
  const words = sections
    .flatMap((section) => [section.heading, ...section.paragraphs])
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

export default function PostForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("ARHAM GANGWAL");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [readingTime, setReadingTime] = useState("");
  const [customReadingTime, setCustomReadingTime] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [sections, setSections] = useState<ArticleSection[]>([
    { heading: "", paragraphs: [""] },
  ]);

  const [message, setMessage] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [pending, startTransition] = useTransition();

  const estimatedMinutes = estimateReadingTime(sections);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const result = await getCategories();

        if (active) {
          setCategories(result);
        }
      } catch {
        if (active) {
          setMessage("Could not load categories. Try refreshing the page.");
        }
      } finally {
        if (active) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!customReadingTime) {
      setReadingTime(`${estimatedMinutes} MIN READ`);
    }
  }, [estimatedMinutes, customReadingTime]);

  function toggleCategory(name: string) {
    setSelectedCategories((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  function addSection() {
    setSections((current) => [
      ...current,
      { heading: "", paragraphs: [""] },
    ]);
  }

  function removeSection(index: number) {
    setSections((current) => current.filter((_, i) => i !== index));
  }

  function updateSection(
    index: number,
    field: "heading",
    value: string,
  ) {
    setSections((current) =>
      current.map((section, i) =>
        i === index ? { ...section, [field]: value } : section,
      ),
    );
  }

  function updateParagraph(
    sectionIndex: number,
    paragraphIndex: number,
    value: string,
  ) {
    setSections((current) =>
      current.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              paragraphs: section.paragraphs.map((paragraph, j) =>
                j === paragraphIndex ? value : paragraph,
              ),
            }
          : section,
      ),
    );
  }

  function addParagraph(sectionIndex: number) {
    setSections((current) =>
      current.map((section, i) =>
        i === sectionIndex
          ? { ...section, paragraphs: [...section.paragraphs, ""] }
          : section,
      ),
    );
  }

  function removeParagraph(sectionIndex: number, paragraphIndex: number) {
    setSections((current) =>
      current.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              paragraphs: section.paragraphs.filter(
                (_, j) => j !== paragraphIndex,
              ),
            }
          : section,
      ),
    );
  }

  function handleAddCategory() {
    const cleanName = newCategory.trim();

    if (!cleanName) return;

    setMessage("");

    startTransition(async () => {
      try {
        const category = await createCategory(cleanName);

        setCategories((current) => {
          const exists = current.some((item) => item.id === category.id);
          return exists
            ? current
            : [...current, category].sort((a, b) =>
                a.name.localeCompare(b.name),
              );
        });

        setSelectedCategories((current) =>
          current.includes(category.name)
            ? current
            : [...current, category.name],
        );

        setNewCategory("");
        setMessage(`Added category: ${category.name}`);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not add category.",
        );
      }
    });
  }

  function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanSections = sections
      .map((section) => ({
        heading: section.heading.trim(),
        paragraphs: section.paragraphs
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
      }))
      .filter(
        (section) =>
          section.heading.length > 0 || section.paragraphs.length > 0,
      );

    if (!title.trim()) {
      setMessage("Enter a title.");
      return;
    }

    if (!author.trim()) {
      setMessage("Enter an author.");
      return;
    }

    if (selectedCategories.length === 0) {
      setMessage("Select at least one category.");
      return;
    }

    if (cleanSections.length === 0) {
      setMessage("Add at least one heading or paragraph.");
      return;
    }

    startTransition(async () => {
      try {
        await postBlog({
          title: title.trim(),
          author: author.trim(),
          date: new Date(`${date}T12:00:00`),
          readingTime: readingTime.trim(),
          categories: selectedCategories,
          content: cleanSections,
        });

        setMessage("Blog published successfully!");
        router.push("/");
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not publish the blog.",
        );
      }
    });
  }

  const inputClass =
    "w-full border border-[#36546a] bg-[#092b3b] px-4 py-3 text-sm text-[#c4cedd] outline-none placeholder:text-[#66859b] focus:border-[#73dfd0]";

  const labelClass =
    "mb-2 block font-mono text-xs tracking-wide text-[#83a7c3]";

  return (
    <form
      onSubmit={handlePublish}
      className="space-y-8 border border-[#17374b] bg-[#031b2b] p-5 text-[#c4cedd] sm:p-8"
    >
      <div className="border-b border-[#36546a] pb-5">
        <p className="font-mono text-xs tracking-widest text-[#73dfd0]">
          / CONTENT CONSOLE
        </p>
        <h1 className="mt-3 text-3xl text-[#7897b1] sm:text-4xl">
          Create a blog post
        </h1>
        <p className="mt-2 text-sm text-[#83a7c3]">
          Write, organize and publish your next article.
        </p>
      </div>

      {/* Basic details */}
      <section className="space-y-5">
        <h2 className="font-mono text-xs text-[#73dfd0]">
          01 / POST DETAILS
        </h2>

        <div>
          <label className={labelClass} htmlFor="post-title">
            TITLE *
          </label>
          <input
            id="post-title"
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your article a title"
            maxLength={180}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="post-author">
              AUTHOR *
            </label>
            <input
              id="post-author"
              className={inputClass}
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="post-date">
              PUBLICATION DATE *
            </label>
            <input
              id="post-date"
              type="date"
              className={inputClass}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="reading-time">
            READING TIME
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="reading-time"
              className={inputClass}
              value={readingTime}
              onChange={(event) => {
                setCustomReadingTime(true);
                setReadingTime(event.target.value);
              }}
              placeholder="e.g. 5 MIN READ"
              maxLength={40}
              required
            />
            <button
              type="button"
              onClick={() => setCustomReadingTime(false)}
              className="shrink-0 border border-[#36546a] px-4 py-3 font-mono text-xs text-[#73dfd0] hover:border-[#73dfd0]"
            >
              AUTO: {estimatedMinutes} MIN
            </button>
          </div>
          <p className="mt-2 text-xs text-[#66859b]">
            Estimated at 200 words per minute. You can override it.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4 border-t border-[#36546a] pt-6">
        <h2 className="font-mono text-xs text-[#73dfd0]">
          02 / CATEGORIES *
        </h2>

        {loadingCategories ? (
          <p className="text-sm text-[#83a7c3]">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-[#ffc26e]">
            No categories exist yet. Create one below.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected = selectedCategories.includes(category.name);

              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category.name)}
                  className={`border px-3 py-2 text-xs transition ${
                    selected
                      ? "border-[#73dfd0] bg-[#73dfd0] text-[#05202b]"
                      : "border-[#36546a] text-[#b9a0ed] hover:border-[#73dfd0]"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {selectedCategories.length > 0 && (
          <p className="text-xs text-[#83a7c3]">
            Selected: {selectedCategories.join(", ")}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className={inputClass}
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Create a new category"
            maxLength={50}
            aria-label="New category name"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            disabled={pending || !newCategory.trim()}
            className="shrink-0 border border-[#73dfd0] px-5 py-3 font-mono text-xs text-[#73dfd0] hover:bg-[#73dfd0] hover:text-[#05202b] disabled:opacity-50"
          >
            + CREATE CATEGORY
          </button>
        </div>

        <p className="text-xs text-[#66859b]">
          Click a category to select or deselect it. New categories are saved
          to MongoDB and selected automatically.
        </p>

        <a
          href="/post/categories"
          className="inline-block font-mono text-xs text-[#73dfd0] hover:text-[#a0f0e4]"
        >
          MANAGE ALL CATEGORIES →
        </a>
      </section>

      {/* Article builder */}
      <section className="space-y-5 border-t border-[#36546a] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono text-xs text-[#73dfd0]">
            03 / ARTICLE CONTENT *
          </h2>
          <button
            type="button"
            onClick={addSection}
            className="border border-[#36546a] px-3 py-2 font-mono text-xs text-[#73dfd0] hover:border-[#73dfd0]"
          >
            + ADD SECTION
          </button>
        </div>

        <p className="text-sm text-[#83a7c3]">
          Build the article from sections. Each section can have a heading and
          as many paragraphs as you need.
        </p>

        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="space-y-4 border border-[#36546a] bg-[#061f30] p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-mono text-xs text-[#b9a0ed]">
                SECTION {String(sectionIndex + 1).padStart(2, "0")}
              </h3>

              <button
                type="button"
                onClick={() => removeSection(sectionIndex)}
                disabled={sections.length === 1}
                className="text-xs text-[#ff9eaa] hover:text-[#ffc0c7] disabled:opacity-30"
              >
                REMOVE SECTION
              </button>
            </div>

            <div>
              <label
                className={labelClass}
                htmlFor={`heading-${sectionIndex}`}
              >
                SECTION HEADING (OPTIONAL)
              </label>
              <input
                id={`heading-${sectionIndex}`}
                className={inputClass}
                value={section.heading}
                onChange={(event) =>
                  updateSection(sectionIndex, "heading", event.target.value)
                }
                placeholder="e.g. Why I started this project"
                maxLength={180}
              />
            </div>

            <div className="space-y-4">
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <div key={paragraphIndex}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                      className="font-mono text-[10px] text-[#83a7c3]"
                      htmlFor={`paragraph-${sectionIndex}-${paragraphIndex}`}
                    >
                      PARAGRAPH {paragraphIndex + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        removeParagraph(sectionIndex, paragraphIndex)
                      }
                      disabled={section.paragraphs.length === 1}
                      className="text-[10px] text-[#ff9eaa] disabled:opacity-30"
                    >
                      REMOVE
                    </button>
                  </div>

                  <textarea
                    id={`paragraph-${sectionIndex}-${paragraphIndex}`}
                    className={`${inputClass} min-h-32 resize-y`}
                    value={paragraph}
                    onChange={(event) =>
                      updateParagraph(
                        sectionIndex,
                        paragraphIndex,
                        event.target.value,
                      )
                    }
                    placeholder="Write your paragraph here..."
                    rows={5}
                    maxLength={20000}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => addParagraph(sectionIndex)}
                className="font-mono text-xs text-[#73dfd0] hover:text-[#a0f0e4]"
              >
                + ADD PARAGRAPH
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Publish */}
      <section className="space-y-4 border-t border-[#36546a] pt-6">
        <div className="border border-[#36546a] bg-[#092b3b] p-4">
          <p className="font-mono text-xs text-[#73dfd0]">READY TO PUBLISH</p>
          <p className="mt-2 text-sm text-[#83a7c3]">
            {title.trim() || "Untitled article"} · {selectedCategories.length}{" "}
            categories · {sections.length} sections · {estimatedMinutes} min
            estimated reading time
          </p>
        </div>

        {message && (
          <p aria-live="polite" className="text-sm text-[#ffc26e]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || loadingCategories}
          className="w-full border border-[#73dfd0] bg-[#73dfd0] px-5 py-4 font-mono text-sm text-[#05202b] transition hover:bg-[#a0f0e4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "PUBLISHING..." : "PUBLISH BLOG →"}
        </button>
      </section>
    </form>
  );
}
