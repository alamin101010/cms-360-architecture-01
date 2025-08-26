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

type QuestionBankProps = {
  questions: Question[];
  questionSets: QuestionSet[];
  addSuggestedQuestions: (newQuestions: Omit<Question, 'id'>[]) => Question[];
  addImportedQuestions: (newQuestions: Omit<Question, 'id'>[]) => void;
};

export function QuestionBank({ questions, questionSets, addSuggestedQuestions, addImportedQuestions }: QuestionBankProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('all');
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const filteredQuestions = useMemo(() => {
    return questions.filter(q =>
      q &&
      ((q.text && q.text.toLowerCase().includes(searchTerm.toLowerCase())) || (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (subject === 'all' || q.subject === subject) &&
      (topic === 'all' || q.topic === topic) &&
      (difficulty === 'all' || q.difficulty === difficulty)
    );
  }, [questions, searchTerm, subject, topic, difficulty]);

  const allSubjects = useMemo(() => ['all', ...Array.from(new Set(questions.map(q => q.subject)))], [questions]);
  const allTopics = useMemo(() => ['all', ...Array.from(new Set(questions.map(q => q.topic)))], [questions]);
  const allDifficulties = ['all', 'Easy', 'Medium', 'Hard'];

  return (
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
            <TabsTrigger value="questions">All Questions</TabsTrigger>
            <TabsTrigger value="sets">Question Sets</TabsTrigger>
          </TabsList>
          <TabsContent value="questions" className="flex-1 flex flex-col gap-4 overflow-hidden mt-4">
            <div className="grid sm:grid-cols-4 gap-2">
              <div className="relative sm:col-span-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search questions..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Filter by subject" /></SelectTrigger>
                <SelectContent>
                  {allSubjects.map(s => <SelectItem key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</SelectItem>)}
                </SelectContent>
              </Select>
               <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger><SelectValue placeholder="Filter by topic" /></SelectTrigger>
                <SelectContent>
                  {allTopics.map(t => <SelectItem key={t} value={t}>{t === 'all' ? 'All Topics' : t}</SelectItem>)}
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
