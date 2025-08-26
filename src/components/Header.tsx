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

type HeaderProps = {
  savedExams: Exam[];
}

export function Header({ savedExams }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-card shadow-sm">
      <div className="flex items-center">
        <BookMarked className="h-8 w-8 text-primary" />
        <h1 className="ml-3 text-xl sm:text-2xl font-bold text-foreground">
          EdFlex Exam Builder
        </h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" />
            Saved Exams ({savedExams.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel>Recently Saved Exams</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {savedExams.length > 0 ? (
            savedExams.slice(-5).reverse().map(exam => (
              <DropdownMenuItem key={exam.id}>
                <FileText className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{exam.name}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(exam.createdAt), 'PPp')}</span>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="p-2 text-sm text-muted-foreground">No saved exams yet.</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
