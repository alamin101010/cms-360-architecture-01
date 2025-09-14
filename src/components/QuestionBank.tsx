
'use client';
import { useState, useMemo, useEffect } from 'react';
import type { Question, QuestionSet } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Bot, Upload, Trash2, PlusCircle, Filter, X } from 'lucide-react';
import { AiQuestionSuggester } from './AiQuestionSuggester';
import { QuestionCard } from './QuestionCard';
import { QuestionSetCard } from './QuestionSetCard';
import { Button } from './ui/button';
import { CsvUploader } from './CsvUploader';
import { QuestionDetailsDialog } from './QuestionDetailsDialog';
import { QuestionSetDetailsDialog } from './QuestionSetDetailsDialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { useToast } from '@/hooks/use-toast';
import { EditQuestionDialog } from './EditQuestionDialog';

type QuestionBankProps = {
  questions: Question[];
  addSuggestedQuestions: (newQuestions: Omit<Question, 'id'>[]) => Question[];
  addImportedQuestions: (newQuestions: Omit<Question, 'id'>[]) => void;
  addMultipleQuestionsToExam: (questionIds: string[]) => void;
  addQuestionsToExam: (questions: Question[]) => void;
  deleteQuestion: (questionId: string) => void;
  deleteMultipleQuestions: (questionIds: string[]) => void;
  updateQuestion: (question: Question) => void;
};

type FilterValue = string | null;


export function QuestionBank({ questions, addSuggestedQuestions, addImportedQuestions, addMultipleQuestionsToExam, addQuestionsToExam, deleteQuestion, deleteMultipleQuestions, updateQuestion }: QuestionBankProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [vertical, setVertical] = useState<FilterValue>(null);
  const [program, setProgram] = useState<FilterValue>(null);
  const [subject, setSubject] = useState<FilterValue>(null);
  const [paper, setPaper] = useState<FilterValue>(null);
  const [chapter, setChapter] = useState<FilterValue>(null);
  const [examSet, setExamSet] = useState<FilterValue>(null);
  const [topic, setTopic] = useState<FilterValue>(null);
  const [difficulty, setDifficulty] = useState<FilterValue>(null);
  const [board, setBoard] = useState<FilterValue>(null);
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [questionsToDelete, setQuestionsToDelete] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  const [selectedQuestionSet, setSelectedQuestionSet] = useState<QuestionSet | null>(null);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { toast } = useToast();

  const sortedQuestions = useMemo(() => {
    if (!isClient) return [];
    return [...questions].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        if (isNaN(dateA) || isNaN(dateB) || dateB !== dateA) {
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        }
        return a.id.localeCompare(b.id);
    });
  }, [questions, isClient]);

  const filteredQuestions = useMemo(() => {
    return sortedQuestions.filter(q =>
      q &&
      ((q.text && q.text.toLowerCase().includes(searchTerm.toLowerCase())) || (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (!vertical || q.vertical === vertical) &&
      (!program || q.program === program) &&
      (!subject || q.subject === subject) &&
      (!paper || q.paper === paper) &&
      (!chapter || q.chapter === chapter) &&
      (!examSet || q.exam_set === examSet) &&
      (!topic || q.topic === topic) &&
      (!difficulty || q.difficulty === difficulty) &&
      (!board || q.board === board)
    );
  }, [sortedQuestions, searchTerm, vertical, program, subject, paper, chapter, examSet, topic, difficulty, board]);

  const questionSets = useMemo(() => {
    const topics: { [key: string]: Question[] } = {};
    questions.forEach(q => {
      const topicKey = q.topic || 'Uncategorized';
      if (!topics[topicKey]) {
        topics[topicKey] = [];
      }
      topics[topicKey].push(q);
    });

    return Object.entries(topics).map(([topicName, questionsInSet]) => ({
      id: topicName, // Using topic name as a unique ID for the set
      name: topicName,
      description: `A set of ${questionsInSet.length} questions about ${topicName}.`,
      questionIds: questionsInSet.map(q => q.id)
    }));
  }, [questions]);


  const getUniqueOptions = (key: keyof Question) => {
      const allValues = questions.map(q => q[key]).filter((v): v is string => typeof v === 'string' && v.trim() !== '');
      return [...new Set(allValues)];
  }
  
  const resetFilters = () => {
    setSearchTerm('');
    setVertical(null);
    setProgram(null);
    setSubject(null);
    setPaper(null);
    setChapter(null);
    setExamSet(null);
    setTopic(null);
    setDifficulty(null);
    setBoard(null);
    toast({ title: 'Filters cleared.' });
  }

  const allVerticals = useMemo(() => getUniqueOptions('vertical'), [questions]);
  const allPrograms = useMemo(() => getUniqueOptions('program'), [questions]);
  const allSubjects = useMemo(() => getUniqueOptions('subject'), [questions]);
  const allPapers = useMemo(() => getUniqueOptions('paper'), [questions]);
  const allChapters = useMemo(() => getUniqueOptions('chapter'), [questions]);
  const allExamSets = useMemo(() => getUniqueOptions('exam_set'), [questions]);
  const allTopics = useMemo(() => getUniqueOptions('topic'), [questions]);
  const allBoards = useMemo(() => getUniqueOptions('board'), [questions]);
  const allDifficulties = useMemo(() => ['Easy', 'Medium', 'Hard'], []);
  
  const FilterableSelect = ({ value, onValueChange, options, placeholder }: { value: FilterValue, onValueChange: (value: FilterValue) => void, options: string[], placeholder: string }) => {
    if (options.length === 0) return null;
    
    return (
        <div className="relative">
            <Select value={value || ''} onValueChange={(val) => onValueChange(val || null)}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {value && (
                <Button variant="ghost" size="icon" className="absolute right-8 top-0 h-full w-8" onClick={(e) => { e.stopPropagation(); onValueChange(null); }}>
                    <X className="h-4 w-4"/>
                </Button>
            )}
        </div>
    )
  }

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

  const handleSaveQuestion = (updatedQuestion: Question) => {
    updateQuestion(updatedQuestion);
    setQuestionToEdit(null);
  };

  const hasAnyFilterOptions = useMemo(() => [allVerticals, allPrograms, allSubjects, allPapers, allChapters, allExamSets, allTopics, allBoards, allDifficulties].some(options => options.length > 0), [allVerticals, allPrograms, allSubjects, allPapers, allChapters, allExamSets, allTopics, allBoards, allDifficulties]);

  return (
    <>
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Question Bank</CardTitle>
        <div className="flex gap-2">
          <CsvUploader addImportedQuestions={addImportedQuestions} addQuestionsToExam={addQuestionsToExam} existingQuestions={questions}>
             <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
          </CsvUploader>
          <AiQuestionSuggester addSuggestedQuestions={addSuggestedQuestions} existingQuestions={questions}>
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
            {hasAnyFilterOptions && (
              <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Filter className="mr-2 h-4 w-4"/>
                      Advanced Filters
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <FilterableSelect value={vertical} onValueChange={setVertical} options={allVerticals} placeholder="Select Vertical" />
                      <FilterableSelect value={program} onValueChange={setProgram} options={allPrograms} placeholder="Select Program" />
                      <FilterableSelect value={subject} onValueChange={setSubject} options={allSubjects} placeholder="Select Subject" />
                      <FilterableSelect value={paper} onValueChange={setPaper} options={allPapers} placeholder="Select Paper" />
                      <FilterableSelect value={chapter} onValueChange={setChapter} options={allChapters} placeholder="Select Chapter" />
                      <FilterableSelect value={examSet} onValueChange={setExamSet} options={allExamSets} placeholder="Select Exam Set" />
                      <FilterableSelect value={topic} onValueChange={setTopic} options={allTopics} placeholder="Select Topic" />
                      <FilterableSelect value={board} onValueChange={setBoard} options={allBoards} placeholder="Select Board/School" />
                      <FilterableSelect value={difficulty} onValueChange={setDifficulty} options={allDifficulties} placeholder="Select Difficulty"/>
                    </div>
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <X className="mr-2 h-4 w-4"/>
                      Clear All Filters
                    </Button>
                  </CollapsibleContent>
              </Collapsible>
            )}
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
                {questionSets.map(qs => <QuestionSetCard key={qs.id} questionSet={qs} onViewClick={() => setSelectedQuestionSet(qs)}/>)}
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
            onEditClick={() => {
                setQuestionToEdit(selectedQuestion);
                setSelectedQuestion(null);
            }}
        />
    )}
     {questionToEdit && (
        <EditQuestionDialog
            question={questionToEdit}
            isOpen={!!questionToEdit}
            onOpenChange={(open) => !open && setQuestionToEdit(null)}
            onSave={handleSaveQuestion}
        />
    )}
    {selectedQuestionSet && (
        <QuestionSetDetailsDialog
            questionSet={selectedQuestionSet}
            allQuestions={questions}
            isOpen={!!selectedQuestionSet}
            onOpenChange={(open) => !open && setSelectedQuestionSet(null)}
            onQuestionClick={(question) => setSelectedQuestion(question)}
            onEditClick={(question) => {
                setQuestionToEdit(question);
                setSelectedQuestionSet(null);
            }}
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
