import { BookMarked } from 'lucide-react';
import { Button } from "@/components/ui/button"
import type { Exam } from '@/types';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

type HeaderProps = {
  savedExams: Exam[];
}

export function Header({ savedExams }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-card shadow-sm">
      <Link href="/" className="flex items-center">
        <BookMarked className="h-8 w-8 text-primary" />
        <h1 className="ml-3 text-xl sm:text-2xl font-bold text-foreground">
          CMS360 Architectures
        </h1>
      </Link>
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
                <Link href="/">Exam Builder</Link>
            </Button>
            <Button asChild variant="ghost">
                <Link href="/exams">Saved Exams</Link>
            </Button>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
