import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 py-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} FitStamp. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <a href="#" className="hover:text-gray-900 dark:hover:text-gray-50">
            プライバシーポリシー
          </a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-gray-50">
            利用規約
          </a>
        </div>
      </div>
    </footer>
  );
}
