import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/shared/Header';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from './context/UserContext';
import QueryProvider from '@/components/provider/QueryProvider';

export const metadata: Metadata = {
  title: 'Chess Mate',
  description: 'Chess Mate',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <UserProvider>
            <Header />
            {children}
          </UserProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
