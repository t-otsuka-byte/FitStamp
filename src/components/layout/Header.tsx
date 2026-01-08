import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dumbbell } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-black/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
          <Dumbbell className="h-6 w-6" />
          <span>FitStamp</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          {/* Future navigation items can go here */}
        </nav>
      </div>
    </header>
  );
}
