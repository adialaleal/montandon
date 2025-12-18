import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Montandon",
  description: "Prospecting & Messaging App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <header className="border-b bg-background">
              <div className="flex h-16 items-center px-6 gap-6">
                <Link href="/" className="font-bold text-lg">Montandon</Link>
                <nav className="flex items-center gap-4 text-sm font-medium">
                  <Link href="/search" className="transition-colors hover:text-primary">Search</Link>
                  <Link href="/contacts" className="transition-colors hover:text-primary">Contacts</Link>
                  <Link href="/templates" className="transition-colors hover:text-primary">Templates</Link>
                  <Link href="/campaigns" className="transition-colors hover:text-primary">Campaigns</Link>
                  <Link href="/logs" className="transition-colors hover:text-primary">Logs</Link>
                </nav>
              </div>
            </header>
            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
