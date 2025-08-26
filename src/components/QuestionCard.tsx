'use client';
import type { DragEvent } from 'react';
import type { Question } from '@/types';
import { Badge } from './ui/badge';

type QuestionCardProps = {
  question: Question;
  onClick: () => void;
};

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('questionId', question.id);
    // Stop the click event from firing when dragging
    e.stopPropagation();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="border bg-card p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow active:cursor-grabbing"
    >
      <p className="text-sm font-medium line-clamp-2">{question.text}</p>
      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
        {question.subject && <Badge variant="secondary">{question.subject}</Badge>}
        {question.class && <Badge variant="secondary">{question.class}</Badge>}
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
        {question.topic && <Badge variant="outline">Topic: {question.topic}</Badge>}
      </div>
    </div>
  );
}
