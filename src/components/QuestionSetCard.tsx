'use client';
import type { DragEvent, MouseEvent } from 'react';
import type { QuestionSet } from '@/types';
import { Badge } from './ui/badge';
import { Package, Eye } from 'lucide-react';
import { Button } from './ui/button';

type QuestionSetCardProps = {
  questionSet: QuestionSet;
  onViewClick: (e: MouseEvent<HTMLButtonElement>) => void;
};

export function QuestionSetCard({ questionSet, onViewClick }: QuestionSetCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    // Prevent drag if the click is on the button
    if (e.target instanceof HTMLButtonElement || (e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('questionSetId', questionSet.questionIds.join(','));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="border bg-card p-4 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md flex items-start justify-between gap-4"
    >
      <div className="flex items-start gap-3 flex-1">
        <div className="bg-primary/10 p-2 rounded-md mt-1">
            <Package className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
            <h4 className="font-semibold">{questionSet.name}</h4>
            <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">{questionSet.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Badge variant="outline">{questionSet.questionIds.length} questions</Badge>
            </div>
        </div>
      </div>
       <Button 
          variant="outline" 
          size="sm"
          onClick={onViewClick}
        >
          <Eye className="mr-2" />
          View
        </Button>
    </div>
  );
}
