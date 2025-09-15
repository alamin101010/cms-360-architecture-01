
'use server';
/**
 * @fileOverview AI-powered question suggestion flow.
 *
 * - suggestBalancedQuestionSet - A function that suggests a balanced question set based on user-defined parameters.
 * - SuggestBalancedQuestionSetInput - The input type for the suggestBalancedQuestionSet function.
 * - SuggestBalancedQuestionSetOutput - The return type for the suggestBalancedQuestionSet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Question } from '@/types';


const QuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  subject: z.union([z.string(), z.array(z.string())]),
  topic: z.union([z.string(), z.array(z.string())]),
  class: z.union([z.string(), z.array(z.string())]),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  createdAt: z.string().optional(),
});


const SuggestBalancedQuestionSetInputSchema = z.object({
  topic: z.string().describe('The topic of the questions.'),
  numberOfQuestions: z.number().describe('The desired number of questions in the set.'),
  prompt: z.string().optional().describe('An optional user-provided prompt for more specific instructions.'),
  existingQuestions: z.array(QuestionSchema).optional().describe('A list of existing questions in the bank for context.'),
});
export type SuggestBalancedQuestionSetInput = z.infer<
  typeof SuggestBalancedQuestionSetInputSchema
>;

const SuggestedOptionSchema = z.object({
  text: z.string().describe('The text of the option.'),
  isCorrect: z.boolean().describe('Whether this option is the correct answer.'),
});

const SuggestedQuestionSchema = z.object({
  question: z.string().describe('The suggested question.'),
  options: z.array(SuggestedOptionSchema).describe('An array of multiple-choice options for the question.'),
});

const SuggestBalancedQuestionSetOutputSchema = z.object({
  suggestedQuestions: z.array(SuggestedQuestionSchema).describe('The suggested question set.'),
});
export type SuggestBalancedQuestionSetOutput = z.infer<
  typeof SuggestBalancedQuestionSetOutputSchema
>;

export async function suggestBalancedQuestionSet(
  input: SuggestBalancedQuestionSetInput
): Promise<SuggestBalancedQuestionSetOutput> {
  // Map input questions to match the schema if necessary
  const mappedInput = {
    ...input,
    existingQuestions: input.existingQuestions?.map(q => ({
      ...q,
      // Ensure array fields are handled correctly for the prompt.
      topic: Array.isArray(q.topic) ? q.topic.join(', ') : q.topic,
      subject: Array.isArray(q.subject) ? q.subject.join(', ') : q.subject,
      class: Array.isArray(q.class) ? q.class.join(', ') : q.class,
    }))
  };
  return suggestBalancedQuestionSetFlow(mappedInput);
}

// Define a schema for the prompt that expects string versions of the array fields
const PromptInputSchema = SuggestBalancedQuestionSetInputSchema.extend({
  existingQuestions: z.array(QuestionSchema.extend({
    subject: z.string(),
    topic: z.string(),
    class: z.string(),
  })).optional(),
});


const prompt = ai.definePrompt({
  name: 'suggestBalancedQuestionSetPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: SuggestBalancedQuestionSetOutputSchema},
  prompt: `You are an AI-powered exam creation assistant. Your task is to suggest a balanced, multiple-choice question set for a teacher based on the given parameters.

Topic: {{{topic}}}
Number of Questions: {{{numberOfQuestions}}}

{{#if prompt}}
User's Instructions: {{{prompt}}}
{{/if}}

Please analyze the following existing questions in the question bank to understand the context, style, and subject matter. Avoid creating questions that are too similar to these.
{{#if existingQuestions}}
Existing Questions:
{{#each existingQuestions}}
- {{{this.text}}} (Topic: {{{this.topic}}})
{{/each}}
{{else}}
There are no existing questions for context.
{{/if}}


Suggest a set of questions that covers the specified topic.

Each question MUST be a multiple-choice question with 4 options. Exactly one option must be correct.

Format your response as a JSON object with a "suggestedQuestions" array. Each object in the array should have the following keys:
- "question": The suggested question text.
- "options": An array of 4 objects, each with "text" and "isCorrect" (boolean) keys.

Make sure that the number of suggested questions matches the number of questions specified.
`,
});

const suggestBalancedQuestionSetFlow = ai.defineFlow(
  {
    name: 'suggestBalancedQuestionSetFlow',
    inputSchema: PromptInputSchema,
    outputSchema: SuggestBalancedQuestionSetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
