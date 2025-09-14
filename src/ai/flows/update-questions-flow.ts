
'use server';
/**
 * @fileOverview A flow for updating the mock question data file.
 *
 * - updateQuestions - A function that overwrites the mock data file with new questions.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Question } from '@/types';
import { z } from 'zod';


const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  subject: z.string(),
  topic: z.string(),
  class: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  bloomsTaxonomyLevel: z.enum(['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating', 'Knowledge', 'Aptitude and Attitude']).optional().nullable(),
  createdAt: z.string().optional(),
  type: z.string().optional(),
  image: z.string().optional(),
  options: z.array(z.object({ text: z.string(), isCorrect: z.boolean() })).optional(),
  answer: z.string().optional(),
  vertical: z.string().optional(),
  program: z.string().optional(),
  paper: z.string().optional(),
  chapter: z.string().optional(),
  exam_set: z.string().optional(),
  board: z.string().optional(),
  marks: z.number().optional(),
  language: z.string().optional(),
  format_type: z.string().optional(),
  explanation: z.string().optional(),
  category: z.string().optional(),
  modules: z.string().optional(),
  group_type: z.string().optional(),
});

const UpdateQuestionsInputSchema = z.array(QuestionSchema);
export type UpdateQuestionsInput = z.infer<typeof UpdateQuestionsInputSchema>;


export async function updateQuestions(questions: UpdateQuestionsInput): Promise<void> {
  const filePath = path.join(process.cwd(), 'src', 'data', 'mock-data.ts');
  
  // To prevent circular dependencies or complex regeneration, we'll just store the JSON data.
  const fileContent = `import type { Question } from '@/types';

export const allQuestions: Question[] = ${JSON.stringify(questions, null, 2)};
`;

  try {
    fs.writeFileSync(filePath, fileContent, 'utf8');
  } catch (error) {
    console.error('Failed to write questions file:', error);
    throw new Error('Failed to update questions in the backend.');
  }
}
