import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kleeg — AI workspace for real work",
    template: "%s · Kleeg",
  },
  description:
    "Kleeg brings your models, files, and tools together so you can chat, write, translate, and get real work done.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
