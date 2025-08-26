'use client';

import type { DragEvent } from 'react';
import { useState } from 'react';
import type { Question, QuestionSet, Exam } from '@/types';
import { allQuestions, allQuestionSets } from '@/data/mock-data';
import { Header } from '@/components/Header';
import { QuestionBank } from '@/components/QuestionBank';
import { ExamBuilder } from '@/components/ExamBuilder';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>(allQuestions);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>(allQuestionSets);
  const [currentExamQuestions, setCurrentExamQuestions] = useState<Question[]>([]);
  const [examName, setExamName] = useState('New Exam');
  const [savedExams, setSavedExams] = useLocalStorage<Exam[]>('savedExams', []);
  const { toast } = useToast();

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const questionId = e.dataTransfer.getData('questionId');
    const questionSetId = e.dataTransfer.getData('questionSetId');

    if (questionId) {
      const questionToAdd = questions.find((q) => q.id === questionId);
      if (questionToAdd && !currentExamQuestions.some(q => q.id === questionToAdd.id)) {
        setCurrentExamQuestions((prev) => [...prev, questionToAdd]);
        toast({ title: 'Question added to exam.' });
      }
    }

    if (questionSetId) {
      const set = questionSets.find(s => s.id === questionSetId);
      if (set) {
        const questionsFromSet = questions.filter(q => set.questionIds.includes(q.id));
        const newQuestions = questionsFromSet.filter(q => !currentExamQuestions.some(examQ => examQ.id === q.id));
        setCurrentExamQuestions(prev => [...prev, ...newQuestions]);
        toast({ title: `Added ${newQuestions.length} new questions from "${set.name}".` });
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const addSuggestedQuestions = (newQuestions: Omit<Question, 'id'>[]) => {
    const uniqueNewQuestions = newQuestions.filter(nq => !questions.some(q => q.text === nq.text));
    const questionsWithIds: Question[] = uniqueNewQuestions.map((q, i) => ({ ...q, id: `ai-${Date.now()}-${i}` }));
    setQuestions(prev => [...prev, ...questionsWithIds]);
    toast({ title: `${questionsWithIds.length} AI-suggested questions added to the bank.` });
    return questionsWithIds;
  };
  
  const removeQuestionFromExam = (questionId: string) => {
    setCurrentExamQuestions(prev => prev.filter(q => q.id !== questionId));
  };
  
  const saveExam = () => {
    if (examName.trim() === '' || currentExamQuestions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot save exam',
        description: 'Please provide a name and add at least one question.',
      });
      return;
    }
    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      name: examName,
      questions: currentExamQuestions,
      createdAt: new Date().toISOString(),
    };
    setSavedExams([...savedExams, newExam]);
    toast({ title: 'Exam saved successfully!' });
    setExamName('New Exam');
    setCurrentExamQuestions([]);
  };

  const clearExam = () => {
    setCurrentExamQuestions([]);
    setExamName('New Exam');
    toast({ title: 'Exam cleared.' });
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header savedExams={savedExams} />
      <main className="flex-1 grid lg:grid-cols-2 gap-6 p-4 md:p-6 overflow-hidden">
        <QuestionBank
          questions={questions}
          questionSets={questionSets}
          addSuggestedQuestions={addSuggestedQuestions}
        />
        <ExamBuilder
          examName={examName}
          setExamName={setExamName}
          currentExamQuestions={currentExamQuestions}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          removeQuestionFromExam={removeQuestionFromExam}
          saveExam={saveExam}
          clearExam={clearExam}
        />
      </main>
    </div>
  );
}
