import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UserSettingsProvider } from "@/components/config/user-settings-provider";
import "./globals.css";
import { LayoutProps } from "next/dist/lib/metadata/metadata-resolution-primitives";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visão geral | NexStock",
  description: "Seu estoque, sob controle. Acompanhe produtos, movimentações e reposições no NexStock.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: any) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <UserSettingsProvider>{children}</UserSettingsProvider>
      </body>
    </html>
  );
}
