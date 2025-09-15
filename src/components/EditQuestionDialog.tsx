
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

// Helper to handle both string and string[]
const stringOrStringArray = z.union([z.string(), z.array(z.string())]);

const questionFormSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty.'),
  subject: stringOrStringArray.optional(),
  topic: stringOrStringArray.optional(),
  class: stringOrStringArray.optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  options: z.array(optionSchema).min(2, 'Must have at least two options.'),
  correctOption: z.string().min(1, "Must select a correct option."),
  explanation: z.string().optional(),
  program: stringOrStringArray.optional(),
  paper: stringOrStringArray.optional(),
  chapter: stringOrStringArray.optional(),
  board: stringOrStringArray.optional(),
});

type EditQuestionDialogProps = {
  question: Question;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (updatedQuestion: Question) => void;
};

// Helper to convert single string to comma-separated and handle arrays
const formatForInput = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value.join(', ');
    return value || '';
}

// Helper to convert comma-separated string back to array (or single string if one item)
const parseFromInput = (value: string): string | string[] => {
    const parts = value.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length <= 1) return parts[0] || '';
    return parts;
}

export function EditQuestionDialog({ question, isOpen, onOpenChange, onSave }: EditQuestionDialogProps) {
  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  useEffect(() => {
    if (isOpen) {
        form.reset({
            text: question.text || '',
            subject: formatForInput(question.subject),
            topic: formatForInput(question.topic),
            class: formatForInput(question.class),
            difficulty: question.difficulty || 'Medium',
            options: question.options || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
            correctOption: question.options?.findIndex(o => o.isCorrect).toString() || '0',
            explanation: question.explanation || '',
            program: formatForInput(question.program),
            paper: formatForInput(question.paper),
            chapter: formatForInput(question.chapter),
            board: formatForInput(question.board),
        });
    }
  }, [question, isOpen, form]);

  const onSubmit = (values: z.infer<typeof questionFormSchema>) => {
    const updatedOptions = values.options.map((opt, index) => ({
        ...opt,
        isCorrect: index.toString() === values.correctOption,
    }));

    const updatedQuestion: Question = {
      ...question,
      text: values.text,
      subject: parseFromInput(values.subject as string),
      topic: parseFromInput(values.topic as string),
      class: parseFromInput(values.class as string),
      difficulty: values.difficulty,
      options: updatedOptions,
      explanation: values.explanation,
      program: parseFromInput(values.program as string),
      paper: parseFromInput(values.paper as string),
      chapter: parseFromInput(values.chapter as string),
      board: parseFromInput(values.board as string),
    };
    onSave(updatedQuestion);
  };
  
  const AttributeInput = ({ name, label }: { name: "subject" | "topic" | "class" | "program" | "paper" | "chapter" | "board", label: string }) => (
     <FormField control={form.control} name={name} render={({ field }) => (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
        </FormItem>
    )}/>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>Modify the question details. For attributes like Topic or Subject, use commas to separate multiple values.</DialogDescription>
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
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                    <Trash2 className="h-4 w-4" />
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
                        <AttributeInput name="subject" label="Subject" />
                        <AttributeInput name="topic" label="Topic" />
                        <AttributeInput name="class" label="Class" />
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
                        <AttributeInput name="program" label="Program" />
                        <AttributeInput name="paper" label="Paper" />
                        <AttributeInput name="chapter" label="Chapter" />
                        <AttributeInput name="board" label="Board/School" />
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
                <Button type="submit" variant="success">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
