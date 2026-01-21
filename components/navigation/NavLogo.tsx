import Link from 'next/link';

export function NavLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold">S</span>
      </div>
      <span className="font-semibold text-gray-900">Squadron</span>
    </Link>
  );
}
