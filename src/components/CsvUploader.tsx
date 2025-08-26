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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { decodeAttributes } from '@/data/attribute-mapping';
import { CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


type CsvUploaderProps = {
  children: React.ReactNode;
  addImportedQuestions: (questions: Omit<Question, 'id'>[]) => void;
};

type ParsedQuestion = Omit<Question, 'id'>;

export function CsvUploader({ children, addImportedQuestions }: CsvUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textData, setTextData] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [manualTopic, setManualTopic] = useState('');
  const [manualBoardType, setManualBoardType] = useState('Board');
  const [manualBoardName, setManualBoardName] = useState('');

  const [previewQuestions, setPreviewQuestions] = useState<ParsedQuestion[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setTextData('');
      setPreviewQuestions([]);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextData(event.target.value);
    setFile(null);
    setPreviewQuestions([]);
  };

  const resetState = () => {
    setFile(null);
    setTextData('');
    setPreviewQuestions([]);
    setManualTopic('');
    setManualBoardName('');
    setManualBoardType('Board');
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const parseData = (data: File | string) => {
    setIsParsing(true);
    setPreviewQuestions([]);

    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const questions = results.data.map((row: any): ParsedQuestion => {
            const options: { text: string; isCorrect: boolean }[] = [];
            for (let i = 1; i <= 4; i++) {
              if (row[`options_${i}_answer`]) {
                options.push({
                  text: row[`options_${i}_answer`],
                  isCorrect: row[`options_${i}_is_correct`] === '1' || row[`options_${i}_is_correct`] === true,
                });
              }
            }

            const decodedAttrs = decodeAttributes(row);

            const question: ParsedQuestion = {
              text: row.title || 'No title provided',
              type: row.type,
              image: row.image,
              options,
              answer: options.find(o => o.isCorrect)?.text,
              subject: decodedAttrs.subject || 'Misc',
              topic: manualTopic || decodedAttrs.topics || 'Misc',
              class: decodedAttrs.class || 'Misc',
              difficulty: (decodedAttrs.difficulty as Question['difficulty']) || 'Medium',
              bloomsTaxonomyLevel: (decodedAttrs.learning_outcome as Question['bloomsTaxonomyLevel']) || 'Remembering',
              program: decodedAttrs.program,
              paper: decodedAttrs.paper,
              chapter: decodedAttrs.chapter,
              exam_set: decodedAttrs.exam_set,
              board: manualBoardName ? `${manualBoardType}: ${manualBoardName}` : decodedAttrs.board,
              explanation: row.explanation,
              category: decodedAttrs.category,
              modules: decodedAttrs.modules,
              group_type: decodedAttrs.group_type,
              marks: row.marks ? parseInt(row.marks) : 1,
            };

            return question;
          }).filter(q => q.text && q.text !== 'No title provided');

          setPreviewQuestions(questions);
          toast({
            title: 'Preview ready',
            description: `Parsed ${questions.length} questions. Review and add them to the bank.`,
          });
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Parsing error',
            description: `An error occurred during parsing. Check the data format. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
  }

  const handleParse = () => {
    if (file) {
      parseData(file);
    } else if (textData) {
      parseData(textData);
    } else {
      toast({
        variant: 'destructive',
        title: 'No data selected',
        description: 'Please select a CSV file or paste CSV data to parse.',
      });
    }
  };

  const handleAddQuestionsToBank = () => {
    addImportedQuestions(previewQuestions);
    setIsOpen(false);
    resetState();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Questions via CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file or paste data. You can manually assign a topic or board/school/college to all imported questions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
                <Tabs defaultValue="file" className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value="file">Upload File</TabsTrigger>
                        <TabsTrigger value="paste">Paste Text</TabsTrigger>
                    </TabsList>
                    <TabsContent value="file" className="py-4">
                        <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="flex-1" />
                    </TabsContent>
                    <TabsContent value="paste" className="py-4">
                        <Textarea placeholder='Paste your CSV data here...' className='h-32' value={textData} onChange={handleTextChange}/>
                    </TabsContent>
                </Tabs>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="manual-topic">Manual Topic (Optional)</Label>
                        <Input id="manual-topic" placeholder="e.g., Final Exam Batch A" value={manualTopic} onChange={(e) => setManualTopic(e.target.value)} />
                        <p className="text-xs text-muted-foreground mt-1">This topic will override any topic from the CSV.</p>
                    </div>
                    <div>
                        <Label>Manual Board/School/College (Optional)</Label>
                        <div className='flex gap-2'>
                            <Select value={manualBoardType} onValueChange={setManualBoardType}>
                                <SelectTrigger className='w-[120px]'>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Board">Board</SelectItem>
                                    <SelectItem value="School">School</SelectItem>
                                    <SelectItem value="College">College</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input placeholder="Enter name" value={manualBoardName} onChange={(e) => setManualBoardName(e.target.value)} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">This will override any board from the CSV.</p>
                    </div>
                </div>
            </div>
        
            <div className="flex items-end justify-end h-full">
              <Button onClick={handleParse} disabled={(!file && !textData) || isParsing}>
                {isParsing ? 'Parsing...' : 'Parse & Preview'}
              </Button>
            </div>
        </div>
        
        {previewQuestions.length > 0 && (
          <div className="flex-1 flex flex-col overflow-hidden border rounded-md mt-4">
            <h3 className="text-lg font-semibold p-4 border-b">Question Preview ({previewQuestions.length})</h3>
            <ScrollArea className="flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead>Attributes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewQuestions.map((q, i) => (
                    <TableRow key={i}>
                      <TableCell className="max-w-xs align-top">
                        <p className="font-medium">{q.text}</p>
                      </TableCell>
                      <TableCell className="align-top">
                        <ul className="space-y-1">
                          {q.options?.map((opt, index) => (
                            <li key={index} className="flex items-center text-sm">
                              {opt.isCorrect ? <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" /> : <XCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />}
                              {opt.text}
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell className="max-w-xs align-top">
                         <div className="flex flex-wrap gap-1">
                            {q.class && <Badge variant="outline">Class: {q.class}</Badge>}
                            {q.subject && <Badge variant="outline">Subject: {q.subject}</Badge>}
                            {q.topic && <Badge variant="outline">Topic: {q.topic}</Badge>}
                            {q.difficulty && <Badge variant="outline">Difficulty: {q.difficulty}</Badge>}
                            {q.program && <Badge variant="outline">Program: {q.program}</Badge>}
                            {q.paper && <Badge variant="outline">Paper: {q.paper}</Badge>}
                            {q.chapter && <Badge variant="outline">Chapter: {q.chapter}</Badge>}
                            {q.exam_set && <Badge variant="outline">Exam Set: {q.exam_set}</Badge>}
                            {q.board && <Badge variant="outline">Board: {q.board}</Badge>}
                            {q.bloomsTaxonomyLevel && <Badge variant="outline">Bloom's: {q.bloomsTaxonomyLevel}</Badge>}
                         </div>
                      </TableCell>
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
