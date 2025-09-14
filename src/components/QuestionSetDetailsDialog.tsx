'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Question, QuestionSet } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Eye, Pencil } from 'lucide-react';

type QuestionSetDetailsDialogProps = {
  questionSet: QuestionSet;
  allQuestions: Question[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onQuestionClick: (question: Question) => void;
  onEditClick: (question: Question) => void;
};

export function QuestionSetDetailsDialog({ questionSet, allQuestions, isOpen, onOpenChange, onQuestionClick, onEditClick }: QuestionSetDetailsDialogProps) {
  if (!questionSet) return null;

  const questionsInSet = allQuestions.filter(q => questionSet.questionIds.includes(q.id));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{questionSet.name}</DialogTitle>
          <DialogDescription>
            {questionSet.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-6">
              <div className="space-y-4">
                  {questionsInSet.map(question => (
                      <div key={question.id} className="border p-4 rounded-lg">
                          <p className="font-semibold">{question.text}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {question.subject && <Badge variant="secondary">{question.subject}</Badge>}
                            {question.difficulty && <Badge variant="outline">{question.difficulty}</Badge>}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="ghost" size="sm" onClick={() => onQuestionClick(question)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Button>
                             <Button variant="ghost" size="sm" onClick={() => onEditClick(question)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                          </div>
                      </div>
                  ))}
              </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
