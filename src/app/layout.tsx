import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://pupapers.com'),
  title: {
    default: "pupapers.com | Prepare for PU CET Chandigarh",
    template: "%s | pupapers.com"
  },
  description: "The ultimate MCQ practice platform for Panjab University Common Entrance Test. Access mock tests, previous papers, and study materials.",
  keywords: ["PU CET", "Panjab University", "Entrance Exam", "Mock Tests", "MCQ Practice", "Chandigarh University", "Previous Papers"],
  authors: [{ name: "pupapers.com Team" }],
  creator: "pupapers.com",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://pupapers.com",
    title: "pupapers.com | Prepare for PU CET Chandigarh",
    description: "Ace your Panjab University Common Entrance Test with our comprehensive mock tests and study resources.",
    siteName: "pupapers.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "pupapers.com - PU CET Preparation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "pupapers.com | Prepare for PU CET Chandigarh",
    description: "Ace your Panjab University Common Entrance Test with our comprehensive mock tests and study resources.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
