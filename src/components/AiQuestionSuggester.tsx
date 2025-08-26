'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Wand2, Plus } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { suggestBalancedQuestionSet, SuggestBalancedQuestionSetOutput, SuggestBalancedQuestionSetInput } from '@/ai/flows/suggest-balanced-question-set';
import type { Question } from '@/types';
import { useToast } from '@/hooks/use-toast';

const bloomsLevels = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'] as const;

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  numberOfQuestions: z.coerce.number().int().min(1, 'Must be at least 1.').max(10, 'Cannot exceed 10.'),
  bloomsTaxonomyLevels: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one level.',
  }),
});

type AiQuestionSuggesterProps = {
  children: React.ReactNode;
  addSuggestedQuestions: (newQuestions: Omit<Question, 'id'>[]) => Question[];
};

export function AiQuestionSuggester({ children, addSuggestedQuestions }: AiQuestionSuggesterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestBalancedQuestionSetOutput['suggestedQuestions']>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      numberOfQuestions: 5,
      bloomsTaxonomyLevels: ['Remembering', 'Understanding', 'Applying'],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await suggestBalancedQuestionSet(values as SuggestBalancedQuestionSetInput);
      setSuggestions(result.suggestedQuestions);
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Could not fetch AI suggestions. Please try again.',
      });
    }
    setIsLoading(false);
  }
  
  const handleAddAllToBank = () => {
    const questionsToAdd = suggestions.map(s => ({
      text: s.question,
      bloomsTaxonomyLevel: s.bloomsTaxonomyLevel as Question['bloomsTaxonomyLevel'],
      // Mocking other fields for the demo
      subject: form.getValues('topic'),
      topic: form.getValues('topic'),
      class: 'Mixed',
      difficulty: 'Medium',
    }));
    addSuggestedQuestions(questionsToAdd);
    setIsOpen(false);
    form.reset();
    setSuggestions([]);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI-Powered Question Suggester</DialogTitle>
          <DialogDescription>
            Generate a balanced set of questions on any topic using AI.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormField
                control={form.control}
                name="bloomsTaxonomyLevels"
                render={() => (
                  <FormItem>
                    <FormLabel>Bloom's Taxonomy Levels</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                    {bloomsLevels.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="bloomsTaxonomyLevels"
                        render={({ field }) => (
                          <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item])
                                    : field.onChange(field.value?.filter((value) => value !== item));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                    </div>
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
                <div className="space-y-3">
                  {suggestions.map((s, i) => (
                    <div key={i} className="bg-card p-3 rounded-md border text-sm">
                      <p>{s.question}</p>
                      <Badge variant="outline" className="mt-2">{s.bloomsTaxonomyLevel}</Badge>
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
