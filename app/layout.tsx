import React from 'react';
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import ThemeFavicon from "@/components/ThemeFavicon";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { createPrismicClient } from "@/libs/prismicClient";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mathematica.AI",
  description: "Your AI-powered assistant for mathematical computations and insights",
  icons: {
    icon: [
      { url: "/favicon.ico", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.ico", media: "(prefers-color-scheme: dark)" }
    ],
    apple: [
      { url: "/apple-icon.png", media: "(prefers-color-scheme: light)" },
      { url: "/apple-icon-dark.png", media: "(prefers-color-scheme: dark)" }
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon-precomposed.png'
      },
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon-precomposed-dark.png'
      }
    ]
  },
  manifest: '/manifest.json'
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const client = createPrismicClient();
  let headerData = null;
  
  try {
    const headers = await client.getAllByType('header');
    headerData = headers[0] || null;
  } catch (error) {
    console.error("Error fetching header data:", error);
  }

  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/x-icon" href="/favicon-dark.ico" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/apple-icon.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/apple-icon-dark.png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon-precomposed" href="/apple-icon-precomposed.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon-precomposed" href="/apple-icon-precomposed-dark.png" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <Providers session={session}>
          <ThemeFavicon />
          <Header session={session} headerData={headerData} />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
