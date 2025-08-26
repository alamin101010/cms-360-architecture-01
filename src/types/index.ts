export type Question = {
  id: string;
  text: string;
  subject: string;
  topic: string;
  class: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bloomsTaxonomyLevel: 'Remembering' | 'Understanding' | 'Applying' | 'Analyzing' | 'Evaluating' | 'Creating';
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
};
