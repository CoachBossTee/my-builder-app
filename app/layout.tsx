import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SupabaseProvider } from './supabase-provider';

export const metadata: Metadata = {
  title: 'Brilliant Millennium',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <nav>
            <Image src="/logo.png" alt="Brilliant Millennium" width={120} height={40} />
            <Link href="/">Home</Link>
            <Link href="/dashboard">Projects</Link>
            <Link href="/tasks">Tasks</Link>
            <Link href="/profile">Profile</Link>
            <Link href="/login">Login</Link>
          </nav>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
