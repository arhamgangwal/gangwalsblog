
"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function Nav() {
  console.log("NAV COMPONENT RENDERED");
  const { data: session, isPending } = authClient.useSession();
  useEffect(() => {
  console.log("NAV SESSION:", session);
  console.log("SESSION CHECK PENDING:", isPending);
}, [session, isPending]);

  const isAdmin =
    session?.user?.email === "arhamgangwal@gmail.com";

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleLogout = async () => {
    const result = await authClient.signOut();

    if (result.error) {
      console.error("Logout failed:", result.error);
      return;
    }

    setProfileOpen(false);
    router.replace("/");
    router.refresh();
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <nav className="flex flex-wrap items-center gap-4 font-mono text-sm">
      <Link
        href="/"
        className="text-[#c4cedd] transition hover:text-[#73dfd0]"
      >
        Home
      </Link>

      <Link
        href="/"
        className="text-[#c4cedd] transition hover:text-[#73dfd0]"
      >
        Blogs
      </Link>

      {isAdmin && (
        <Link
          href="/post"
          className="bg-[#73dfd0] px-3 py-2 text-[#05202b] transition hover:bg-[#a0f0e4]"
        >
          [+] Add Blog
        </Link>
      )}

      <Link
        href="/about"
        className="text-[#c4cedd] transition hover:text-[#73dfd0]"
      >
        About
      </Link>

      
{isPending ? (
  <span className="text-[#8295a8]">Checking...</span>
) : session ? (
  <div className="relative" ref={profileRef}>
    <button
      type="button"
      onClick={() => setProfileOpen((open) => !open)}
      aria-label="Open user profile"
      aria-expanded={profileOpen}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#29475c] bg-[#0b2a3c] text-[#73dfd0] transition hover:border-[#73dfd0] hover:bg-[#12394b]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </svg>
    </button>

    {profileOpen && (
      <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-[#29475c] bg-[#061f30] p-4 shadow-xl">
        <p className="text-xs uppercase tracking-widest text-[#8295a8]">
          Signed in as
        </p>

        <p className="mt-2 break-words font-sans text-sm font-semibold text-[#e5edf5]">
          {session.user.name || "User"}
        </p>

        <p className="mt-1 break-words font-sans text-sm text-[#a9bacb]">
          {session.user.email}
        </p>

        {isAdmin && (
          <p className="mt-3 text-xs text-[#73dfd0]">
            Administrator
          </p>
        )}

        <div className="my-4 border-t border-[#29475c]" />

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-md border border-[#29475c] px-3 py-2 text-left text-sm text-[#c4cedd] transition hover:border-[#73dfd0] hover:bg-[#0b2a3c] hover:text-[#73dfd0]"
        >
          Log out →
        </button>
      </div>
    )}
  </div>
) : (
  <Link
    href="/signin"
    className="text-[#c4cedd] transition hover:text-[#73dfd0]"
  >
    Sign in
  </Link>
)}

    </nav>
  );
}

export default Nav;
