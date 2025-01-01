import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import { HeaderDocument } from "@/prismicio-types";
import { Session } from "next-auth";

interface HeaderProps {
  session: Session | null;
  headerData: HeaderDocument;
}

export default function Header({ session, headerData }: HeaderProps) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toUpperCase();
  const currentYear = new Date().getFullYear();

  // Add fallback values if headerData is not available
  const defaultHeaderData = {
    data: {
      logo_text: 'MATHEMATIQUES.AI',
      nav_items: [],
      github_url: 'https://github.com',
      contact_button_text: 'CONTACT',
      login_text: 'LOG IN',
      functions_text: 'FUNCTIONS'
    }
  };

  const header = headerData || defaultHeaderData;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Left side - Logo and Nav */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            {header.data.logo_text}
          </Link>
          
          {header.data.nav_items.map((item) => (
            <Link
              key={item.link.url}
              href={item.link.url}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side - Date, Theme Toggle, Auth */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-foreground/60">
            {currentMonth} {currentYear}
          </span>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {session ? (
              <Link 
                href="/functions"
                className="btn btn-sm btn-ghost"
              >
                {header.data.functions_text}
              </Link>
            ) : (
              <Link 
                href="/api/auth/signin"
                className="btn btn-sm btn-ghost"
              >
                {header.data.login_text}
              </Link>
            )}

            <a
              href={header.data.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-ghost"
            >
              <FaGithub className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>

            <Link
              href="/contact"
              className="btn btn-sm btn-primary"
            >
              {header.data.contact_button_text}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
