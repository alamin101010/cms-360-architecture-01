
'use client';
import type { DragEvent, MouseEvent } from 'react';
import type { Question } from '@/types';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';

type QuestionCardProps = {
  question: Question;
  onCardClick: () => void;
  onDeleteClick: (e: MouseEvent<HTMLButtonElement>) => void;
  onSelectToggle: (e: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>) => void;
  isSelected: boolean;
};

const AttributeBadge = ({ value, className }: { value: string | string[] | undefined, className?: string }) => {
  if (!value) return null;
  const values = Array.isArray(value) ? value : [value];
  return (
    <>
      {values.map((val, index) => (
        <Badge key={index} variant="outline" className={className}>{val}</Badge>
      ))}
    </>
  );
};


export function QuestionCard({ question, onCardClick, onDeleteClick, onSelectToggle, isSelected }: QuestionCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    // Don't drag if an interactive element was the target
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="checkbox"]')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('questionId', question.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onCardClick}
      className="border bg-card p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow active:cursor-grabbing group relative"
    >
      <div className="flex gap-3">
        <div className="flex items-center pt-1" onClick={(e) => e.stopPropagation()}>
           <Checkbox 
            checked={isSelected} 
            onCheckedChange={() => onSelectToggle({ stopPropagation: () => {} } as MouseEvent<HTMLDivElement>)}
            onClick={(e) => onSelectToggle(e)}
            aria-label="Select question"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium line-clamp-2">{question.text}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            <AttributeBadge value={question.subject} className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300" />
            <AttributeBadge value={question.class} className="border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/50 dark:bg-purple-900/20 dark:text-purple-300" />
            {question.difficulty && <Badge
              className={
                question.difficulty === 'Easy' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/50 border' :
                question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/50 border' :
                'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/50 border'
              }
            >
              {question.difficulty}
            </Badge>}
            <AttributeBadge value={question.topic} className="border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/20 dark:text-slate-300"/>
          </div>
        </div>
      </div>
       <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
          onClick={onDeleteClick}
          aria-label="Delete question"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
    </div>
  );
}
