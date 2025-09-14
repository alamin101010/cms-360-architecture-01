
'use server';
/**
 * @fileOverview A flow for updating the mock question data file.
 *
 * - updateQuestions - A function that overwrites the mock data file with new questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generate } from 'genkit';
import type { Question } from '@/types';


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

export async function updateQuestions(
  input: UpdateQuestionsInput
): Promise<void> {
  return updateQuestionsFlow(input);
}

const updateQuestionsFlow = ai.defineFlow(
  {
    name: 'updateQuestionsFlow',
    inputSchema: UpdateQuestionsInputSchema,
    outputSchema: z.void(),
  },
  async (questions) => {
    // Generate the file content as a string
    const fileContent = `import type { Question } from '@/types';

export const allQuestions: Question[] = ${JSON.stringify(questions, null, 2)};
`;

    // Use the `generate` function with a prompt that uses `{{file}}`
    await generate({
        prompt: `Update the file src/data/mock-data.ts with the following content:
        
        {{file "src/data/mock-data.ts"}}
        ${"```ts"}
        ${fileContent}
        ${"```"}
        `,
        model: 'googleai/gemini-2.5-flash',
        config: {
          temperature: 0, // Set temperature to 0 for deterministic output
        },
    });
  }
);
