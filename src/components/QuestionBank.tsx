'use client';
import { useState, useMemo } from 'react';
import type { Question, QuestionSet } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Bot } from 'lucide-react';
import { AiQuestionSuggester } from './AiQuestionSuggester';
import { QuestionCard } from './QuestionCard';
import { QuestionSetCard } from './QuestionSetCard';
import { Button } from './ui/button';

type QuestionBankProps = {
  questions: Question[];
  questionSets: QuestionSet[];
  addSuggestedQuestions: (newQuestions: Omit<Question, 'id'>[]) => Question[];
};

export function QuestionBank({ questions, questionSets, addSuggestedQuestions }: QuestionBankProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const filteredQuestions = useMemo(() => {
    return questions.filter(q =>
      (q.text.toLowerCase().includes(searchTerm.toLowerCase()) || q.topic.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (subject === 'all' || q.subject === subject) &&
      (difficulty === 'all' || q.difficulty === difficulty)
    );
  }, [questions, searchTerm, subject, difficulty]);

  const allSubjects = useMemo(() => ['all', ...Array.from(new Set(questions.map(q => q.subject)))], [questions]);
  const allDifficulties = ['all', 'Easy', 'Medium', 'Hard'];

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Question Bank</CardTitle>
        <AiQuestionSuggester addSuggestedQuestions={addSuggestedQuestions}>
          <Button variant="outline" size="sm">
            <Bot className="mr-2 h-4 w-4" />
            AI Suggestions
          </Button>
        </AiQuestionSuggester>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Tabs defaultValue="questions" className="flex flex-col flex-1 overflow-hidden">
          <TabsList>
            <TabsTrigger value="questions">All Questions</TabsTrigger>
            <TabsTrigger value="sets">Question Sets</TabsTrigger>
          </TabsList>
          <TabsContent value="questions" className="flex-1 flex flex-col gap-4 overflow-hidden mt-4">
            <div className="grid sm:grid-cols-3 gap-2">
              <div className="relative sm:col-span-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search questions..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Filter by subject" /></SelectTrigger>
                <SelectContent>
                  {allSubjects.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue placeholder="Filter by difficulty" /></SelectTrigger>
                <SelectContent>
                  {allDifficulties.map(d => <SelectItem key={d} value={d}>{d === 'all' ? 'All Difficulties' : d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 pb-4">
                {filteredQuestions.map(q => <QuestionCard key={q.id} question={q} />)}
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
  );
}
