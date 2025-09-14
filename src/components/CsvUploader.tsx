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
import { CheckCircle, XCircle, PlusCircle, Replace } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';

type CsvUploaderProps = {
  children: React.ReactNode;
  addImportedQuestions: (questions: Omit<Question, 'id'>[]) => void;
  updateQuestion: (question: Question) => void;
  addQuestionsToExam: (questions: Question[]) => void;
  existingQuestions: Question[];
};

type ParsedQuestion = Omit<Question, 'id'>;
type DuplicateQuestionInfo = {
    existingQuestion: Question;
    newQuestionData: ParsedQuestion;
};

export function CsvUploader({ children, addImportedQuestions, updateQuestion, addQuestionsToExam, existingQuestions }: CsvUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textData, setTextData] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [manualTopic, setManualTopic] = useState<string>('');
  const [manualBoardType, setManualBoardType] = useState('');
  const [manualBoardName, setManualBoardName] = useState('');
  const [manualVertical, setManualVertical] = useState<string>('');

  const [newQuestions, setNewQuestions] = useState<ParsedQuestion[]>([]);
  const [duplicateQuestions, setDuplicateQuestions] = useState<DuplicateQuestionInfo[]>([]);
  const [selectedNew, setSelectedNew] = useState<number[]>([]);
  const [selectedDuplicatesForExam, setSelectedDuplicatesForExam] = useState<string[]>([]);
  const [selectedDuplicatesForUpdate, setSelectedDuplicatesForUpdate] = useState<string[]>([]);
  
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
    setSelectedDuplicatesForExam([]);
    setSelectedDuplicatesForUpdate([]);
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
    setSelectedDuplicatesForExam([]);
    setSelectedDuplicatesForUpdate([]);

    const existingQuestionMap = new Map(existingQuestions.filter(q => q.text).map(q => [q.text.trim().toLowerCase(), q]));

    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedNew: ParsedQuestion[] = [];
          const parsedDuplicates: DuplicateQuestionInfo[] = [];

          results.data.forEach((row: any) => {
            const questionText = (row.title || 'No title provided').trim();
            if (questionText === 'No title provided' || !questionText) return;

            const decodedAttrs = decodeAttributes(row);
             const options: { text: string; isCorrect: boolean }[] = [];
            for (let i = 1; i <= 4; i++) {
              if (row[`options_${i}_answer`]) {
                options.push({
                  text: row[`options_${i}_answer`],
                  isCorrect: row[`options_${i}_is_correct`] === '1' || String(row[`options_${i}_is_correct`]).toLowerCase() === 'true',
                });
              }
            }
            
            const newQuestionData: ParsedQuestion = {
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


            const existingQuestion = existingQuestionMap.get(questionText.toLowerCase());

            if (existingQuestion) {
              if (!parsedDuplicates.some(dq => dq.existingQuestion.id === existingQuestion.id)) {
                 parsedDuplicates.push({ existingQuestion, newQuestionData });
              }
            } else {
               if (!parsedNew.some(nq => nq.text.toLowerCase() === newQuestionData.text.toLowerCase())) {
                  parsedNew.push(newQuestionData);
               }
            }
          });

          setNewQuestions(parsedNew);
          setDuplicateQuestions(parsedDuplicates);
          setSelectedNew(parsedNew.map((_, index) => index)); // Select all new by default

          toast({
            title: 'Preview ready',
            description: `Found ${parsedNew.length} new questions and ${parsedDuplicates.length} potential duplicates.`,
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
    if (questionsToAdd.length > 0) {
        addImportedQuestions(questionsToAdd);
    }
    
    const questionsToUpdate = selectedDuplicatesForUpdate
        .map(id => duplicateQuestions.find(d => d.existingQuestion.id === id))
        .filter((d): d is DuplicateQuestionInfo => !!d)
        .map(d => ({ ...d.existingQuestion, ...d.newQuestionData }));
    
    if(questionsToUpdate.length > 0) {
        questionsToUpdate.forEach(q => updateQuestion(q));
        toast({ title: `${questionsToUpdate.length} existing questions updated.`})
    }

    if (questionsToAdd.length === 0 && questionsToUpdate.length === 0) {
        toast({ variant: 'destructive', title: 'No questions selected for import or update.'});
        return;
    }

    setIsOpen(false);
    resetState();
  };
  
  const handleAddSelectedToExam = () => {
    const questionsFromNew = selectedNew.map((index) => ({
        ...newQuestions[index],
        id: `import-exam-${Date.now()}-${index}`,
    }));
    const questionsFromDuplicates = duplicateQuestions
        .filter((q) => selectedDuplicatesForExam.includes(q.existingQuestion.id))
        .map(q => q.existingQuestion);

    const allQuestionsForExam = [...questionsFromNew, ...questionsFromDuplicates];

    if (allQuestionsForExam.length === 0) {
      toast({ variant: 'destructive', title: 'No questions selected.'});
      return;
    }

    addQuestionsToExam(allQuestionsForExam);
    toast({ title: `${allQuestionsForExam.length} questions added to the current exam.`});
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

  const toggleSelectDuplicateForExam = (id: string) => {
      setSelectedDuplicatesForExam(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  const toggleSelectAllDuplicatesForExam = () => {
      if (selectedDuplicatesForExam.length === duplicateQuestions.length) {
          setSelectedDuplicatesForExam([]);
      } else {
          setSelectedDuplicatesForExam(duplicateQuestions.map(q => q.existingQuestion.id));
      }
  }

  const toggleSelectDuplicateForUpdate = (id: string) => {
      setSelectedDuplicatesForUpdate(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  const toggleSelectAllDuplicatesForUpdate = () => {
      if (selectedDuplicatesForUpdate.length === duplicateQuestions.length) {
          setSelectedDuplicatesForUpdate([]);
      } else {
          setSelectedDuplicatesForUpdate(duplicateQuestions.map(q => q.existingQuestion.id));
      }
  }


  const hasPreview = newQuestions.length > 0 || duplicateQuestions.length > 0;
  const totalSelectedForExam = selectedNew.length + selectedDuplicatesForExam.length;
  const totalSelectedForBank = selectedNew.length + selectedDuplicatesForUpdate.length;

  const AttributeBadge = ({label, value}: {label: string, value: any}) => {
    if (!value) return null;
    return <Badge variant="outline">{label}: {String(value)}</Badge>
  }

  const AttributeDiff = ({ label, oldVal, newVal }: { label: string, oldVal: any, newVal: any }) => {
    const oldStr = String(oldVal || '');
    const newStr = String(newVal || '');
    if (oldStr === newStr) return <AttributeBadge label={label} value={oldStr} />;
    return (
      <div className="flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 bg-yellow-50 text-yellow-800 border-yellow-200">
        <span>{label}:</span>
        <span className="line-through text-muted-foreground">{oldStr}</span>
        <span className="font-semibold">{newStr}</span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Questions via CSV</DialogTitle>
          <DialogDescription>
            Select a CSV file or paste data. Duplicates will be identified and you can choose to merge attributes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
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
        
            <div className="border rounded-md flex flex-col min-h-0">
                <h3 className="text-lg font-semibold p-4 border-b shrink-0">Question Preview</h3>
                {hasPreview ? (
                    <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            {newQuestions.length > 0 && (
                                <div className='p-4'>
                                    <h4 className='font-semibold mb-2'>New Questions ({newQuestions.length})</h4>
                                    <div className='border rounded-md'>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12"><Checkbox checked={newQuestions.length > 0 && selectedNew.length === newQuestions.length} onCheckedChange={toggleSelectAllNew}/></TableHead>
                                                    <TableHead>Question</TableHead>
                                                    <TableHead>Attributes</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {newQuestions.map((q, i) => (
                                                <TableRow key={i}>
                                                    <TableCell><Checkbox checked={selectedNew.includes(i)} onCheckedChange={() => toggleSelectNew(i)} /></TableCell>
                                                    <TableCell className="align-top">
                                                        <p className="font-medium">{q.text}</p>
                                                        <ul className="mt-2 space-y-1">
                                                            {q.options?.map((opt, index) => (
                                                            <li key={index} className="flex items-start text-sm">
                                                                {opt.isCorrect ? <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" />}
                                                                <span>{opt.text}</span>
                                                            </li>
                                                            ))}
                                                        </ul>
                                                    </TableCell>
                                                    <TableCell className="align-top">
                                                        <div className="flex flex-wrap gap-1">
                                                           <AttributeBadge label="Vertical" value={q.vertical} />
                                                           <AttributeBadge label="Class" value={q.class} />
                                                           <AttributeBadge label="Subject" value={q.subject} />
                                                           <AttributeBadge label="Topic" value={q.topic} />
                                                           <AttributeBadge label="Difficulty" value={q.difficulty} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                            {duplicateQuestions.length > 0 && (
                                <div className='p-4'>
                                    {newQuestions.length > 0 && <Separator className="my-4" />}
                                    <h4 className='font-semibold mb-2'>Found Duplicates ({duplicateQuestions.length})</h4>
                                    <p className="text-sm text-muted-foreground mb-2">Review differences and choose to add to the exam or update the question in the bank with the new attributes.</p>
                                    <div className='border rounded-md'>
                                         <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-24 text-center">Add to Exam<br/><Checkbox checked={duplicateQuestions.length > 0 && selectedDuplicatesForExam.length === duplicateQuestions.length} onCheckedChange={toggleSelectAllDuplicatesForExam}/></TableHead>
                                                    <TableHead className="w-24 text-center">Update in Bank<br/><Checkbox checked={duplicateQuestions.length > 0 && selectedDuplicatesForUpdate.length === duplicateQuestions.length} onCheckedChange={toggleSelectAllDuplicatesForUpdate}/></TableHead>
                                                    <TableHead>Question & Attribute Differences</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {duplicateQuestions.map(d => (
                                                <TableRow key={d.existingQuestion.id}>
                                                    <TableCell className="text-center"><Checkbox checked={selectedDuplicatesForExam.includes(d.existingQuestion.id)} onCheckedChange={() => toggleSelectDuplicateForExam(d.existingQuestion.id)} /></TableCell>
                                                    <TableCell className="text-center"><Checkbox checked={selectedDuplicatesForUpdate.includes(d.existingQuestion.id)} onCheckedChange={() => toggleSelectDuplicateForUpdate(d.existingQuestion.id)} /></TableCell>
                                                    <TableCell className="align-top">
                                                        <p className="font-medium">{d.existingQuestion.text}</p>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            <AttributeDiff label="Class" oldVal={d.existingQuestion.class} newVal={d.newQuestionData.class} />
                                                            <AttributeDiff label="Subject" oldVal={d.existingQuestion.subject} newVal={d.newQuestionData.subject} />
                                                            <AttributeDiff label="Topic" oldVal={d.existingQuestion.topic} newVal={d.newQuestionData.topic} />
                                                            <AttributeDiff label="Difficulty" oldVal={d.existingQuestion.difficulty} newVal={d.newQuestionData.difficulty} />
                                                            <AttributeDiff label="Program" oldVal={d.existingQuestion.program} newVal={d.newQuestionData.program} />
                                                            <AttributeDiff label="Vertical" oldVal={d.existingQuestion.vertical} newVal={d.newQuestionData.vertical} />
                                                            <AttributeDiff label="Paper" oldVal={d.existingQuestion.paper} newVal={d.newQuestionData.paper} />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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
                <Button onClick={handleAddSelectedToBank} disabled={totalSelectedForBank === 0}>
                    <Replace className="mr-2" />
                    {selectedDuplicatesForUpdate.length > 0 ? `Update ${selectedDuplicatesForUpdate.length} & ` : ''}
                    Add {selectedNew.length > 0 ? `${selectedNew.length} New` : ''}
                    {selectedDuplicatesForUpdate.length === 0 && selectedNew.length === 0 ? 'to Bank' : ''}
                </Button>
                 <Button onClick={handleAddSelectedToExam} variant="secondary" disabled={totalSelectedForExam === 0}>
                    <PlusCircle className="mr-2" />
                    Add {totalSelectedForExam > 0 ? totalSelectedForExam : ''} to Exam
                </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}