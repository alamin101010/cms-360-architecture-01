'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { Question } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { CheckCircle, XCircle, Pencil } from 'lucide-react';
import { Button } from './ui/button';

type QuestionDetailsDialogProps = {
  question: Question;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEditClick: (question: Question) => void;
};

export function QuestionDetailsDialog({ question, isOpen, onOpenChange, onEditClick }: QuestionDetailsDialogProps) {
  if (!question) return null;

  const getAttributeBadge = (label: string, value: string | undefined | null) => {
    if (!value) return null;
    return <Badge variant="outline">{label}: {value}</Badge>;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
          <DialogDescription>
            Detailed view of the selected question and its attributes.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-6">
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2">Question Text</h3>
                    <p>{question.text}</p>
                </div>

                {question.options && question.options.length > 0 && (
                     <div>
                        <h3 className="font-semibold mb-2">Options</h3>
                        <ul className="space-y-2">
                        {question.options.map((opt, index) => (
                            <li key={index} className="flex items-center text-sm p-2 border rounded-md">
                            {opt.isCorrect ? <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" /> : <XCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />}
                            {opt.text}
                            </li>
                        ))}
                        </ul>
                    </div>
                )}
                
                {question.explanation && (
                    <div>
                        <h3 className="font-semibold mb-2">Explanation</h3>
                        <p className="text-sm p-3 bg-muted/50 rounded-md border">{question.explanation}</p>
                    </div>
                )}

                <div>
                    <h3 className="font-semibold mb-2">Attributes</h3>
                    <div className="flex flex-wrap gap-2">
                        {getAttributeBadge('Class', question.class)}
                        {getAttributeBadge('Subject', question.subject)}
                        {getAttributeBadge('Topic', question.topic)}
                        {getAttributeBadge('Difficulty', question.difficulty)}
                        {getAttributeBadge('Program', question.program)}
                        {getAttributeBadge('Paper', question.paper)}
                        {getAttributeBadge('Chapter', question.chapter)}
                        {getAttributeBadge('Exam Set', question.exam_set)}
                        {getAttributeBadge('Board', question.board)}
                        {getAttributeBadge('Category', question.category)}
                        {getAttributeBadge('Modules', question.modules)}
                        {getAttributeBadge('Group Type', question.group_type)}
                        {getAttributeBadge('Marks', question.marks?.toString())}
                    </div>
                </div>

            </div>
        </ScrollArea>
        <DialogFooter>
            <Button onClick={() => onEditClick(question)}>
                <Pencil className="mr-2"/>
                Edit Question
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
