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
  subject: z.string(),
  topic: z.string(),
  class: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  bloomsTaxonomyLevel: z.enum(['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating', 'Knowledge', 'Aptitude and Attitude']),
  createdAt: z.string().optional(),
});


const SuggestBalancedQuestionSetInputSchema = z.object({
  topic: z.string().describe('The topic of the questions.'),
  bloomsTaxonomyLevels: z
    .array(z.string())
    .describe(
      "An array of Bloom's Taxonomy levels to include in the question set."
    ),
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
  bloomsTaxonomyLevel: z
    .string()
    .describe("The Bloom's Taxonomy level of the question."),
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
      bloomsTaxonomyLevel: q.bloomsTaxonomyLevel || 'Remembering'
    }))
  };
  return suggestBalancedQuestionSetFlow(mappedInput);
}

const prompt = ai.definePrompt({
  name: 'suggestBalancedQuestionSetPrompt',
  input: {schema: SuggestBalancedQuestionSetInputSchema},
  output: {schema: SuggestBalancedQuestionSetOutputSchema},
  prompt: `You are an AI-powered exam creation assistant. Your task is to suggest a balanced, multiple-choice question set for a teacher based on the given parameters.

Topic: {{{topic}}}
Bloom's Taxonomy Levels: {{#each bloomsTaxonomyLevels}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
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


Suggest a set of questions that covers the specified topic and includes questions from the specified Bloom's Taxonomy levels. Ensure that the question set is balanced.

Each question MUST be a multiple-choice question with 4 options. Exactly one option must be correct.

Format your response as a JSON object with a "suggestedQuestions" array. Each object in the array should have the following keys:
- "question": The suggested question text.
- "bloomsTaxonomyLevel": The Bloom's Taxonomy level of the question.
- "options": An array of 4 objects, each with "text" and "isCorrect" (boolean) keys.

Make sure that the number of suggested questions matches the number of questions specified.
`,
});

const suggestBalancedQuestionSetFlow = ai.defineFlow(
  {
    name: 'suggestBalancedQuestionSetFlow',
    inputSchema: SuggestBalancedQuestionSetInputSchema,
    outputSchema: SuggestBalancedQuestionSetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
