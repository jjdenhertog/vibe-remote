import type { Metadata } from "next";
import TopNavigation from "@/components/navigation/TopNavigation";
import "./globals.css";

// Fallback fonts when Google Fonts are not available
const geistSans = {
    variable: "--font-geist-sans",
};

const geistMono = {
    variable: "--font-geist-mono",
};

export const metadata: Metadata = {
    title: "Vibe Remote Workstation",
    description: "AI-powered development environment with intelligent context and automations",
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
                <TopNavigation />
                <main className="min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </body>
        </html>
    );
}
