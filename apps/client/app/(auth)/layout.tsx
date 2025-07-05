import QueryProvider from '@/components/provider/QueryProvider';
import { UserProvider } from '../context/UserContext';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Login - ChessMate',
  description: 'Login to your ChessMate account',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <UserProvider>{children}</UserProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
