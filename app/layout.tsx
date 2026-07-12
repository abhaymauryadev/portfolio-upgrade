import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const SITE_URL = "https://abhaymaurya.vercel.app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Abhay Maurya | Full Stack Developer",
    template: "%s | Abhay Maurya",
  },

  description:
    "Abhay Maurya is a Full Stack MERN Developer & AI Engnieer building fast, scalable, and SEO-optimized web applications with modern UI/UX.",

  applicationName: "Abhay Maurya Portfolio",

  keywords: [
    "Abhay Maurya",
    "Abhay Maurya Developer",
    "Abhay Maurya Portfolio",
    "Full Stack Developer",
    "MERN Stack Developer",
    "Next.js Developer",
    "React.js Developer",
    "Node.js Developer",
    "JavaScript Developer",
    "Next.js App Router Developer",
    "Modern Web Developer",
    "Frontend Engineer",
    "Backend Engineer",
    "Web Performance Optimization",
    "UI UX Developer",
    "UI UX Designer",
    "Modern UI UX Design",
    "Responsive Web Design",
    "Hire Full Stack Developer",
    "Hire Next.js Developer",
    "Freelance Web Developer",
    "Freelance Full Stack Developer",
    "Remote Web Developer",
    "Web Developer India",
    "Full Stack Developer India",
    "MERN Stack Developer India",
    "Next.js Developer India",
    "Web Developer Mumbai",
  ],

  authors: [{ name: "Abhay Maurya", url: SITE_URL }],
  creator: "Abhay Maurya",
  publisher: "Abhay Maurya",

  category: "technology",

  alternates: {
    canonical: SITE_URL,
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "Abhay Maurya | Full Stack Developer & AI Engineer",
    description:
      "Hire a Full Stack Developer & AI Engineerfor high-performance, SEO-friendly, and scalable web applications.",
    url: SITE_URL,
    siteName: "Abhay Maurya Portfolio",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Abhay Maurya – Full Stack0 Developer & AI Engineer",
        type: "image/png",
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
    site: "@theabhaywebdev",
    images: [{ url: "/hero.png", alt: "Abhay Maurya – Full Stack Next.js Developer" }],
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icons/favicon-96x96.png",
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    other: [{ rel: "mask-icon", url: "/icons/favicon.svg" }],
  },

  manifest: "/icons/site.webmanifest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Abhay Maurya",
  },

  // 🔽 Replace with the code Search Console gives you under the "HTML tag" method
  // e.g. <meta name="google-site-verification" content="THIS_PART_ONLY" />
  verification: {
    google: "googlebb8dcfd303bf62ea.html",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Abhay Maurya",
  url: SITE_URL,
  image: `${SITE_URL}/hero.png`,
  jobTitle: "Full Stack Developer",
  description:
    "Full Stack MERN & Next.js Developer building fast, scalable, and SEO-optimized web applications.",
  sameAs: [
    "https://github.com/Abhaymaurya-developer",
    "https://twitter.com/theabhaywebdev",
    "https://linkedin.com/in/abhaymaurya",
  ],
  knowsAbout: [
    "Next.js",
    "React",
    "Node.js",
    "MongoDB",
    "TypeScript",
    "Full Stack Development",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mumbai",
    addressCountry: "IN",
  },
};

// 🔽 Replace with your actual GA4 Measurement ID from GA4 → Admin → Data Streams
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Google Analytics (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
