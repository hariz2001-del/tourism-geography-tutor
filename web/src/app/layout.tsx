import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
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
  description: "Learn from approved Tourism Geography course material.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F6F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1417" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${sourceSerif.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
