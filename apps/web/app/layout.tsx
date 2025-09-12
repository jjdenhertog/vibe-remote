import type { Metadata } from "next";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import "./globals.css";

// Fallback fonts when Google Fonts are not available
const geistSans = {
    variable: "--font-geist-sans",
};

const geistMono = {
    variable: "--font-geist-mono",
};

export const metadata: Metadata = {
    title: "Vibe 🤮 Remote 🚀",
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
                <ConditionalLayout>
                    {children}
                </ConditionalLayout>
            </body>
        </html>
    );
}
