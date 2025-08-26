'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Exam } from '@/types';
import { Header } from '@/components/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Play } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ExamsPage() {
  const [savedExams, setSavedExams] = useLocalStorage<Exam[]>('savedExams', []);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  const router = useRouter();

  const deleteExam = (id: string) => {
    setSavedExams(savedExams.filter((exam) => exam.id !== id));
    setExamToDelete(null);
  };
  
  const takeExam = (id: string) => {
    router.push(`/exam/${id}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header savedExams={savedExams} />
      <main className="flex-1 p-4 md:p-6">
        <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
          <Card>
            <CardHeader>
              <CardTitle>Saved Exams</CardTitle>
              <CardDescription>
                Here is a list of all the exams you have created and saved.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedExams.length > 0 ? (
                    savedExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.name}</TableCell>
                        <TableCell>{exam.questions.length}</TableCell>
                        <TableCell>{exam.duration} mins</TableCell>
                        <TableCell>
                          {format(new Date(exam.createdAt), 'PPP')}
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => takeExam(exam.id)}>
                            <Play className="mr-2 h-4 w-4"/>
                            Take Exam
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setExamToDelete(exam.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No saved exams yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the exam.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setExamToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => examToDelete && deleteExam(examToDelete)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
