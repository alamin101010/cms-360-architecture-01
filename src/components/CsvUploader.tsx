
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
  existingQuestions: Question[];
};

type ParsedQuestion = Omit<Question, 'id'>;

export function CsvUploader({ children, addImportedQuestions, existingQuestions }: CsvUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textData, setTextData] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [manualTopic, setManualTopic] = useState<string>('');
  const [manualBoardType, setManualBoardType] = useState('');
  const [manualBoardName, setManualBoardName] = useState('');
  const [manualVertical, setManualVertical] = useState<string>('');

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
    setManualBoardType('');
    setManualVertical('');
    setIsParsing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const parseData = (data: File | string) => {
    setIsParsing(true);
    setPreviewQuestions([]);
    const existingQuestionTexts = new Set(existingQuestions.map(q => q.text));

    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          let duplicateCount = 0;
          const questions = results.data.map((row: any): ParsedQuestion | null => {
            const questionText = row.title || 'No title provided';

            if (existingQuestionTexts.has(questionText)) {
                duplicateCount++;
                return null;
            }

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
              text: questionText,
              type: row.type,
              image: row.image,
              options,
              answer: options.find(o => o.isCorrect)?.text,
              subject: decodedAttrs.subject || 'Misc',
              topic: manualTopic || decodedAttrs.topics || 'Misc',
              class: decodedAttrs.class || 'Misc',
              difficulty: (decodedAttrs.difficulty as Question['difficulty']) || 'Medium',
              bloomsTaxonomyLevel: (decodedAttrs.learning_outcome as Question['bloomsTaxonomyLevel']) || 'Remembering',
              vertical: manualVertical || decodedAttrs.vertical,
              program: decodedAttrs.program,
              paper: decodedAttrs.paper,
              chapter: decodedAttrs.chapter,
              exam_set: decodedAttrs.exam_set,
              board: manualBoardType && manualBoardName ? `${manualBoardType}: ${manualBoardName}` : decodedAttrs.board,
              explanation: row.explanation,
              category: decodedAttrs.category,
              modules: decodedAttrs.modules,
              group_type: decodedAttrs.group_type,
              marks: row.marks ? parseInt(row.marks) : 1,
            };

            return question;
          }).filter((q): q is ParsedQuestion => q !== null && q.text !== 'No title provided');

          setPreviewQuestions(questions);

          let toastMessage = `Parsed ${questions.length} new questions.`;
          if (duplicateCount > 0) {
            toastMessage += ` Skipped ${duplicateCount} duplicate questions.`
          }

          toast({
            title: 'Preview ready',
            description: toastMessage,
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
            Select a CSV file or paste data. You can manually assign attributes to all imported questions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start flex-1 min-h-0">
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
                        <Label htmlFor="manual-vertical">Manual Vertical (Optional)</Label>
                        <Select value={manualVertical} onValueChange={setManualVertical}>
                            <SelectTrigger id="manual-vertical">
                                <SelectValue placeholder="Select a vertical"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="K-12">K-12</SelectItem>
                                <SelectItem value="English">English</SelectItem>
                            </SelectContent>
                        </Select>
                         <p className="text-xs text-muted-foreground mt-1">This will override any vertical from the CSV.</p>
                    </div>
                    <div>
                        <Label>Manual Attribute (Optional)</Label>
                        <div className='flex gap-2'>
                            <Input placeholder="Attribute Type (e.g. Board)" value={manualBoardType} onChange={(e) => setManualBoardType(e.target.value)} />
                            <Input placeholder="Attribute Value (e.g. Dhaka)" value={manualBoardName} onChange={(e) => setManualBoardName(e.target.value)} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">This will override any board/school from the CSV.</p>
                    </div>
                </div>
                 <Button onClick={handleParse} disabled={(!file && !textData) || isParsing}>
                    {isParsing ? 'Parsing...' : 'Parse & Preview'}
                 </Button>
            </div>
        
            <div className="flex flex-col min-h-0">
                {previewQuestions.length > 0 ? (
                    <div className="flex flex-col overflow-hidden border rounded-md h-full">
                        <h3 className="text-lg font-semibold p-4 border-b shrink-0">Question Preview ({previewQuestions.length})</h3>
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
                                <TableCell className="align-top whitespace-pre-wrap">
                                    <p className="font-medium">{q.text}</p>
                                </TableCell>
                                <TableCell className="align-top whitespace-pre-wrap">
                                    <ul className="space-y-1">
                                    {q.options?.map((opt, index) => (
                                        <li key={index} className="flex items-start text-sm">
                                        {opt.isCorrect ? <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-1" /> : <XCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0 mt-1" />}
                                        <span>{opt.text}</span>
                                        </li>
                                    ))}
                                    </ul>
                                </TableCell>
                                <TableCell className="align-top">
                                    <div className="flex flex-wrap gap-1">
                                        {q.vertical && <Badge>Vertical: {q.vertical}</Badge>}
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
                ) : (
                    <div className="flex items-center justify-center h-full border rounded-md bg-muted/20">
                        <p className="text-muted-foreground">Preview of parsed questions will appear here.</p>
                    </div>
                )}
            </div>
        </div>
        
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
