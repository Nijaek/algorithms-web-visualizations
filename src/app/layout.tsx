import type { Metadata } from "next";
import { Space_Grotesk, Fira_Code } from "next/font/google";
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Interactive Algorithm Playground | nijae.dev",
  description:
    "Visualize sorting, pathfinding, graph, data structure, and machine learning algorithms with step-by-step animations.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${firaCode.variable}`}
    >
      <body className="bg-surface-0 font-display text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
