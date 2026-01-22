import Link from 'next/link';

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center">
      <span className="text-xl font-bold tracking-tight text-hull-100">
        SQUADRON
      </span>
    </Link>
  );
}
