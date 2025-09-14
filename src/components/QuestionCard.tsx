
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

const AttributeBadge = ({ value }: { value: string | string[] | undefined }) => {
  if (!value) return null;
  const values = Array.isArray(value) ? value : [value];
  return (
    <>
      {values.map((val, index) => (
        <Badge key={index} variant="secondary">{val}</Badge>
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
            <AttributeBadge value={question.subject} />
            <AttributeBadge value={question.class} />
            {question.difficulty && <Badge
              className={
                question.difficulty === 'Easy' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                'bg-red-100 text-red-800 hover:bg-red-200'
              }
            >
              {question.difficulty}
            </Badge>}
            {question.bloomsTaxonomyLevel && <Badge variant="outline">{question.bloomsTaxonomyLevel}</Badge>}
            <AttributeBadge value={question.topic?.toString().replace(/,/g, ', ')} />
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
