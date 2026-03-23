import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Providers from "../i18n/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jingqing Liu - Computer Science Researcher",
  description: "Master's student in Computer Science at Brown University, specializing in Network Security and Cybersecurity research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* SVG Liquid Glass Distortion Filter */}
        <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }}>
          <filter id="liquid-glass-filter" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="1" seed="12" result="turbulence"/>
            <feComponentTransfer in="turbulence" result="mapped">
              <feFuncR type="gamma" amplitude="1" exponent="8" offset="0.4"/>
              <feFuncG type="gamma" amplitude="0" exponent="1" offset="0"/>
              <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.4"/>
            </feComponentTransfer>
            <feGaussianBlur in="turbulence" stdDeviation="2.5" result="softMap"/>
            <feSpecularLighting in="softMap" surfaceScale="3" specularConstant="1" specularExponent="80" lightingColor="white" result="specLight">
              <fePointLight x="-150" y="-150" z="200"/>
            </feSpecularLighting>
            <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage"/>
            <feDisplacementMap in="SourceGraphic" in2="softMap" scale="60" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </svg>

        <Providers>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
