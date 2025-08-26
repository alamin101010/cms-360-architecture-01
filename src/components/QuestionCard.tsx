'use client';
import type { DragEvent } from 'react';
import type { Question } from '@/types';
import { Badge } from './ui/badge';

type QuestionCardProps = {
  question: Question;
};

export function QuestionCard({ question }: QuestionCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('questionId', question.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="border bg-card p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-medium">{question.text}</p>
      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
        <Badge variant="secondary">{question.subject}</Badge>
        <Badge variant="secondary">{question.class}</Badge>
        <Badge
          className={
            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }
        >
          {question.difficulty}
        </Badge>
        <Badge variant="outline">{question.bloomsTaxonomyLevel}</Badge>
      </div>
    </div>
  );
}
