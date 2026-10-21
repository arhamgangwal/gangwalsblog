
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ProfileMenu() {
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleLogout() {
    const result = await authClient.signOut();

    if (result.error) {
      console.error("Logout failed:", result.error);
      return;
    }

    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  if (isPending) {
    return (
      <span className="bg-[#092b3b] px-3 py-2 text-[#71d9d1]">
        Checking...
      </span>
    );
  }

  if (!session) {
    return (
      <Link
        href="/signin"
        className="bg-[#092b3b] px-3 py-2 text-[#71d9d1] hover:bg-[#104254]"
      >
        [S] SIGN IN
      </Link>
    );
  }

  const name = session.user.name || "User";
  const email = session.user.email || "";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#73dfd0] bg-[#092b3b] font-mono text-sm text-[#73dfd0] hover:bg-[#104254]"
      >
        {name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 border border-[#244458] bg-[#031b2b] p-4 shadow-xl">
          <p className="font-mono text-sm text-[#c4cedd]">{name}</p>
          <p className="mt-1 break-all text-xs text-[#83a7c3]">
            {email}
          </p>

          {email === "arhamgangwal@gmail.com" && (
            <p className="mt-3 font-mono text-xs text-[#73dfd0]">
              Administrator
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full border border-[#36546a] px-3 py-2 text-left font-mono text-xs text-[#71d9d1] hover:bg-[#092b3b]"
          >
            LOG OUT
          </button>
        </div>
      )}
    </div>
  );
}
