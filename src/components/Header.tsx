import { BookMarked, History, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { Exam } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

type HeaderProps = {
  savedExams: Exam[];
}

export function Header({ savedExams }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-card shadow-sm">
      <Link href="/" className="flex items-center">
        <BookMarked className="h-8 w-8 text-primary" />
        <h1 className="ml-3 text-xl sm:text-2xl font-bold text-foreground">
          EdFlex Exam Builder
        </h1>
      </Link>
      <nav className="flex items-center gap-4">
        <Button asChild variant="ghost">
            <Link href="/">Exam Builder</Link>
        </Button>
        <Button asChild variant="ghost">
            <Link href="/exams">Saved Exams</Link>
        </Button>
      </nav>
      <div></div>
    </header>
  );
}
