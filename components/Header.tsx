'use client';

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<{ month: string; year: number }>({
    month: '',
    year: 0
  });

  useEffect(() => {
    setMounted(true);
    const date = new Date();
    setCurrentDate({
      month: date.toLocaleString('default', { month: 'long' }).toUpperCase(),
      year: date.getFullYear()
    });
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-lg">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-bold">
            MATHEMATIQUES.AI
          </Link>
          <span className="text-xs text-foreground/60">
            {currentDate.month} {currentDate.year}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {session ? (
            <>
              <Link href="/functions" className="btn btn-primary btn-sm">
                FUNCTIONS
              </Link>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-8 rounded-full">
                    {session.user?.image ? (
                      <img src={session.user.image} alt={session.user?.name || 'User'} />
                    ) : (
                      <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-sm">{session.user?.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>
                </label>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52 bg-white">
                  <li className="menu-title">
                    <span>{session.user?.name}</span>
                  </li>
                  <li className="text-sm opacity-70">
                    <span>{session.user?.email}</span>
                  </li>
                  <li className="mt-2">
                    <button 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="btn btn-sm btn-error btn-outline"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <Link href="/auth/signin" className="btn btn-primary btn-sm">
              LOG IN
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
