export type Question = {
  id: string;
  text: string;
  subject: string;
  topic: string;
  class: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bloomsTaxonomyLevel: 'Remembering' | 'Understanding' | 'Applying' | 'Analyzing' | 'Evaluating' | 'Creating';
  options?: string[];
  answer?: string;
};

export type QuestionSet = {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
};

export type Exam = {
  id: string;
  name: string;
  questions: Question[];
  createdAt: string;
  duration?: number; // in minutes
  negativeMarking?: number;
  windowStart?: string;
  windowEnd?: string;
};
