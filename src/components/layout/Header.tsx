"use client";

import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { AuthHeader } from '@/components/AuthHeader';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100 bg-white dark:border-gray-800 dark:bg-black">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
          <Dumbbell className="h-6 w-6" />
          <span>FitStamp</span>
        </Link>
        <nav className="flex flex-col items-end gap-1 text-sm font-medium">
          <AuthHeader />
          <HamburgerMenu />
        </nav>
      </div>
    </header>
  );
}
