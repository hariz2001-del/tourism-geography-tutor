import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tourism Geography Tutor",
  description: "Learn from approved Tourism Geography course material.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
