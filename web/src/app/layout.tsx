import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import SiteHeader from "@/components/site-header";
import TutorWidget from "@/components/tutor/tutor-widget";
import { getProfile } from "@/lib/auth/session";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"], display: "swap", variable: "--font-source-sans",
});
const sourceSerif = Source_Serif_4({
  subsets: ["latin"], display: "swap", variable: "--font-source-serif",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Tourism Geography Tutor",
  description: "Learn Tourism Geography through clear explanations, practice questions, and guided review.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F8FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1320" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  return (
    <html lang="en" suppressHydrationWarning className={`${sourceSans.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
      <Script id="theme-preference" strategy="beforeInteractive">
        {`try{var t=localStorage.getItem("tgt-theme");document.documentElement.dataset.theme=t==="light"||t==="dark"?t:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){document.documentElement.dataset.theme="light"}`}
      </Script>
      <body>
        <a
          className="fixed -top-24 left-3 z-50 rounded-card bg-ink-strong px-4 py-3 font-medium text-chart transition-[top] focus:top-3"
          href="#main-content"
        >
          Skip to main content
        </a>
        <SiteHeader profile={profile} />
        <div id="main-content" tabIndex={-1}>{children}</div>
        <TutorWidget />
      </body>
    </html>
  );
}
