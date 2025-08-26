'use client';
import type { DragEvent } from 'react';
import type { QuestionSet } from '@/types';
import { Badge } from './ui/badge';
import { Package } from 'lucide-react';

type QuestionSetCardProps = {
  questionSet: QuestionSet;
};

export function QuestionSetCard({ questionSet }: QuestionSetCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('questionSetId', questionSet.questionIds.join(','));
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="border bg-card p-4 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-md">
            <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h4 className="font-semibold">{questionSet.name}</h4>
            <p className="text-sm text-muted-foreground">{questionSet.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs">
        <Badge variant="outline">{questionSet.questionIds.length} questions</Badge>
      </div>
    </div>
  );
}
