'use client';
import { useState, useMemo, useEffect } from 'react';
import type { Question, QuestionSet } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Bot, Upload, Trash2, PlusCircle, Filter } from 'lucide-react';
import { AiQuestionSuggester } from './AiQuestionSuggester';
import { QuestionCard } from './QuestionCard';
import { QuestionSetCard } from './QuestionSetCard';
import { Button } from './ui/button';
import { CsvUploader } from './CsvUploader';
import { QuestionDetailsDialog } from './QuestionDetailsDialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type QuestionBankProps = {
  questions: Question[];
  questionSets: QuestionSet[];
  addSuggestedQuestions: (newQuestions: Omit<Question, 'id'>[]) => Question[];
  addImportedQuestions: (newQuestions: Omit<Question, 'id'>[]) => void;
  addMultipleQuestionsToExam: (questionIds: string[]) => void;
  deleteQuestion: (questionId: string) => void;
  deleteMultipleQuestions: (questionIds: string[]) => void;
};

type FilterValue = string | 'all';

const FilterableSelect = ({ value, onValueChange, options, placeholder }: { value: FilterValue, onValueChange: (value: FilterValue) => void, options: string[], placeholder: string }) => {
  const [open, setOpen] = useState(false);
  
  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? 'all' : selectedValue);
    setOpen(false);
  }
  
  const displayValue = value !== 'all' ? options.find(o => o === value) || placeholder : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{displayValue}</span>
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
                value='all'
                onSelect={() => handleSelect('all')}
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
                  value={option}
                  onSelect={() => handleSelect(option)}
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

export function QuestionBank({ questions, questionSets, addSuggestedQuestions, addImportedQuestions, addMultipleQuestionsToExam, deleteQuestion, deleteMultipleQuestions }: QuestionBankProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [vertical, setVertical] = useState<FilterValue>('all');
  const [program, setProgram] = useState<FilterValue>('all');
  const [subject, setSubject] = useState<FilterValue>('all');
  const [paper, setPaper] = useState<FilterValue>('all');
  const [chapter, setChapter] = useState<FilterValue>('all');
  const [examSet, setExamSet] = useState<FilterValue>('all');
  const [topic, setTopic] = useState<FilterValue>('all');
  const [difficulty, setDifficulty] = useState<FilterValue>('all');
  const [board, setBoard] = useState<FilterValue>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [questionsToDelete, setQuestionsToDelete] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const { toast } = useToast();

  const sortedQuestions = useMemo(() => {
    if (!isClient) return [];
    return [...questions].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        if (dateB !== dateA) {
            return dateB - dateA;
        }
        return a.id.localeCompare(b.id);
    });
  }, [questions, isClient]);

  const filteredQuestions = useMemo(() => {
    return sortedQuestions.filter(q =>
      q &&
      ((q.text && q.text.toLowerCase().includes(searchTerm.toLowerCase())) || (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (vertical === 'all' || q.vertical === vertical) &&
      (program === 'all' || q.program === program) &&
      (subject === 'all' || q.subject === subject) &&
      (paper === 'all' || q.paper === paper) &&
      (chapter === 'all' || q.chapter === chapter) &&
      (examSet === 'all' || q.exam_set === examSet) &&
      (topic === 'all' || q.topic === topic) &&
      (difficulty === 'all' || q.difficulty === difficulty) &&
      (board === 'all' || q.board === board)
    );
  }, [sortedQuestions, searchTerm, vertical, program, subject, paper, chapter, examSet, topic, difficulty, board]);

  const allVerticals = useMemo(() => [...Array.from(new Set(questions.map(q => q.vertical).filter(Boolean))) as string[]], [questions]);
  const allPrograms = useMemo(() => [...Array.from(new Set(questions.map(q => q.program).filter(Boolean))) as string[]], [questions]);
  const allSubjects = useMemo(() => [...Array.from(new Set(questions.map(q => q.subject).filter(Boolean))) as string[]], [questions]);
  const allPapers = useMemo(() => [...Array.from(new Set(questions.map(q => q.paper).filter(Boolean))) as string[]], [questions]);
  const allChapters = useMemo(() => [...Array.from(new Set(questions.map(q => q.chapter).filter(Boolean))) as string[]], [questions]);
  const allExamSets = useMemo(() => [...Array.from(new Set(questions.map(q => q.exam_set).filter(Boolean))) as string[]], [questions]);
  const allTopics = useMemo(() => [...Array.from(new Set(questions.map(q => q.topic).filter(Boolean))) as string[]], [questions]);
  const allBoards = useMemo(() => [...Array.from(new Set(questions.map(q => q.board).filter(Boolean))) as string[]], [questions]);
  const allDifficulties = ['Easy', 'Medium', 'Hard'];

  const handleToggleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };
  
  const handleSelectAllVisible = () => {
    const allVisibleIds = filteredQuestions.map(q => q.id);
    const allSelected = allVisibleIds.every(id => selectedQuestions.includes(id));
    if (allSelected) {
      setSelectedQuestions(prev => prev.filter(id => !allVisibleIds.includes(id)));
    } else {
      setSelectedQuestions(prev => [...new Set([...prev, ...allVisibleIds])]);
    }
  }

  const handleAddSelectedToExam = () => {
    if (selectedQuestions.length === 0) {
      toast({
        variant: 'destructive',
        title: "No questions selected",
        description: "Please select questions to add to the exam."
      })
      return;
    }
    addMultipleQuestionsToExam(selectedQuestions);
    setSelectedQuestions([]);
  }
  
  const handleDeleteSelected = () => {
    if (selectedQuestions.length === 0) {
      toast({
        variant: 'destructive',
        title: "No questions selected",
        description: "Please select questions to delete."
      })
      return;
    }
    setQuestionsToDelete(selectedQuestions);
  }
  
  const confirmDeleteMultiple = () => {
    deleteMultipleQuestions(questionsToDelete);
    setSelectedQuestions([]);
    setQuestionsToDelete([]);
  }

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
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="questions">All Questions ({filteredQuestions.length})</TabsTrigger>
            <TabsTrigger value="sets">Question Sets ({questionSets.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="questions" className="flex-1 flex flex-col gap-4 overflow-hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search questions by text or topic..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Filter className="mr-2 h-4 w-4"/>
                    Advanced Filters
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <FilterableSelect value={vertical} onValueChange={setVertical} options={allVerticals} placeholder="All Verticals" />
                    <FilterableSelect value={program} onValueChange={setProgram} options={allPrograms} placeholder="All Programs" />
                    <FilterableSelect value={subject} onValueChange={setSubject} options={allSubjects} placeholder="All Subjects" />
                    <FilterableSelect value={paper} onValueChange={setPaper} options={allPapers} placeholder="All Papers" />
                    <FilterableSelect value={chapter} onValueChange={setChapter} options={allChapters} placeholder="All Chapters" />
                    <FilterableSelect value={examSet} onValueChange={setExamSet} options={allExamSets} placeholder="All Exam Sets" />
                    <FilterableSelect value={topic} onValueChange={setTopic} options={allTopics} placeholder="All Topics" />
                    <FilterableSelect value={board} onValueChange={setBoard} options={allBoards} placeholder="All Boards/Schools" />
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger><SelectValue placeholder="Filter by difficulty" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        {allDifficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
            </Collapsible>
             {selectedQuestions.length > 0 && (
                <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span className="text-sm font-medium">{selectedQuestions.length} questions selected</span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddSelectedToExam}><PlusCircle/> Add to Exam</Button>
                      <Button size="sm" variant="destructive" onClick={handleDeleteSelected}><Trash2/> Delete Selected</Button>
                    </div>
                </div>
            )}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 pb-4">
                 <div className="flex items-center">
                    <Button variant="link" size="sm" onClick={handleSelectAllVisible} className="p-0 h-auto">
                        Select all visible
                    </Button>
                </div>
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map(q => 
                    <QuestionCard 
                      key={q.id} 
                      question={q} 
                      onCardClick={() => setSelectedQuestion(q)}
                      onDeleteClick={(e) => { e.stopPropagation(); setQuestionToDelete(q.id);}}
                      onSelectToggle={(e) => { e.stopPropagation(); handleToggleSelectQuestion(q.id);}}
                      isSelected={selectedQuestions.includes(q.id)}
                    />
                  )
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
     <AlertDialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question from the bank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuestionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {if (questionToDelete) { deleteQuestion(questionToDelete); setQuestionToDelete(null);}}}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={questionsToDelete.length > 0} onOpenChange={(open) => !open && setQuestionsToDelete([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {questionsToDelete.length} questions from the bank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setQuestionsToDelete([])}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMultiple}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
