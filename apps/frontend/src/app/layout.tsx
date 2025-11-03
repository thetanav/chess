import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess",
  description: "Multiplayer Chess game",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={
          inter.className +
          " bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-white w-full min-h-screen antialiased"
        }>
        <NextTopLoader
          color="#eab308"
          height={3}
          crawlSpeed={100}
          showSpinner={false}
          shadow="0 0 10px #eab308, 0 0 5px #eab308"
        />
        <Toaster position="top-right" reverseOrder={true} />
        {children}
      </body>
    </html>
  );
}
