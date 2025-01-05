'use client';

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from 'next/image';
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { PrismicDocument } from "@prismicio/client";

interface HeaderProps {
  session: Session | null;
  headerData: PrismicDocument<Record<string, any>, string, string> | null;
}

export default function Header({ session: serverSession, headerData }: HeaderProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState<{ month: string; year: number }>({
    month: '',
    year: 0
  });

  // Use server session if client session is not available yet
  const activeSession = session || serverSession;

  useEffect(() => {
    setMounted(true);
    const date = new Date();
    setCurrentDate({
      month: date.toLocaleString('default', { month: 'long' }).toUpperCase(),
      year: date.getFullYear()
    });
  }, []);

  if (!mounted) return null;

  const isAdmin = activeSession?.user?.role === 'super-admin';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-lg">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-bold">
            {headerData?.data?.title || "Mathematica.AI"}
          </Link>
          <span className="text-xs text-foreground/60">
            {currentDate.month} {currentDate.year}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {activeSession ? (
            <>
              <Link href="/functions" className="btn btn-primary btn-sm">
                FUNCTIONS
              </Link>
              {isAdmin && (
                <Link href="/admin" className="btn btn-ghost btn-sm">
                  Admin
                </Link>
              )}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-8 rounded-full">
                    {activeSession.user?.image ? (
                      <Image 
                        src={activeSession.user.image} 
                        alt={activeSession.user?.name || 'User'} 
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="bg-neutral text-neutral-content rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-sm">{activeSession.user?.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                  </div>
                </label>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52 bg-white">
                  <li className="menu-title">
                    <span>{activeSession.user?.name}</span>
                  </li>
                  <li className="text-sm opacity-70">
                    <span>{activeSession.user?.email}</span>
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
