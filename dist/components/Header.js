'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
export default function Header({ session, headerData }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [currentDate, setCurrentDate] = useState({
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
    if (!mounted)
        return null;
    const defaultData = {
        logo_text: 'Mathematica.AI',
        nav_items: [],
        github_url: 'https://github.com',
        contact_button_text: 'CONTACT',
        login_text: 'LOG IN',
        functions_text: 'FUNCTIONS'
    };
    const data = headerData?.data || defaultData;
    return (<header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-lg">
      <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-lg font-bold">
            {data.logo_text}
          </Link>
          <span className="text-xs text-foreground/60">
            {currentDate.month} {currentDate.year}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {session ? (<Link href="/functions" className="btn btn-primary btn-sm">
              {data.functions_text}
            </Link>) : (<Link href="/auth/signin" className="btn btn-primary btn-sm">
              {data.login_text}
            </Link>)}
        </div>
      </nav>
    </header>);
}
