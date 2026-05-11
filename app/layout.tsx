import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://abhaymaurya-me.vercel.app"),

  title: {
    default: "Abhay Maurya | Full Stack Next.js Developer in India",
    template: "%s | Abhay Maurya",
  },

  description:
    "Abhay Maurya is a Full Stack MERN & Next.js Developer building fast, scalable, and SEO-optimized web applications with modern UI/UX.",

  keywords: [
    // Personal Brand
    "Abhay Maurya",
    "Abhay Maurya Developer",
    "Abhay Maurya Portfolio",

    // Core Skills
    "Full Stack Developer",
    "MERN Stack Developer",
    "Next.js Developer",
    "React.js Developer",
    "Node.js Developer",
    "JavaScript Developer",

    // Trending Tech
    "Next.js App Router Developer",
    "Modern Web Developer",
    "Frontend Engineer",
    "Backend Engineer",
    "Web Performance Optimization",

    // UI / UX
    "UI UX Developer",
    "UI UX Designer",
    "Modern UI UX Design",
    "Responsive Web Design",

    // Hiring Intent
    "Hire Full Stack Developer",
    "Hire Next.js Developer",
    "Freelance Web Developer",
    "Freelance Full Stack Developer",
    "Remote Web Developer",

    // Location
    "Web Developer India",
    "Full Stack Developer India",
    "MERN Stack Developer India",
    "Next.js Developer India",
    "Web Developer Mumbai",
  ],

  authors: [{ name: "Abhay Maurya" }],
  creator: "Abhay Maurya",

  robots: {
    index: true,
    follow: true,
    maxImagePreview: "large",
    maxSnippet: -1,
    maxVideoPreview: -1,
  },

  openGraph: {
    title: "Abhay Maurya | Full Stack Next.js Developer",
    description:
      "Hire a Full Stack MERN & Next.js Developer for high-performance, SEO-friendly, and scalable web applications.",
    url: "https://abhaymaurya-me.vercel.app",
    siteName: "Abhay Maurya Portfolio",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Abhay Maurya – Full Stack Next.js Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Abhay Maurya | Full Stack Next.js Developer",
    description:
      "Full Stack MERN & Next.js Developer building fast, modern, and SEO-optimized web applications.",
    creator: "@theabhaywebdev",
    images: ["/hero.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      {
        url: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },

  verification: {
    google: "",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
