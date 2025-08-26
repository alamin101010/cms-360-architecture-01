'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type CsvUploaderProps = {
  children: React.ReactNode;
  addImportedQuestions: (questions: Omit<Question, 'id'>[]) => void;
};

type ParsedQuestion = Omit<Question, 'id'>;

const attributeMapping: { [key: string]: keyof Question } = {
  '1': 'subject', // Example mapping
  '2': 'topic',
  '3': 'class',
  '4': 'difficulty',
  '5': 'bloomsTaxonomyLevel',
};


export function CsvUploader({ children, addImportedQuestions }: CsvUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<ParsedQuestion[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setPreviewQuestions([]);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreviewQuestions([]);
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleParse = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a CSV file to parse.',
      });
      return;
    }

    setIsParsing(true);
    setPreviewQuestions([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const questions = results.data.map((row: any) => {
            const options: string[] = [];
            let answer: string | undefined = undefined;

            for (let i = 1; i <= 4; i++) {
              if (row[`options_${i}_answer`]) {
                options.push(row[`options_${i}_answer`]);
                if (row[`options_${i}_is_correct`] === '1') {
                  answer = row[`options_${i}_answer`];
                }
              }
            }
            
            const question: ParsedQuestion = {
              text: row.title,
              type: row.type,
              image: row.image,
              options,
              answer,
              // These are defaults that will be overwritten by attributes
              subject: 'Misc',
              topic: 'Misc',
              class: 'Misc',
              difficulty: 'Medium',
              bloomsTaxonomyLevel: 'Remembering',
            };
            
            // Map attributes
            for (let i = 1; i <= 5; i++) {
                const id = row[`attributes_${i}_id`];
                const value = row[`attributes_${i}_value`];
                if (id && value && attributeMapping[id]) {
                    // This is a simplification. You might need a more complex mapping logic
                    // if attribute values are not direct strings for the question properties.
                    (question as any)[attributeMapping[id]] = value;
                }
            }

            return question;
          });

          setPreviewQuestions(questions);
          toast({
            title: 'Preview ready',
            description: `Parsed ${questions.length} questions. Review and add them to the bank.`,
          });
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Parsing error',
            description: 'Failed to parse CSV. Please check the file format and headers.',
          });
        } finally {
          setIsParsing(false);
        }
      },
      error: (error) => {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: error.message,
          });
        setIsParsing(false);
      }
    });
  };

  const handleAddQuestionsToBank = () => {
    addImportedQuestions(previewQuestions);
    setIsOpen(false);
    resetState();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Questions via CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file to upload. After parsing, you can preview the questions before adding them to the bank.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4 py-4">
          <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="flex-1" />
           <Button onClick={handleParse} disabled={!file || isParsing}>
            {isParsing ? 'Parsing...' : 'Parse & Preview'}
          </Button>
        </div>

        {previewQuestions.length > 0 && (
          <div className="flex-1 flex flex-col overflow-hidden border rounded-md">
            <h3 className="text-lg font-semibold p-4 border-b">Question Preview ({previewQuestions.length})</h3>
            <ScrollArea className="flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Answer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewQuestions.map((q, i) => (
                    <TableRow key={i}>
                      <TableCell className="max-w-xs truncate">{q.text}</TableCell>
                      <TableCell>{q.topic}</TableCell>
                      <TableCell><Badge variant="outline">{q.difficulty}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate">{q.answer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAddQuestionsToBank} disabled={previewQuestions.length === 0}>
            Add {previewQuestions.length > 0 ? previewQuestions.length : ''} Questions to Bank
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}