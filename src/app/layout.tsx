import type { Metadata } from "next";
import { PasswordGate } from "@/components/password-gate";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = JetBrains_Mono({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rift Operations | LoL Team Platform",
  description:
    "League of Legends team platform for champion pools, synergy tracking, scrim results, and analytics dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <head>
        {/* Prevent flash of unstyled content: apply dark class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <PasswordGate>{children}</PasswordGate>
      </body>
    </html>
  );
}

