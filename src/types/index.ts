
export type Question = {
  id: string;
  text: string;
  subject: string | string[];
  topic: string | string[];
  class: string | string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bloomsTaxonomyLevel: 'Remembering' | 'Understanding' | 'Applying' | 'Analyzing' | 'Evaluating' | 'Creating' | 'Knowledge' | 'Aptitude and Attitude' | string;
  type?: 'm1' | 'True / False' | 'Fill in the Blanks' | string; // m1 is MCQ
  image?: string;
  options?: { text: string; isCorrect: boolean }[];
  answer?: string; // This can be derived from options
  createdAt?: string;

  // New Hierarchical Fields
  vertical?: string | string[]; // e.g., K-12, English
  program?: string | string[];
  paper?: string | string[];
  chapter?: string | string[];
  exam_set?: string | string[];
  board?: string | string[]; // or School/College/Others

  // Other metadata
  marks?: number;
  language?: string;
  format_type?: string;
  explanation?: string;
  category?: string | string[];
  modules?: string | string[];
  group_type?: string;
};

export type QuestionSet = {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
};

export type Exam = {
  id:string;
  name: string;
  questions: Question[];
  createdAt: string;
  duration: number; // in minutes
  negativeMarking: number;
  windowStart: string;
  windowEnd: string;
};

export type Submission = {
    examId: string;
    answers: { [questionId: string]: string };
    submittedAt: string;
    timeTaken: number; // in seconds
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
}
