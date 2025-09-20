import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { Space_Grotesk } from 'next/font/google';
import { cn } from '@/lib/utils';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'GuardianHealth Pulse',
  description: 'Hyper-personalized diet plans with a futuristic 3D gamified interface.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", spaceGrotesk.variable)}>
      <head />
      <body className="font-body antialiased min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
