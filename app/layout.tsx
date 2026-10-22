import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const themeInitScript = `(function(){try{var stored=localStorage.getItem("theme");var theme=stored==="light"||stored==="dark"?stored:"dark";var root=document.documentElement;root.classList.remove("light","dark");root.classList.add(theme);}catch(e){document.documentElement.classList.remove("light");document.documentElement.classList.add("dark");}})();`;

export const metadata: Metadata = {
  title: "Arham Gangwal | Blog",
  description: "Notes, projects, technology and everything in between.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={jetBrainsMono.variable}>{children}</body>
    </html>
  );
}
