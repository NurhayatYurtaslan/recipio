import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { getLocale, getMessages } from 'next-intl/server';
import { ClientLocaleProvider } from '@/components/i18n/ClientLocaleProvider';
import enMessages from '@/localizations/en.json';
import trMessages from '@/localizations/tr.json';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recipio",
  description: "Minimalist Recipe Website",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <ClientLocaleProvider
          initialLocale={locale as 'tr' | 'en'}
          initialMessages={messages}
          messages={{ en: enMessages, tr: trMessages }}
        >
          {children}
        </ClientLocaleProvider>
      </body>
    </html>
  );
}
