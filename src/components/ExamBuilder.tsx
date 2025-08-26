'use client';
import type { DragEvent } from 'react';
import type { Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Save, Trash2, DraftingCompass, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarPicker } from './ui/calendar';
import { format } from 'date-fns';

type ExamDetails = {
  name: string;
  duration: number;
  negativeMarking: number;
  windowStart: string;
  windowEnd: string;
}

type ExamBuilderProps = {
  examDetails: ExamDetails;
  setExamDetails: (details: ExamDetails) => void;
  currentExamQuestions: Question[];
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  removeQuestionFromExam: (id: string) => void;
  saveExam: () => void;
  clearExam: () => void;
};

export function ExamBuilder({
  examDetails,
  setExamDetails,
  currentExamQuestions,
  onDrop,
  onDragOver,
  removeQuestionFromExam,
  saveExam,
  clearExam
}: ExamBuilderProps) {

  const handleDetailChange = (field: keyof ExamDetails, value: any) => {
    setExamDetails({ ...examDetails, [field]: value });
  }

  const handleDateChange = (field: 'windowStart' | 'windowEnd', date: Date | undefined) => {
    if (!date) return;
    const currentFieldValue = examDetails[field];
    const currentDate = currentFieldValue ? new Date(currentFieldValue) : new Date();
    currentDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    handleDetailChange(field, currentDate.toISOString());
  };

  const handleTimeChange = (field: 'windowStart' | 'windowEnd', time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const currentFieldValue = examDetails[field];
    const currentDate = currentFieldValue ? new Date(currentFieldValue) : new Date();
    currentDate.setHours(hours, minutes);
    handleDetailChange(field, currentDate.toISOString());
  };

  const handleNumericChange = (field: 'duration' | 'negativeMarking', value: string) => {
    const num = field === 'duration' ? parseInt(value) : parseFloat(value);
    handleDetailChange(field, isNaN(num) ? 0 : num);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden" >
      <CardHeader>
        <CardTitle>Exam Builder</CardTitle>
        <CardDescription>Configure exam details and drag questions here to build your exam.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className='space-y-2'>
                <Label htmlFor="examName">Exam Title</Label>
                <Input id="examName" value={examDetails.name} onChange={e => handleDetailChange('name', e.target.value)} placeholder="Enter exam name" />
            </div>
            <div className='space-y-2'>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" value={examDetails.duration || ''} onChange={e => handleNumericChange('duration', e.target.value)} />
            </div>
             <div className='space-y-2'>
                <Label htmlFor="negativeMarking">Negative Marking (%)</Label>
                <Input id="negativeMarking" type="number" value={examDetails.negativeMarking || ''} onChange={e => handleNumericChange('negativeMarking', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Exam Window</Label>
              <div className="flex gap-2">
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {examDetails.windowStart ? format(new Date(examDetails.windowStart), "PPP") : <span>Start Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarPicker
                        mode="single"
                        selected={examDetails.windowStart ? new Date(examDetails.windowStart) : undefined}
                        onSelect={(date) => handleDateChange('windowStart', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input type="time" value={examDetails.windowStart ? format(new Date(examDetails.windowStart), 'HH:mm') : ''} onChange={(e) => handleTimeChange('windowStart', e.target.value)} />
              </div>
              <div className="flex gap-2">
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {examDetails.windowEnd ? format(new Date(examDetails.windowEnd), "PPP") : <span>End Date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                      mode="single"
                      selected={examDetails.windowEnd ? new Date(examDetails.windowEnd) : undefined}
                      onSelect={(date) => handleDateChange('windowEnd', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input type="time" value={examDetails.windowEnd ? format(new Date(examDetails.windowEnd), 'HH:mm') : ''} onChange={(e) => handleTimeChange('windowEnd', e.target.value)} />
              </div>
            </div>
        </div>
        <div 
          className="flex-1 border-2 border-dashed rounded-lg p-4 bg-muted/20 flex flex-col min-h-0"
           onDrop={onDrop} onDragOver={onDragOver}
        >
          {currentExamQuestions.length === 0 ? (
            <div className="m-auto text-center text-muted-foreground">
              <DraftingCompass className="mx-auto h-12 w-12" />
              <p className="mt-2">Your exam canvas is empty.</p>
              <p className="text-sm">Drop questions from the bank to get started.</p>
            </div>
          ) : (
            <ScrollArea className="flex-1 -mx-4">
              <div className="p-4 space-y-3">
              {currentExamQuestions.map((q, index) => (
                <div key={`${q.id}-${index}`} className="group bg-card border rounded-lg p-3 flex items-start justify-between gap-4 animate-in fade-in-50">
                  <div className="flex-1">
                    <p className="text-sm">{q.text}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{q.subject}</Badge>
                      <Badge variant="outline">{q.difficulty}</Badge>
                       <Badge variant="outline">{q.bloomsTaxonomyLevel}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 group-hover:opacity-100" onClick={() => removeQuestionFromExam(q.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" onClick={clearExam}><Trash2 /> Clear</Button>
        <Button onClick={saveExam}><Save /> Save Exam</Button>
      </CardFooter>
    </Card>
  );
}
