import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flatmates · Find Your People",
  description: "Find your perfect flatmate. Swipe, match, and connect.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`antialiased ${inter.className}`}
        style={{
          /* Outer shell — visible as bg on desktop */
          background: "#DDDDD8",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/*
          ┌─────────────────────────────────────┐
          │  Mobile container — centered always  │
          │  Mobile  : full width                │
          │  Desktop : 430px, centered, shadow   │
          └─────────────────────────────────────┘
        */}
        <div
          style={{
            width: "100%",
            maxWidth: "680px",
            minHeight: "100vh",
            background: "#F7F7F5",
            position: "relative",
            boxShadow: "0 0 80px rgba(0,0,0,0.15)",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
