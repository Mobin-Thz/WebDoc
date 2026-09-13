import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./styles.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"),
  title: { default: "WebDoc", template: "%s | WebDoc" },
  description: "Clear, structured lessons for technical learners.",
};

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          <main id="main">{children}</main>
          <footer className="site-footer">
            <p>Copyright {new Date().getFullYear()} WebDoc - Built for focused learning.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
