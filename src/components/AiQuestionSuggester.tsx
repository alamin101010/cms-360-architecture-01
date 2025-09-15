
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Question } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { suggestBalancedQuestionSet } from '@/ai/flows/suggest-balanced-question-set';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  numberOfQuestions: z.coerce.number().int().min(1, 'Must be at least 1.').max(10, 'Cannot exceed 10.'),
  prompt: z.string().optional(),
});

type AiQuestionSuggesterProps = {
  children: React.ReactNode;
  addImportedQuestions: (newQuestions: Omit<Question, 'id'>[]) => void;
  existingQuestions: Question[];
};

export function AiQuestionSuggester({ children, addImportedQuestions, existingQuestions }: AiQuestionSuggesterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      numberOfQuestions: 5,
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions([]);
    try {
      // This feature is disabled in environments that don't support server-side Genkit flows.
      // If you are running locally with `genkit start`, this should work.
      // On a read-only filesystem like Vercel, this will not work.
      const result = await suggestBalancedQuestionSet({
        ...values,
        existingQuestions: existingQuestions.slice(0, 20) // Pass a subset of questions for context
      });
      setSuggestions(result.suggestedQuestions);
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Suggestions Currently Unavailable',
        description: 'This feature could not connect to the backend AI service. If you are running locally, ensure your Genkit flows are active.',
      });
    }
    setIsLoading(false);
  }
  
  const handleAddAllToBank = () => {
    const questionsToAdd = suggestions.map(s => ({
      text: s.question,
      options: s.options,
      subject: form.getValues('topic'),
      topic: form.getValues('topic'),
      class: 'Mixed',
      difficulty: 'Medium' as const,
      type: 'm1',
    }));
    addImportedQuestions(questionsToAdd);
    setIsOpen(false);
    form.reset();
    setSuggestions([]);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI-Powered Question Suggester</DialogTitle>
          <DialogDescription>
            Generate a balanced set of questions on any topic using AI. The AI will analyze your existing question bank for context.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden flex-1">
          <div className="flex flex-col gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cell Biology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Prompt (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'Focus on the differences between plant and animal cells.'" {...field} />
                      </FormControl>
                       <FormDescription>Provide specific instructions for the AI.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfQuestions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Questions</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate Questions
                </Button>
              </form>
            </Form>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 flex flex-col">
            <h4 className="font-semibold mb-2">Suggested Questions</h4>
            <ScrollArea className="flex-1 -mx-4">
              <div className="px-4">
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && suggestions.length === 0 && (
                 <div className="flex items-center justify-center h-full text-center text-muted-foreground text-sm">
                  <p>Your AI-generated questions will appear here.</p>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="space-y-4">
                  {suggestions.map((s, i) => (
                    <div key={i} className="bg-card p-3 rounded-md border text-sm">
                      <p className='font-medium'>{i + 1}. {s.question}</p>
                      <div className="mt-2 space-y-1">
                        {s.options?.map((opt, index) => (
                           <div key={index} className="flex items-center gap-2 text-xs">
                             {opt.isCorrect ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                             <span>{opt.text}</span>
                           </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          {suggestions.length > 0 && (
            <Button onClick={handleAddAllToBank}><Plus className="mr-2 h-4 w-4"/>Add All to Bank</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
