
'use client';

import { useState, useRef, useMemo } from 'react';
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
import { CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';


type CsvUploaderProps = {
  children: React.ReactNode;
  addImportedQuestions: (questions: Omit<Question, 'id'>[]) => void;
  addQuestionsToExam: (questions: Question[]) => void;
  existingQuestions: Question[];
};

type ParsedQuestion = Omit<Question, 'id'>;

export function CsvUploader({ children, addImportedQuestions, addQuestionsToExam, existingQuestions }: CsvUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textData, setTextData] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [manualTopic, setManualTopic] = useState<string>('');
  const [manualBoardType, setManualBoardType] = useState('');
  const [manualBoardName, setManualBoardName] = useState('');
  const [manualVertical, setManualVertical] = useState<string>('');

  const [newQuestions, setNewQuestions] = useState<ParsedQuestion[]>([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState<Question[]>([]);
  const [selectedNew, setSelectedNew] = useState<number[]>([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setTextData('');
      setNewQuestions([]);
      setDuplicateQuestions([]);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextData(event.target.value);
    setFile(null);
    setNewQuestions([]);
    setDuplicateQuestions([]);
  };

  const resetState = () => {
    setFile(null);
    setTextData('');
    setNewQuestions([]);
    setDuplicateQuestions([]);
    setSelectedNew([]);
    setSelectedDuplicates([]);
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
    setNewQuestions([]);
    setDuplicateQuestions([]);
    setSelectedNew([]);
    setSelectedDuplicates([]);

    const existingQuestionMap = new Map(existingQuestions.filter(q => q.text).map(q => [q.text.trim().toLowerCase(), q]));

    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedNew: ParsedQuestion[] = [];
          const parsedDuplicates: Question[] = [];

          results.data.forEach((row: any) => {
            const questionText = (row.title || 'No title provided').trim();
            if (questionText === 'No title provided') return;

            const duplicate = existingQuestionMap.get(questionText.toLowerCase());

            if (duplicate) {
              if (!parsedDuplicates.some(dq => dq.id === duplicate.id)) {
                 parsedDuplicates.push(duplicate);
              }
              return;
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
            
            parsedNew.push(question);
          });

          setNewQuestions(parsedNew);
          setDuplicateQuestions(parsedDuplicates);
          setSelectedNew(parsedNew.map((_, index) => index)); // Select all new by default

          toast({
            title: 'Preview ready',
            description: `Found ${parsedNew.length} new questions and ${parsedDuplicates.length} duplicates.`,
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

  const handleAddSelectedToBank = () => {
    const questionsToAdd = selectedNew.map(index => newQuestions[index]);
    if (questionsToAdd.length === 0) {
        toast({ variant: 'destructive', title: 'No new questions selected.'});
        return;
    }
    addImportedQuestions(questionsToAdd);
    setIsOpen(false);
    resetState();
  };
  
  const handleAddSelectedToExam = () => {
    const questionsFromNew = selectedNew.map((index) => ({
        ...newQuestions[index],
        id: `import-exam-${Date.now()}-${index}`,
    }));
    const questionsFromDuplicates = duplicateQuestions.filter((q) => selectedDuplicates.includes(q.id));

    const allQuestionsForExam = [...questionsFromNew, ...questionsFromDuplicates];

    if (allQuestionsForExam.length === 0) {
      toast({ variant: 'destructive', title: 'No questions selected.'});
      return;
    }

    addQuestionsToExam(allQuestionsForExam);
    setIsOpen(false);
    resetState();
  }


  const toggleSelectNew = (index: number) => {
      setSelectedNew(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  }

  const toggleSelectAllNew = () => {
      if (selectedNew.length === newQuestions.length) {
          setSelectedNew([]);
      } else {
          setSelectedNew(newQuestions.map((_, index) => index));
      }
  }

  const toggleSelectDuplicate = (id: string) => {
      setSelectedDuplicates(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  const toggleSelectAllDuplicates = () => {
      if (selectedDuplicates.length === duplicateQuestions.length) {
          setSelectedDuplicates([]);
      } else {
          setSelectedDuplicates(duplicateQuestions.map(q => q.id));
      }
  }


  const hasPreview = newQuestions.length > 0 || duplicateQuestions.length > 0;
  const totalSelectedForExam = selectedNew.length + selectedDuplicates.length;

  const QuestionPreviewTable = ({ questions, isDuplicate = false }: { questions: (ParsedQuestion | Question)[], isDuplicate?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
            <TableHead className="w-12">
                <Checkbox 
                    checked={
                        isDuplicate 
                            ? duplicateQuestions.length > 0 && selectedDuplicates.length === duplicateQuestions.length 
                            : newQuestions.length > 0 && selectedNew.length === newQuestions.length
                    }
                    onCheckedChange={isDuplicate ? toggleSelectAllDuplicates : toggleSelectAllNew}
                    aria-label={`Select all ${isDuplicate ? 'duplicate' : 'new'} questions`}
                />
            </TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Attributes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((q, i) => (
          <TableRow key={isDuplicate ? (q as Question).id : i}>
             <TableCell>
                <Checkbox 
                    checked={isDuplicate ? selectedDuplicates.includes((q as Question).id) : selectedNew.includes(i)} 
                    onCheckedChange={() => isDuplicate ? toggleSelectDuplicate((q as Question).id) : toggleSelectNew(i)} 
                />
             </TableCell>
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
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Questions via CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file or paste data. Duplicates will be identified from the question bank.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
            <div className="space-y-4">
                <Tabs defaultValue="file" className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger value="file" className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black">Upload File</TabsTrigger>
                        <TabsTrigger value="paste" className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-black">Paste Text</TabsTrigger>
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
        
            <div className="border rounded-md flex flex-col min-h-0">
                <h3 className="text-lg font-semibold p-4 border-b shrink-0">Question Preview</h3>
                {hasPreview ? (
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            {newQuestions.length > 0 && (
                                <div className='p-4'>
                                    <h4 className='font-semibold mb-2'>New Questions ({newQuestions.length})</h4>
                                    <div className='border rounded-md'>
                                        <QuestionPreviewTable questions={newQuestions} />
                                    </div>
                                </div>
                            )}
                            {duplicateQuestions.length > 0 && (
                                <div className='p-4'>
                                    {newQuestions.length > 0 && <Separator className="my-4" />}
                                    <h4 className='font-semibold mb-2'>Found Duplicates ({duplicateQuestions.length})</h4>
                                    <div className='border rounded-md'>
                                        <QuestionPreviewTable questions={duplicateQuestions} isDuplicate={true} />
                                    </div>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-muted/20">
                        <p className="text-muted-foreground">Preview of parsed questions will appear here.</p>
                    </div>
                )}
            </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {hasPreview && (
            <>
                <Button onClick={handleAddSelectedToBank} disabled={selectedNew.length === 0}>
                    Add {selectedNew.length > 0 ? selectedNew.length : ''} New to Bank
                </Button>
                 <Button onClick={handleAddSelectedToExam} variant="secondary" disabled={totalSelectedForExam === 0}>
                    <PlusCircle className="mr-2" />
                    Add {totalSelectedForExam > 0 ? totalSelectedForExam : ''} Selected to Exam
                </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
