
'use client';
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Question } from '@/types';

const optionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty.'),
  isCorrect: z.boolean(),
});

const questionFormSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty.'),
  subject: z.string().optional(),
  topic: z.string().optional(),
  class: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  options: z.array(optionSchema).min(2, 'Must have at least two options.'),
  correctOption: z.string().min(1, "Must select a correct option."),
  explanation: z.string().optional(),
});

type EditQuestionDialogProps = {
  question: Question;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedQuestion: Question) => void;
};

export function EditQuestionDialog({ question, isOpen, onOpenChange, onSave }: EditQuestionDialogProps) {
  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: question.text || '',
      subject: question.subject || '',
      topic: question.topic || '',
      class: question.class || '',
      difficulty: question.difficulty || 'Medium',
      options: question.options || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      correctOption: question.options?.findIndex(o => o.isCorrect).toString() || '0',
      explanation: question.explanation || ''
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  useEffect(() => {
    form.reset({
      text: question.text || '',
      subject: question.subject || '',
      topic: question.topic || '',
      class: question.class || '',
      difficulty: question.difficulty || 'Medium',
      options: question.options || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      correctOption: question.options?.findIndex(o => o.isCorrect).toString() || '0',
      explanation: question.explanation || ''
    });
  }, [question, form]);

  const onSubmit = (values: z.infer<typeof questionFormSchema>) => {
    const updatedOptions = values.options.map((opt, index) => ({
        ...opt,
        isCorrect: index.toString() === values.correctOption,
    }));

    const updatedQuestion: Question = {
      ...question,
      text: values.text,
      subject: values.subject || '',
      topic: values.topic || '',
      class: values.class || '',
      difficulty: values.difficulty,
      options: updatedOptions,
      explanation: values.explanation,
    };
    onSave(updatedQuestion);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>Modify the question details and attributes below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4 overflow-hidden">
            <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <div>
                        <FormLabel>Options</FormLabel>
                        <RadioGroup 
                          value={form.watch('correctOption')}
                          onValueChange={(value) => form.setValue('correctOption', value)}
                        >
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2 mt-2">
                                <FormField
                                    control={form.control}
                                    name={`options.${index}.text`}
                                    render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                        <Input {...field} placeholder={`Option ${index + 1}`} />
                                        </FormControl>
                                    </FormItem>
                                    )}
                                />
                                <FormControl>
                                    <RadioGroupItem value={index.toString()} id={`correct-opt-${index}`} />
                                </FormControl>
                                <FormLabel htmlFor={`correct-opt-${index}`} className="text-sm">Correct</FormLabel>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                </div>
                            ))}
                        </RadioGroup>
                         <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ text: '', isCorrect: false })}>
                            <PlusCircle className="mr-2" /> Add Option
                        </Button>
                        <FormMessage>{form.formState.errors.options?.message}</FormMessage>
                        <FormMessage>{form.formState.errors.correctOption?.message}</FormMessage>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="subject" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="topic" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Topic</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="class" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="difficulty" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Difficulty</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select difficulty" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                     <FormField
                        control={form.control}
                        name="explanation"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Explanation (Optional)</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
            </ScrollArea>
            <DialogFooter className="mt-4 shrink-0">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
