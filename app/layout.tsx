import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SupabaseProvider } from './supabase-provider';

export const metadata: Metadata = {
  title: 'My Builder',
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
          <nav style={{ padding: 12, borderBottom: '1px solid #ccc' }}>
            <Link href="/" style={{ marginRight: 8 }}>
              Home
            </Link>
            <Link href="/dashboard" style={{ marginRight: 8 }}>
              Projects
            </Link>
            <Link href="/tasks" style={{ marginRight: 8 }}>
              Tasks
            </Link>
            <Link href="/profile" style={{ marginRight: 8 }}>
              Profile
            </Link>
            <Link href="/login">Login</Link>
          </nav>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
