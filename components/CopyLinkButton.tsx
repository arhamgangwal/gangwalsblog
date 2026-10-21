"use client";

export default function CopyLinkButton() {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
      }}
      className="rounded-full border border-[#73dfd0] px-4 py-2 text-[#73dfd0] transition hover:bg-[#73dfd0] hover:text-[#05202b]"
    >
      Copy link
    </button>
  );
}
