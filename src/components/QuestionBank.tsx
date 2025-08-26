'use client';
import { useState, useMemo } from 'react';
import type { Question, QuestionSet } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Bot, Upload } from 'lucide-react';
import { AiQuestionSuggester } from './AiQuestionSuggester';
import { QuestionCard } from './QuestionCard';
import { QuestionSetCard } from './QuestionSetCard';
import { Button } from './ui/button';
import { CsvUploader } from './CsvUploader';
import { QuestionDetailsDialog } from './QuestionDetailsDialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type QuestionBankProps = {
  questions: Question[];
  questionSets: QuestionSet[];
  addSuggestedQuestions: (newQuestions: Omit<Question, 'id'>[]) => Question[];
  addImportedQuestions: (newQuestions: Omit<Question, 'id'>[]) => void;
};

type FilterValue = string | 'all';

const FilterableSelect = ({ value, onValueChange, options, placeholder }: { value: FilterValue, onValueChange: (value: FilterValue) => void, options: string[], placeholder: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value !== 'all' ? options.find(o => o === value) || placeholder : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onValueChange('all');
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === 'all' ? "opacity-100" : "opacity-0"
                  )}
                />
                All
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    onValueChange(option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function QuestionBank({ questions, questionSets, addSuggestedQuestions, addImportedQuestions }: QuestionBankProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [program, setProgram] = useState<FilterValue>('all');
  const [subject, setSubject] = useState<FilterValue>('all');
  const [paper, setPaper] = useState<FilterValue>('all');
  const [chapter, setChapter] = useState<FilterValue>('all');
  const [examSet, setExamSet] = useState<FilterValue>('all');
  const [difficulty, setDifficulty] = useState<FilterValue>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return sortedQuestions.filter(q =>
      q &&
      ((q.text && q.text.toLowerCase().includes(searchTerm.toLowerCase())) || (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (program === 'all' || q.program === program) &&
      (subject === 'all' || q.subject === subject) &&
      (paper === 'all' || q.paper === paper) &&
      (chapter === 'all' || q.chapter === chapter) &&
      (examSet === 'all' || q.exam_set === examSet) &&
      (difficulty === 'all' || q.difficulty === difficulty)
    );
  }, [sortedQuestions, searchTerm, program, subject, paper, chapter, examSet, difficulty]);

  const allPrograms = useMemo(() => [...Array.from(new Set(questions.map(q => q.program).filter(Boolean))) as string[]], [questions]);
  const allSubjects = useMemo(() => [...Array.from(new Set(questions.map(q => q.subject).filter(Boolean))) as string[]], [questions]);
  const allPapers = useMemo(() => [...Array.from(new Set(questions.map(q => q.paper).filter(Boolean))) as string[]], [questions]);
  const allChapters = useMemo(() => [...Array.from(new Set(questions.map(q => q.chapter).filter(Boolean))) as string[]], [questions]);
  const allExamSets = useMemo(() => [...Array.from(new Set(questions.map(q => q.exam_set).filter(Boolean))) as string[]], [questions]);
  const allDifficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <>
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Question Bank</CardTitle>
        <div className="flex gap-2">
          <CsvUploader addImportedQuestions={addImportedQuestions}>
             <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
          </CsvUploader>
          <AiQuestionSuggester addSuggestedQuestions={addSuggestedQuestions}>
            <Button variant="outline" size="sm">
              <Bot className="mr-2 h-4 w-4" />
              AI Suggestions
            </Button>
          </AiQuestionSuggester>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Tabs defaultValue="questions" className="flex flex-col flex-1 overflow-hidden">
          <TabsList>
            <TabsTrigger value="questions">All Questions ({filteredQuestions.length})</TabsTrigger>
            <TabsTrigger value="sets">Question Sets ({questionSets.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="questions" className="flex-1 flex flex-col gap-4 overflow-hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search questions by text or topic..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-3 lg:grid-cols-3 gap-2">
              <FilterableSelect value={program} onValueChange={setProgram} options={allPrograms} placeholder="All Programs" />
              <FilterableSelect value={subject} onValueChange={setSubject} options={allSubjects} placeholder="All Subjects" />
              <FilterableSelect value={paper} onValueChange={setPaper} options={allPapers} placeholder="All Papers" />
              <FilterableSelect value={chapter} onValueChange={setChapter} options={allChapters} placeholder="All Chapters" />
              <FilterableSelect value={examSet} onValueChange={setExamSet} options={allExamSets} placeholder="All Exam Sets" />
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue placeholder="Filter by difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {allDifficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 pb-4">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map(q => <QuestionCard key={q.id} question={q} onClick={() => setSelectedQuestion(q)} />)
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No questions found.</p>
                        <p className="text-sm">Try adjusting your filters or importing new questions.</p>
                    </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="sets" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full -mx-6 px-6">
              <div className="space-y-3 pb-4">
                {questionSets.map(qs => <QuestionSetCard key={qs.id} questionSet={qs} />)}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    {selectedQuestion && (
        <QuestionDetailsDialog 
            question={selectedQuestion} 
            isOpen={!!selectedQuestion} 
            onOpenChange={(open) => !open && setSelectedQuestion(null)} 
        />
    )}
    </>
  );
}
