'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`text-sm transition-colors ${
        isActive
          ? 'text-indigo-600 font-medium'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
}
