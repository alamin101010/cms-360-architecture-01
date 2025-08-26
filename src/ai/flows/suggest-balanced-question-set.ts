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

const SuggestBalancedQuestionSetInputSchema = z.object({
  topic: z.string().describe('The topic of the questions.'),
  bloomsTaxonomyLevels: z
    .array(z.string())
    .describe(
      "An array of Bloom's Taxonomy levels to include in the question set."
    ),
  numberOfQuestions: z.number().describe('The desired number of questions in the set.'),
});
export type SuggestBalancedQuestionSetInput = z.infer<
  typeof SuggestBalancedQuestionSetInputSchema
>;

const SuggestedQuestionSchema = z.object({
  question: z.string().describe('The suggested question.'),
  bloomsTaxonomyLevel: z
    .string()
    .describe("The Bloom's Taxonomy level of the question."),
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
  return suggestBalancedQuestionSetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBalancedQuestionSetPrompt',
  input: {schema: SuggestBalancedQuestionSetInputSchema},
  output: {schema: SuggestBalancedQuestionSetOutputSchema},
  prompt: `You are an AI-powered exam creation assistant. Your task is to suggest a balanced question set for a teacher based on the given parameters.

Topic: {{{topic}}}
Bloom's Taxonomy Levels: {{#each bloomsTaxonomyLevels}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Number of Questions: {{{numberOfQuestions}}}

Suggest a set of questions that covers the specified topic and includes questions from the specified Bloom's Taxonomy levels. Ensure that the question set is balanced, with an appropriate number of questions from each Bloom's Taxonomy level.

Format your response as a JSON object with a "suggestedQuestions" array. Each object in the array should have the following keys:
- "question": The suggested question.
- "bloomsTaxonomyLevel": The Bloom's Taxonomy level of the question.

Make sure that number of suggested question matches the number of questions specified.
`, // Ensure prompt output matches the schema
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
