'use client';
import { useEffect, useState } from 'react';
import { useUserContext } from '@/app/context/UserContext';
import { Button } from '@/components/ui/button';
import { UserData } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import Link from 'next/link';

const Header = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const { logout } = useUserContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error(`Faild logout ${error}`, {
        style: { color: 'black', backgroundColor: 'white' },
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/user/info');
        if (!data) {
          router.push('/login');
          toast.error('You need to login first', {
            style: { color: 'black', backgroundColor: 'white' },
          });
          return;
        }
        setUserData(data);
      } catch {

      }
    };
    fetchData();
  }, [router]);

  return (
    <header className="sticky z-50 top-0 border-b border-zinc-800 bg-zinc-950 text-white">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={'/'} className="text-xl font-bold text-white">
              Chess<span className="text-green-400">Mate</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {userData ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <div className="relative h-8 w-8">
                    {userData.picture ? (
                      <img
                        src={userData.picture}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                        {userData.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm">{userData.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 hover:bg-zinc-800 cursor-pointer"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 hover:bg-zinc-800 cursor-pointer"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
