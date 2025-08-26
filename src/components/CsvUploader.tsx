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

type CsvUploaderProps = {
  children: React.ReactNode;
  addImportedQuestions: (questions: Omit<Question, 'id'>[]) => void;
};

export function CsvUploader({ children, addImportedQuestions }: CsvUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a CSV file to upload.',
      });
      return;
    }

    setIsParsing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const questions = results.data.map((row: any) => {
            const options = [row.option1, row.option2, row.option3, row.option4].filter(Boolean);
            return {
              text: row.text,
              subject: row.subject,
              topic: row.topic,
              class: row.class,
              difficulty: row.difficulty,
              bloomsTaxonomyLevel: row.bloomsTaxonomyLevel,
              options,
              answer: row.answer,
            } as Omit<Question, 'id'>;
          });

          addImportedQuestions(questions);
          toast({
            title: 'Upload successful',
            description: `${questions.length} questions have been imported.`,
          });
          setIsOpen(false);
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Parsing error',
            description: 'Failed to parse CSV. Make sure it has the correct headers: text, subject, topic, class, difficulty, bloomsTaxonomyLevel, option1, option2, option3, option4, answer.',
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Questions via CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file with questions to upload. The first row should be a header with the following columns: `text`, `subject`, `topic`, `class`, `difficulty`, `bloomsTaxonomyLevel`, `option1`, `option2`, `option3`, `option4`, `answer`.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUpload} disabled={!file || isParsing}>
            {isParsing ? 'Parsing...' : 'Upload and Parse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
