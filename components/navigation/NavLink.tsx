'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  // Use exact matching since nav items are distinct destinations
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative text-sm transition-colors py-1 ${
        isActive
          ? 'text-primary-400 font-medium'
          : 'text-hull-400 hover:text-hull-100'
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400 rounded-full" />
      )}
    </Link>
  );
}
